from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import json
from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan
from py2neo import Graph
from neo4j import GraphDatabase, basic_auth
import os
import base64
import urllib.request
from concurrent.futures import ThreadPoolExecutor
import random
import string
import time
import importlib
import glob

from src.pages.datasources.Fetch_translator_data import fetch_URIOfTheProduct, fetch_login_data, translate_properties
from gui_setup.db_login import get_odoo_credentials
from gui_setup.translator_new import translate_identifiers
#from pages.datasources.jsonFiles.connector.odoo_connect import connect_and_fetch_data
from gui_setup.mappings import id_to_name_mapping, id_to_duration_mapping
from gui_setup.preprocessing import extract_data
#from gui_setup.SingleMachineWithSeqDepSetuptime import optimization_model
from gui_setup.postprocessing_odoo_jobnames import postprocessing
from gui_setup.extract import run_extraction

from python_files.execution_logs import total_execution

# Import queries from the local folder
from queries.coolant_query import get_coolant_data
from queries.handling_device_query import get_handling_device_data
from queries.injection_molding_machine_query import run_injection_molding_machine_query

# Elasticsearch configuration
es = Elasticsearch(hosts=['http://localhost:9200'])

app = Flask(__name__)

# Neo4j configuration
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"

# Neo4j driver with connection pooling
driver = GraphDatabase.driver(uri, auth=basic_auth(username, password), max_connection_pool_size=50)

load_dotenv()
CORS(app)

memory_storage = []

#Database starts here
class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)

# configure the SQLite database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ppcim.db"

# initialize the app with the extension
db.init_app(app)

class Asset(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    asset_name: Mapped[str] = mapped_column(unique=True, nullable=False)
    asset_type: Mapped[str] = mapped_column(nullable=False)
    asset_data: Mapped[str] = mapped_column(nullable=False)
    asset_categories: Mapped[str] = mapped_column(nullable=False)
    asset_image: Mapped[str] = mapped_column(nullable=False)

class Model(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    model_name: Mapped[str] = mapped_column(unique=True, nullable=False)
    model_type: Mapped[str] = mapped_column(nullable=False)
    model_data: Mapped[str] = mapped_column(nullable=False)
    model_image: Mapped[str]= mapped_column(nullable=True)

class DataSource(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    datasource_name: Mapped[str] = mapped_column(unique=True, nullable=False)
    datasource_type: Mapped[str] = mapped_column(nullable=False)
    datasource_data: Mapped[str] = mapped_column(nullable=False)
    

with app.app_context():
    db.create_all() 

# def base64_to_file(base64_string, filename):
#     with open(filename, 'wb') as file_to_save:
#         decoded_data = base64.b64decode(base64_string)
#         file_to_save.write(decoded_data)


#test routes for sqlalchemy
@app.route('/test', methods=['POST'])
def create_testasset():
    try:
        assets = request.get_json()

        asset_name = assets.get('assetName')
        asset_type = assets.get('assetType')
        asset_data = assets.get('assetData')
        asset_categories = assets.get('assetCategories')
        asset_image = assets.get('assetImage')
        # aasxassetfilename = models.get('aasxassetFileName')
        
        if not asset_name or not asset_type or not asset_data:
            return jsonify({"error": "Incomplete asset information provided"}), 400

        asset_type_from_data = asset_data['assetAdministrationShells'][0]['assetInformation']['assetType']
        if asset_type != asset_type_from_data:
            return jsonify({"error": "Asset Type does not match model selection"}), 400

        # Check for duplicate asset name
        if Asset.query.filter_by(asset_name=asset_name).first():
            return jsonify({"error": "Asset name already exists"}), 400

        # # Check for duplicate asset data
        # if Asset.query.filter_by(asset_data=json.dumps(asset_data)).first():
        #     return jsonify({"error": "Asset JSON data already exists"}), 400

        asset = Asset(
            asset_name=asset_name,
            asset_type=asset_type,
            asset_data=json.dumps(asset_data),
            asset_categories=json.dumps(asset_categories),
            asset_image=asset_image
        )
        db.session.add(asset)
        db.session.commit()

        folder_path = os.path.join('src', 'pages', 'asset', 'json')
        os.makedirs(folder_path, exist_ok=True)  # Ensure the directory exists
        file_path = os.path.join(folder_path, f"{asset_name}.json")
        with open(file_path, 'w') as json_file:
            json.dump(asset_data, json_file)

        return jsonify({"message": "Asset created successfully"}), 200
            
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/test2', methods=['GET'])
def get_testasset():
    try:
        # Retrieve all assets ordered by id
        assets = Asset.query.order_by(Asset.id).all()
        # Convert the query results to a list of dictionaries
        asset_dicts = [{
            "assetId": asset.id,
            "assetName": asset.asset_name,
            "assetType": asset.asset_type,
            "assetData": json.loads(asset.asset_data),
            "assetCategories": json.loads(asset.asset_categories),
            "assetImage": asset.asset_image
            } for asset in assets]
        # Return the JSON response
        return jsonify(asset_dicts)
  
    except Exception as e:
        print(e)

@app.route('/testmodel', methods=['POST'])
def create_testmodel():
    try:

        models = request.get_json()

        model_name = models.get('modelName')
        model_type = models.get('modelType')
        model_data = models.get('modelData')
        aasxfilename = models.get('aasxFileName')

        # Check if a model with the same name already exists
        existing_model = Model.query.filter_by(model_name=model_name).first()
        if existing_model:
            return jsonify({"error": "Model name already exists"}), 400

        project_root = os.path.dirname(os.path.abspath(__file__))
        json_models_dir = os.path.join(project_root, "src", "pages", "models", "jsonModels")

        os.makedirs(json_models_dir, exist_ok=True)

        json_file_path = os.path.join(json_models_dir, f"{model_name}.json")
        with open(json_file_path, 'w') as json_file:
            json.dump(model_data, json_file)

        # Now call run_extraction with the path of the newly saved file
        run_extraction(json_file_path)

        model = Model(
            model_name=model_name,
            model_type=model_type,
            model_data=json.dumps(model_data),
        )
        db.session.add(model)
        db.session.commit()

        # update_index_name()

        # print(f"After change create: {index_name}")
        # load_models(es)

        return "model created"
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

        

@app.route('/testmodel2', methods=['GET'])
def get_testmodel():
    try:
        # Retrieve all assets ordered by id
        models = Model.query.order_by(Model.id).all()
        # Convert the query results to a list of dictionaries
        model_dicts = [{
            "modelId": model.id,
            "modelName": model.model_name,
            "modelType": model.model_type,
            "modelData": json.loads(model.model_data),
            "modelImage": model.model_image
            } for model in models]
        # Return the JSON response
        return jsonify(model_dicts)
  
    except Exception as e:
        print(e)   

@app.route('/datasource', methods=['POST'])
def create_datasource():
    try:
        datasources = request.get_json()

        datasource_name = datasources.get('dataSourceName')
        datasource_type = datasources.get('dataSourceType')
        datasource_data = datasources.get('dataSourceData')
       
        # Check if a model with the same name already exists
        existing_datasource = DataSource.query.filter_by(datasource_name=datasource_name).first()
        if existing_datasource:
            return jsonify({"error": "Data source name already exists"}), 400

        project_root = os.path.dirname(os.path.abspath(__file__))
        json_datasources_dir = os.path.join(project_root, "src", "pages", "datasources", "jsonFiles")

        os.makedirs(json_datasources_dir, exist_ok=True)

        json_file_path = os.path.join(json_datasources_dir, f"{datasource_name}.json")
        with open(json_file_path, 'w') as json_file:
            json.dump(datasource_data, json_file)

        # Now call run_extraction with the path of the newly saved file
        run_extraction(json_file_path)

        datasource = DataSource(
            datasource_name=datasource_name,
            datasource_type=datasource_type,
            datasource_data=json.dumps(datasource_data),
        )
        db.session.add(datasource)
        db.session.commit()

        return "Data source created"
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

        

@app.route('/datasource2', methods=['GET'])
def get_datasources():
    try:
        # Retrieve all datasources ordered by id
        datasources = DataSource.query.order_by(DataSource.id).all()
        # Convert the query results to a list of dictionaries
        datasource_dicts = [{
            "dataSourceId": datasource.id,
            "dataSourceName": datasource.datasource_name,
            "dataSourceType": datasource.datasource_type,
            "dataSourceData": json.loads(datasource.datasource_data),
            } for datasource in datasources]
        # Return the JSON response
        return jsonify(datasource_dicts)
  
    except Exception as e:
        print(e)

@app.route('/delete_asset/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    asset = Asset.query.get(asset_id)
    if asset is None:
        return jsonify({'message': 'Asset not found'}), 404

    folder_path = os.path.join('src', 'pages', 'asset', 'json')
    file_path = os.path.join(folder_path, f"{asset.asset_name}.json")

    # Check if the file exists and delete it
    if os.path.exists(file_path):
        os.remove(file_path)    

    db.session.delete(asset)
    db.session.commit()

    return jsonify({'message': 'Asset deleted'}), 200

@app.route('/delete_model/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):


    model = Model.query.get(model_id)
    if model is None:  
        return jsonify({'message': 'Model not found'}), 404

    # Construct the path to the JSON file
    json_file_path = os.path.join('src', 'pages', 'models', 'jsonModels', f'{model.model_name}.json')

    # Check if the file exists and delete it
    if os.path.exists(json_file_path):
        os.remove(json_file_path)  

    models_new_file_path = os.path.join('src','pages','decisionsupport', 'modelsNew', f'{model.model_name}.json')

    # Check if the file exists in decisionsupport/modelsNew and delete it
    if os.path.exists(models_new_file_path):
        os.remove(models_new_file_path)      

    db.session.delete(model)
    db.session.commit()

    # update_index_name()

    # print(f"After change delete: {index_name}")
    # load_models(es)

    return jsonify({'message': 'Model deleted'}), 200

@app.route('/delete_datasource/<int:datasource_id>', methods=['DELETE'])
def delete_datasource(datasource_id):


    datasource = DataSource.query.get(datasource_id)
    if datasource is None:
        return jsonify({'message': 'Data source not found'}), 404

    # Construct the path to the JSON file for the data source
    json_file_path = os.path.join('src', 'pages', 'datasources', 'jsonDatasources', f'{datasource.datasource_name}.json')

    # Check if the file exists and delete it
    if os.path.exists(json_file_path):
        os.remove(json_file_path)

    datasources_new_file_path = os.path.join('src', 'pages', 'datasources', 'jsonFIles', f'{datasource.datasource_name}.json')

    if os.path.exists(datasources_new_file_path):
        os.remove(datasources_new_file_path)

    db.session.delete(datasource)
    db.session.commit()

    return jsonify({'message': 'Data source deleted'}), 200   


# #ppcim python script starts here
# @app.route('/api/create_asset', methods=['POST'])
# def create_asset():
#     try:
#         models = request.get_json()

#         asset_name = models.get('assetName')
#         asset_type = models.get('assetType')
#         asset_data = models.get('assetData')
#         asset_categories = models.get('assetCategories')
#         asset_image = models.get('assetImage')

#         # Check if assetType matches assetType value in assetData
#         asset_type_from_data = asset_data['assetAdministrationShells'][0]['assetInformation']['assetType']
#         if asset_type != asset_type_from_data:
#             return jsonify({"error": "Asset Type does not match model selection"}), 400

#         if asset_name and asset_type and asset_data:
#             # Store asset in memory
#             memory_storage.append({
#                 'assetType': asset_type,
#                 'assetData': asset_data,
#                 'assetName': asset_name,
#                 'assetCategories': asset_categories,
#                 'assetImage': asset_image
#             })
            
#             return jsonify({"message": "Asset created successfully"}), 200
#         else:
#             return jsonify({"error": "Incomplete asset information provided"}), 400

#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to create asset"}), 500

# # Get asset by name
# @app.route('/api/get_assets', methods=['GET'])
# def get_assets():
#     try:
#         asset = memory_storage
#         if asset:
#             return jsonify(asset), 200
#         else:
#             return jsonify({"error": "Asset not found"}), 404
#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to retrieve asset"}), 500


# @app.route('/api/search_assets', methods=['GET'])
# def search_assets():
#     try:
#         search_query = request.args.get('q')

#         # Retrieve all assets ordered by id
#         assets = Asset.query.order_by(Asset.id).all()
#         # Convert the query results to a list of dictionaries
#         asset_dicts = [{
#             "assetId": asset.id,
#             "assetName": asset.asset_name,
#             "assetType": asset.asset_type,
#             "assetData": json.loads(asset.asset_data),
#             "assetCategories": json.loads(asset.asset_categories),
#             "assetImage": asset.asset_image
#             } for asset in assets]

#         if search_query:
#             # Filter assets based on the search query
#             filtered_assets = [asset for asset in asset_dicts if
#                                any(word.lower().startswith(search_query.lower()) for word in asset['assetName'].split()) or
#                                any(word.lower().startswith(search_query.lower()) for word in asset['assetType'].split()) or
#                                any(category.lower().startswith(search_query.lower()) for category in asset['assetCategories'])]
#             return jsonify(filtered_assets), 200
#         else:
#             return jsonify(asset_dicts), 200
#     except Exception as e:
#         print(e)
#         return jsonify({"error": "Failed to retrieve assets"}), 500

# @app.route('/api/create_model', methods=['POST'])
# def create_model():
#     # Assuming you're receiving form data
#     model_name = request.form.get('modelName')
#     model_type = request.form.get('modelType')
#     model_image = request.files['modelImage']
#     model_file = request.files['modelFile']
#     aasx_file = request.files['aasxFile']

#     # Process the files as needed (e.g., save to disk, database, etc.)
#     # For demonstration, let's print some info
#     print(f"Model Name: {model_name}")
#     print(f"Model Type: {model_type}")
#     print(f"Model Image File Name: {model_image.filename}")
#     print(f"Model File Name: {model_file.filename}")
#     print(f"AASX File Name: {aasx_file.filename}")

#     # Return a response to the frontend
#     return jsonify({'message': 'Model created successfully'}), 200



index_settings = {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "refresh_interval": "5s"
    },
    "mappings": {
        "properties": {
            "GrahamNotation": {
                "type": "nested",
                "properties": {
                    "http://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment": {"type": "keyword"},
                    "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints": {"type": "keyword"},
                    "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction": {
                        "type": "keyword"}
                }
            }
        }
    }
}
    

index_name = 'ppcinim_final'
print("Was daaaas              ",index_settings["mappings"])

#if es.indices.exists(index=index_name):
    #es.indices.delete(index=index_name)
    #print(f"Index '{index_name}' wurde gelöscht.")

if not es.indices.exists(index=index_name):
    # es.indices.create(index=index_name, body={"settings": index_settings["settings"]})
    #es.indices.create(index=index_name, body={"settings": index_settings["settings"]}, mappings=index_settings["mappings"])
    es.indices.create(index=index_name, body={"settings": index_settings["settings"], "mappings": index_settings["mappings"]})

def update_index_name():
    global index_name
    print(f"Before change inside function update: {index_name}")

    random_str = ''.join(random.choice(string.digits) for _ in range(20))
    new_index_name = "my_index_" + random_str

    # new_index_name="hsadhhasd"

    # Check if the new index exists and create it if it doesn't
    if not es.indices.exists(index=new_index_name):
        try:
            #es.indices.create(index=new_index_name, body={"settings": index_settings["settings"]}, mappings=index_settings["mappings"])
            es.indices.create(index=new_index_name, body={"settings": index_settings["settings"], "mappings": index_settings["mappings"]})
            print(f"Index created: {new_index_name}")
            index_name = new_index_name  # Update global index_name only after successful creation
        except Exception as e:
            print(f"Error creating index: {e}")

    print(f"After change in update function: {index_name}")

def load_models(es):

    model_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/decisionsupport/ModelsNew'))
    models = []
    
    for filename in os.listdir(model_folder):
        if filename.endswith('.json'):
            model_path = os.path.join(model_folder, filename)
            try:
                with open(model_path, 'r', encoding='utf-8') as f:
                    model_data = json.load(f)
                    model_id = model_data.get('_id')
                    del model_data['_id']
                    es.index(index=index_name, id=model_id, body=model_data, refresh=True)
                    #print("Dieser KOMICSCHE INDEX      :",es.index(index=index_name, id=model_id, body=model_data, refresh=True))
                    #es.index(index=index_name, id=model_id, body=model_data['GrahamNotation'], refresh=True)
                    models.append(model_data)   
            except FileNotFoundError:
                print(f"Failed to load model: {model_path}")
    print("load models ran")
    return models


# loaded_models = load_models(es)

def find_matching_model(es, url1, url2, url3):
    print("hier die URLs      :", url1, url2, url3)
    len_2 = len(url2)
    len_3 = len(url3)

    query = {
    
        "query": {
            "bool": {
                "must": [
                    {
                        "nested": {
                            "path": "GrahamNotation",
                            "query": {
                                "match_phrase": {
                                    "GrahamNotation.http://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment": url1
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "GrahamNotation",
                            "query": {
                                "terms_set": {
                                    "GrahamNotation.http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints": {
                                        "terms": url2,
                                        "minimum_should_match_script": {
                                            "source": "params.num_terms",
                                            "params": {
                                                "num_terms": len(url2)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "GrahamNotation",
                            "query": {
                                "script": {
                                    "script": {
                                        "source": "doc['GrahamNotation.http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints'].length == params.fixed_array_length",
                                        "params": {
                                            "fixed_array_length": len(url2)
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "GrahamNotation",
                            "query": {
                                "terms_set": {
                                    "GrahamNotation.http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction": {
                                        "terms": url3,
                                        "minimum_should_match_script": {
                                            "source": "params.num_terms",
                                            "params": {
                                                "num_terms": len(url3)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "GrahamNotation",
                            "query": {
                                "script": {
                                    "script": {
                                        "source": "doc['GrahamNotation.http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction'].length == params.fixed_array_length",
                                        "params": {
                                            "fixed_array_length": len(url3)
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }


    
    print("Elasticsearch Query:", query)

    result = es.search(index= 'ppcinim_final', size=16, body=query)
    hits = result.get('hits', {}).get('hits', [])

    print("Number of hits:", len(hits))

    if hits:
        for hit in hits:
            source = hit.get('_source')
    return hits

def delete_index():
    
    try:
    # Initiate delete by query with refresh=True to make sure the operation is complete
        es.delete_by_query(index=index_name, body={"query": {"match_all": {}}}, refresh=True, wait_for_completion=True)
        print(f"All documents deleted from index '{index_name}'.")
    except Exception as e:
        print(f"Failed to delete documents from index '{index_name}': {str(e)}")


# read input parameters (model graham notation) from GUI
@app.route('/api/mapping', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        machine_environment = request.form.get('machine')
        scheduling_constraints = request.form.getlist('checked[]')
        scheduling_objective_function = request.form.getlist('checking[]')

    delete_index()
    load_models(es)

    matching_model = find_matching_model(es, machine_environment, scheduling_constraints, scheduling_objective_function)

    # Extract the relevant information from the hits
    selected_models = []
    for hit in matching_model:
        source = hit.get('_source', {})
        selected_models.append(source)
        
    if selected_models:
        return jsonify(selected_models), 200
    else:
        return "No matching model found."
    return jsonify({"message": "Invalid request method"})


@app.route('/api/underlying_asset', methods=['POST'])
def get_asset():
    
    # Function searches all JSON (=AAS) files of data sources within a specific directory by matching the IRI from the model signature with the IRI from the JSONs.
    # This is an exemplary  result: {'https://iop.rwth-aachen.de/PPC/1/1/odoo': {'0173-1#02-ABF201#002': 'duration_expected', '0173-1#02-XXX999#999': 'name'}, 'https://iop.rwth-aachen.de/PPC/1/1/other_db': {'0173-1#02-XXX999#HIO': 'name_whatever'}}   
    
    def translate_values(directory, source_location_dict_sorted):
        results = {}

        # Ensure the directory exists
        if not os.path.isdir(directory):
            raise FileNotFoundError(f"The directory '{directory}' does not exist.")
        # hier soll er die files nach vorkommen aufmachen, wie in source_location_dict_sorted

        # Iterate through all files in the directory
        for filename in os.listdir(directory):
            # Check if the file has a .json extension
            if filename.endswith('.json'):
                file_path = os.path.join(directory, filename)
                
                try:
                    # Open and read the JSON file
                    with open(file_path, 'r', encoding='utf-8') as file:
                        data = json.load(file)
                        
                        # Check if the 'URIOfTheProduct' matches any key in the lookup dictionary
                        #uri_of_product = data.get('URIOfTheProduct')
                        uri_of_product = fetch_URIOfTheProduct(data)
                        if uri_of_product in source_location_dict_sorted:
                            # Initialize results for the current URI if not already present. Fetches the login information for the database.
                            # Note: We assume that every source system have the same pattern regarding instance name etc. Due to demonstration purposes, we do not use a dynamic function
                            
                            instance_url, instance_name, username, password, connector_file = fetch_login_data(data)

                            if uri_of_product not in results:
                                results[uri_of_product] = {
                                    "InstanceURL": instance_url,
                                    "InstanceName": instance_name,
                                    "Username": username,
                                    "Password": password,
                                    "ConnectorFile": connector_file,
                                    'Translations': []
                                }
                            
                            translations = translate_properties(data, source_location_dict_sorted[uri_of_product])
                            results[uri_of_product]['Translations'].extend(translations)
                                                        
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON from file '{filename}': {e}")
                except Exception as e:
                    print(f"An error occurred with file '{filename}': {e}")
        
        return results
     

    # Function established connection to source system via API provided by the source systems vendor. Dynamic consideration of API-file, specified in the JSON (=AAS) of the data connector 
    def run_connect_and_fetch_data(source_system, db_prop_names):
        # Get the file name and function parameters from the user
        module_name = source_system
        function_name = "connect_and_fetch_data"
        param1 = results[source_location]['InstanceURL']
        param2 = results[source_location]['InstanceName']
        param3 = results[source_location]['Username']
        param4 = results[source_location]['Password']
        
        # Construct the module path
        module_path = f"src.pages.datasources.jsonFiles.connector.{module_name}"
        
        try:
            # Dynamically import the module
            module = importlib.import_module(module_path)
            
            # Get the function from the module
            func = getattr(module, function_name)
            
            # Call the function with parameters
            print("fetch data  ",param1, param2, param3, param4, db_prop_names)
            fetch_data = func(param1, param2, param3, param4, db_prop_names)
            print(f"Function result: {fetch_data}")
            
        except ModuleNotFoundError:
            print(f"Module '{module_path}' does not exist.")
        except AttributeError:
            print(f"Function '{function_name}' does not exist in the module '{module_path}'.")

        return fetch_data
    
    
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    source = data.get('source')
    
    if not source:
        return jsonify({"error": "No 'source' key in JSON data"}), 400
    
    print("source xxxxxxxxxxxx:", source)
    
    # From the selected models: Search the model signature, fetch all IRI source locations, eliminate duplicates, and assign the IRDIs to the source location.
    # Example: https://iop.rwth-aachen.de/PPC/1/1/odoo': ['0173-1#02-ABF201#002', '0173-1#02-XXX999#999']

    source_location_dict = {}

    for key, value in source["inputData"].items():
        source_location = value["source_location"]
        id_value = value["id"]
        if source_location in source_location_dict:
            source_location_dict[source_location].append(id_value)
        else:
            source_location_dict[source_location] = [id_value]
    
    source_location_dict_sorted = {
    key: value for key, value in sorted(source_location_dict.items(), key=lambda item: item[1])
    }
    
    
    
    # Separate the IRI of source systems to a single list
    source_location_dict_list = []
    
    #dise muss sortiert werden
    print("sl DICL     ",source_location_dict)
    print("sl DICL    sorted ",source_location_dict_sorted)

    for source_location in source_location_dict_sorted:
        source_location_dict_list.append(source_location)

    # Path where the JSON (=AAS) of the source systems are stored
    directory = os.path.abspath(os.path.join(os.path.dirname(__file__),  r'src\pages\datasources\jsonFiles\db_login'))
    
    results = translate_values(directory, source_location_dict_sorted)
    # Extract the relevant section of the JSON data

    #print("RESULTS: ",results)
    #print("SL DICT  ",source_location_dict)
    print("SL DICHT LIST  ", source_location_dict_list)
    
    #Print results for checking purposes - to be deleted
    '''
    for uri, translations in results.items():
        print(f"URI: {uri}")
        for key, value in translations.items():
            print(f"  {key} -> {value}")
    '''

    # Seperate the translated property names as a preperation for the fetching process 
    db_prop_names = []

    for key, value in results.items():
        translations = value.get('Translations', [])
        db_prop_names.extend(translations)

    combined_results = []

    for source_location in source_location_dict_list:
        translated_data = run_connect_and_fetch_data(results[source_location]['ConnectorFile'], results[source_location]['Translations'])
        combined_results += translated_data

    # Initialize dictionary to hold lists for each property name
    extracted_values = {prop_name: [] for prop_name in db_prop_names}
    print("COMBINED RESULTE       ",combined_results)
    # Extract values
    for array in combined_results:
        for entry in array:
            for prop_name in db_prop_names:
                if prop_name in entry:
                    extracted_values[prop_name].append(entry[prop_name])
    print("ext values", extracted_values)


    
    #FALSCH, da sich je nach konfiguration des modellsignatur die Reihenfolge ändert
    # gucken, wie wir das von odoo bekomkmen, weil da weiß man ja 

    #names = db_prop_names[1]
    #durations = db_prop_names[0]

    # kann ich hier so machen weil ich weiß dass in der Modellsignatur zuerst auftrtagsname, dann dauer kommt
    # reihenfolge als immer gleich ist
    #names = extracted_values['auftragsname']
    #durations = extracted_values['auftragsdauer']
    #print("WAS KOMMT DA RAUS", names, durations)
    #names = extracted_values['auftragsname']
    #durations = extracted_values['auftragsdauer']

    #print("aaaaaaaaaaa names",names,"           duration: ", durations)
    #'ModelFile': 'name_of_the_model_test2', 'Postprocessing': ['postprocessing'], 'Preprocessing':
    #print("HIER SOURCE DINGER                ", source["ModelFile"],source["Preprocessing"],source["Postprocessing"])
    
    names = extracted_values['name']
    durations = extracted_values['duration_expected']
    preprocessing = source["Preprocessing"]
    modelfile = source["ModelFile"]
    postprocessing = source["Postprocessing"]

    # Save the result in JSON format 

    response_data = {
        "names": names,
        "durations": durations,
        "preprocessing": preprocessing,
        "modelfile" : modelfile,
        "postprocessing" : postprocessing
    }
    return jsonify(response_data)


@app.route('/api/execution', methods=['POST'])
def get_execution():
    # Extract name and duration from the json
    
    data = request.get_json()
    #print("das ist data:     ", data)
    
    # Here Hardcoded values of names and durations are okay since this function directly is assigned to a specific use case, i.e., production scheduling, where the required variables has to be specified.
    names = data['names']
    durations = data['durations']
    preprocess_file = data['preprocessing']
    model_file = data['modelfile']
    postprocess_file = data['postprocessing']
    print("This is data                ",data)

    # Check, if preprocessing is present in Model Signature, if yes, execute file

    if preprocess_file != "":
        module_name = preprocess_file
        function_name = "preprocessing"

        # Construct the module path
        module_path = f"gui_setup.{module_name}"
        
        try:
            # Dynamically import the module
            module = importlib.import_module(module_path)
            
            # Get the function from the module
            func = getattr(module, function_name)
            
            # Call the function with parameters
            result_preprocessing = func()
            
        except ModuleNotFoundError:
            print(f"Module '{module_path}' does not exist.")
        except AttributeError:
            print(f"Function '{function_name}' does not exist in the module '{module_path}'.")

    # Get model file from model signature
    
    module_name = model_file
    function_name = "optimization_model"

    # Construct the module path
    module_path = f"gui_setup.{module_name}"
    
    try:
        # Dynamically import the module
        module = importlib.import_module(module_path)
        
        # Get the function from the module
        func = getattr(module, function_name)
        
        # Call the function with parameters
        result_model = func(durations,names)
        
    except ModuleNotFoundError:
        print(f"Module '{module_path}' does not exist.")
    except AttributeError:
        print(f"Function '{function_name}' does not exist in the module '{module_path}'.")
    
    
    # Check, if postprocessing is present in Model Signature, if yes, execute file
    
    if postprocess_file != "":

        module_name = postprocess_file
        function_name = "postprocessing"

        # Construct the module path
        module_path = f"gui_setup.{module_name}"
                
        try:
            # Dynamically import the module
            module = importlib.import_module(module_path)
            
            # Get the function from the module
            func = getattr(module, function_name)
            
            # Call the function with parameters
            result_postprocessing = func(result_model, names)

        except ModuleNotFoundError:
            print(f"Module '{module_path}' does not exist.")
        except AttributeError:
            print(f"Function '{function_name}' does not exist in the module '{module_path}'.")

    #print("das ist result PP               .",result_postprocessing)
    #print("das ist logs          ",logs)
    return jsonify(result_postprocessing) 



@app.route('/api/execution_logs/<model_name>')
def get_execution_logs(model_name):
    data = request.get_json()
    logs = data.get('final_logs')
    # logs = total_execution(model_name) >> old one which connects again to the odoo database
    return jsonify(logs)


#########################################################################
#############     CODE FOR USE CASE PRODUCTION PLANNING     #############
#########################################################################

def extract_idShort(data):
    return [shell['idShort'] for shell in data['assetAdministrationShells']]

def extract_AAS_Identifier(data):
    return [shell['id'] for shell in data['assetAdministrationShells']]

def extract_submodel_identifier(data):
    submodel_identifier = []
    for shell in data['assetAdministrationShells']:
        for submodel in shell['submodels']:
            for key in submodel['keys']:
                submodel_identifier.append(key['value'])
    return submodel_identifier

def determine_apoc_procedure(submodel_data):
    if 'SubmodelElementCollection' in json.dumps(submodel_data):
        return "procedure_2"
    else:
        return "procedure_1"

# Function to load JSON data from a file
def load_json_file(file_path):
    try:
        with open(file_path) as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"The file {file_path} does not exist.")
    except json.JSONDecodeError:
        print(f"Error decoding JSON from the file {file_path}.")
    return None

# Function to fetch JSON data from a URL
def fetch_json_data(url):
    try:
        with urllib.request.urlopen(url) as response:
            return json.load(response)
    except urllib.error.URLError as e:
        print(f"Error accessing URL {url}: {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from URL {url}: {e}")
    return None

# Neo4j driver with connection pooling
driver = GraphDatabase.driver(uri, auth=basic_auth(username, password), max_connection_pool_size=50)

def execute_cypher_query(query, query_params):
    with driver.session() as session:
        return session.run(query, query_params)

# Specify the directory containing the JSON files
directory_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/asset/json'))

# Initialize list to store queries and configurations
queries_and_configs = []

# Iterate over all JSON files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith(".json"):
        file_path = os.path.join(directory_path, filename)
        result = load_json_file(file_path)
        if not result:
            continue

        idShort_list = extract_idShort(result)
        if not idShort_list:
            print(f"No idShort found in {filename}.")
            continue
        idShort = idShort_list[0]

        AAS_identifier_encoded_list = extract_AAS_Identifier(result)
        if not AAS_identifier_encoded_list:
            print(f"No AAS identifier found in {filename}.")
            continue
        AAS_identifier_encoded_string = AAS_identifier_encoded_list[0]
        AAS_identifier = base64.b64encode(bytes(AAS_identifier_encoded_string, 'utf-8')).decode('utf-8')

        submodel_identifier = extract_submodel_identifier(result)

        AAS_address = f'http://localhost:5001/shells/{AAS_identifier}?format=json'
        aas_data = fetch_json_data(AAS_address)
        if not aas_data:
            continue

        assetType = aas_data.get('assetInformation', {}).get('assetType')
        if not assetType:
            print(f"No assetType found in AAS data for {filename}.")
            continue

        submodel_urls = {}
        for i, entry in enumerate(submodel_identifier, start=1):
            base64_str = base64.b64encode(bytes(entry, 'utf-8')).decode('utf-8')
            submodel_urls[f'url{i}'] = f'http://localhost:5001/submodels/{base64_str}?format=json'

        query = """
        MERGE (n:Asset {idShort: $idShort})
        SET n.label = $label, n.assetType = $assetType
        """

        device_config = {
            'idShort': idShort,
            'label': idShort,
            'assetType': assetType
        }

        queries_and_configs.append((query, device_config, submodel_urls))

def process_device_config(device_config_tuple):
    query, device_config, submodel_urls = device_config_tuple

    try:
        execute_cypher_query(query, device_config)

        relationship_query = """
        MATCH (n:Asset)
        WHERE n.assetType IS NOT NULL AND n.idShort = $idShort
        MATCH (b)
        WHERE b.idS IS NOT NULL AND n.assetType = b.idS
        MERGE (n)-[:IsA]->(b)
        """
        execute_cypher_query(relationship_query, device_config)

        for j, submodel_url in submodel_urls.items():
            submodel_data = fetch_json_data(submodel_url)
            if not submodel_data:
                continue

            procedure = determine_apoc_procedure(submodel_data)

            if procedure == "procedure_1":
                submodel_query = f"""
                MATCH (n:Asset {{idShort: $idShort}})
                CALL apoc.load.json($url) YIELD value
                WITH value.submodelElements AS elements, n
                UNWIND elements AS element
                WITH n, element
                WHERE element.modelType = 'Property' OR element.modelType = 'MultiLanguageProperty'
                WITH n, element,
                  CASE
                    WHEN element.modelType = 'MultiLanguageProperty' THEN element.value[0].text
                    ELSE element.value
                  END AS propertyValue
                SET n += apoc.map.fromPairs([[element.idShort, propertyValue]])
                """
            else:
                submodel_query = f"""
                MATCH (n:Asset {{idShort: $idShort}})
                CALL apoc.load.json($url) YIELD value
                WITH value.submodelElements AS elements, n
                UNWIND elements AS element
                WITH n, element,
                  CASE
                    WHEN element.modelType = 'Property' THEN [element]
                    ELSE []
                  END AS properties,
                  CASE
                    WHEN element.modelType = 'SubmodelElementCollection' THEN element.value
                    ELSE []
                  END AS subElements

                FOREACH (prop IN properties |
                  SET n += apoc.map.fromPairs([ [prop.idShort, prop.value] ])
                )
                FOREACH (subElem IN subElements |
                  FOREACH (_ IN CASE WHEN subElem.modelType = 'Property' THEN [1] ELSE [] END |
                    SET n += apoc.map.fromPairs([[subElem.idShort, subElem.value]])
                    FOREACH (desc IN subElem.descriptions |
                      SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
                    )
                  )
                  FOREACH (nestedSubElem IN CASE WHEN subElem.modelType = 'SubmodelElementCollection' THEN subElem.value ELSE [] END |
                    FOREACH (_ IN CASE WHEN nestedSubElem.modelType = 'Property' THEN [1] ELSE [] END |
                      SET n += apoc.map.fromPairs([[nestedSubElem.idShort, nestedSubElem.value]])
                      FOREACH (desc IN nestedSubElem.descriptions |
                        SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
                      )
                    )
                    FOREACH (deepNestedSubElem IN CASE WHEN nestedSubElem.modelType = 'SubmodelElementCollection' THEN nestedSubElem.value ELSE [] END |
                      SET n += apoc.map.fromPairs([[deepNestedSubElem.idShort, deepNestedSubElem.value]])
                        FOREACH (ts IN CASE WHEN deepNestedSubElem.idShort = 'TextStatement' THEN [deepNestedSubElem.value] ELSE [] END |
                      SET n += apoc.map.fromPairs([ ['TextStatement', ts] ])
                        )
                    )
                  )
                )
                """
            execute_cypher_query(submodel_query, {**device_config, 'url': submodel_url})

        relationship_query = """
        MATCH (n:Asset {idShort: $idShort})
        WHERE n.assetType IS NOT NULL
        MATCH (b)
        WHERE b.idS IS NOT NULL AND n.assetType = b.idS
        MERGE (n)-[:IsA]->(b)
        """
        execute_cypher_query(relationship_query, device_config)
    except Exception as e:
        print(f"An error occurred: {e}")

# Initialize ThreadPoolExecutor to run queries in parallel
executor = ThreadPoolExecutor(max_workers=10)

# Process each device configuration in parallel
futures = [executor.submit(process_device_config, config) for config in queries_and_configs]

# Ensure all threads have completed
for future in futures:
    future.result()

# Execute the three queries after nodes and properties have been added
@app.route('/query1', methods=['POST'])
def run_query1():
    coolant_data = get_coolant_data(uri, username, password)
    return jsonify(data=coolant_data, query_type='Temperature Control Unit Query')

@app.route('/query2', methods=['POST'])
def run_query2():
    handling_device_data = get_handling_device_data(uri, username, password)
    return jsonify(data=handling_device_data, query_type='Handling Device Query')

@app.route('/query3', methods=['POST'])
def run_query3():
    result = run_injection_molding_machine_query(uri, username, password)
    return jsonify(data=result, query_type='Injection Molding Machine Query')


# Properly close the Neo4j driver
driver.close()

if __name__ == '__main__':
    app.run(debug=True)