from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import json
from elasticsearch import Elasticsearch
from py2neo import Graph
from neo4j import GraphDatabase
import os
import base64
import urllib.request


from gui_setup.db_login import get_odoo_credentials
from gui_setup.translator_new import translate_identifiers
from gui_setup.connector import connect_and_fetch_data
from gui_setup.mappings import id_to_name_mapping, id_to_duration_mapping
from gui_setup.preprocessing import extract_data
from gui_setup.model import optimization_model
from gui_setup.postprocessing import process_results
from gui_setup.extract import run_extraction

from python_files.execution_logs import total_execution

# Import queries from the local folder
from queries.coolant_query import get_coolant_data
from queries.handling_device_query import get_handling_device_data
from queries.injection_molding_machine_query import run_injection_molding_machine_query

# Elasticsearch configuration
es = Elasticsearch(hosts=['http://localhost:9200'])

# Neo4j configuration
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"


app = Flask(__name__)

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

    return jsonify({'message': 'Model deleted'}), 200


#ppcim python script starts here
@app.route('/api/create_asset', methods=['POST'])
def create_asset():
    try:
        models = request.get_json()

        asset_name = models.get('assetName')
        asset_type = models.get('assetType')
        asset_data = models.get('assetData')
        asset_categories = models.get('assetCategories')
        asset_image = models.get('assetImage')

        # Check if assetType matches assetType value in assetData
        asset_type_from_data = asset_data['assetAdministrationShells'][0]['assetInformation']['assetType']
        if asset_type != asset_type_from_data:
            return jsonify({"error": "Asset Type does not match model selection"}), 400

        if asset_name and asset_type and asset_data:
            # Store asset in memory
            memory_storage.append({
                'assetType': asset_type,
                'assetData': asset_data,
                'assetName': asset_name,
                'assetCategories': asset_categories,
                'assetImage': asset_image
            })
            
            return jsonify({"message": "Asset created successfully"}), 200
        else:
            return jsonify({"error": "Incomplete asset information provided"}), 400

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to create asset"}), 500

# Get asset by name
@app.route('/api/get_assets', methods=['GET'])
def get_assets():
    try:
        asset = memory_storage
        if asset:
            return jsonify(asset), 200
        else:
            return jsonify({"error": "Asset not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to retrieve asset"}), 500


@app.route('/api/search_assets', methods=['GET'])
def search_assets():
    try:
        search_query = request.args.get('q')

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

        if search_query:
            # Filter assets based on the search query
            filtered_assets = [asset for asset in asset_dicts if
                               any(word.lower().startswith(search_query.lower()) for word in asset['assetName'].split()) or
                               any(word.lower().startswith(search_query.lower()) for word in asset['assetType'].split()) or
                               any(category.lower().startswith(search_query.lower()) for category in asset['assetCategories'])]
            return jsonify(filtered_assets), 200
        else:
            return jsonify(asset_dicts), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to retrieve assets"}), 500

@app.route('/api/create_model', methods=['POST'])
def create_model():
    # Assuming you're receiving form data
    model_name = request.form.get('modelName')
    model_type = request.form.get('modelType')
    model_image = request.files['modelImage']
    model_file = request.files['modelFile']
    aasx_file = request.files['aasxFile']

    # Process the files as needed (e.g., save to disk, database, etc.)
    # For demonstration, let's print some info
    print(f"Model Name: {model_name}")
    print(f"Model Type: {model_type}")
    print(f"Model Image File Name: {model_image.filename}")
    print(f"Model File Name: {model_file.filename}")
    print(f"AASX File Name: {aasx_file.filename}")

    # Return a response to the frontend
    return jsonify({'message': 'Model created successfully'}), 200

index_settings = {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "refresh_interval": "5s"
    },
    "mappings": {
        "properties": {
            "GrahamNotation": {
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

index_name = 'haha'

if not es.indices.exists(index=index_name):
    # es.indices.create(index=index_name, body={"settings": index_settings["settings"]})
    es.indices.create(index=index_name, body={"settings": index_settings["settings"]},
                      mappings=index_settings["mappings"])


def load_models(es):
    import os
    import json

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
                    es.index(index=index_name, id=model_id, body=model_data['GrahamNotation'])
                    print(f"Model data: {model_data}")
                    models.append(model_data)   
            except FileNotFoundError:
                print(f"Failed to load model: {model_path}")

    return models


loaded_models = load_models(es)

def find_matching_model(es, url1, url2, url3):
    len_2 = len(url2)
    len_3 = len(url3)

    query = {
        "query": {
            "bool": {
                "must":
                    [{"match_phrase": {"http://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment": url1}},
                     {"terms": {
                         "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints.keyword": url2}},
                     {
                         "script":
                             {
                                 "script":
                                     {
                                         "source": "doc['http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints.keyword'].length == params.fixed_array_length",
                                         "params": {
                                             "fixed_array_length": len_2
                                         }
                                     }
                             }
                     },
                     {
                         "terms": {
                             "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction.keyword": url3}},

                     {
                         "script":
                             {
                                 "script":
                                     {
                                         "source": "doc['http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction.keyword'].length == params.fixed_array_length",
                                         "params": {
                                             "fixed_array_length": len_3
                                             
                                         }
                                     }
                             }
                     }

                     ]

            }
        }

    }

    print("Elasticsearch Query:", query)

    result = es.search(index= 'haha', size=16, body=query)
    hits = result.get('hits', {}).get('hits', [])

    print("Number of hits:", len(hits))

    if hits:
        for hit in hits:
            source = hit.get('_source')
            print("Retrieved Document:", source)

    return hits


@app.route('/api/mapping', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        machine_environment = request.form.get('machine')
        scheduling_constraints = request.form.getlist('checked[]')
        scheduling_objective_function = request.form.getlist('checking[]')
        print("Received values:")
        print("Machine Environment:", machine_environment)
        print("Scheduling Constraints:", scheduling_constraints)
        print("Scheduling Objective Function:", scheduling_objective_function)

        matching_model = find_matching_model(es, machine_environment, scheduling_constraints,
                                             scheduling_objective_function)
        print("Matching Models:", matching_model)

        # Extract the relevant information from the hits
        selected_models = []
        for hit in matching_model:
            source = hit.get('_source', {})
            selected_models.append(source)
        
        if selected_models:
            print("selcted_models:", selected_models)
            return jsonify(selected_models), 200
        else:
            return "No matching model found."
    return jsonify({"message": "Invalid request method"})


@app.route('/api/underlying_asset', methods=['POST'])
def get_asset():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    source = data.get('source')
    print("source:", source)
    if not source:
        return jsonify({"error": "No 'source' key in JSON data"}), 400
    url, db, username, password = get_odoo_credentials()
    # Translate identifiers
    db_prop_names = translate_identifiers(source, id_to_name_mapping, id_to_duration_mapping)
    # Connect to odoo and fetch data
    db_values = connect_and_fetch_data(url, db, username, password, db_prop_names)
    # Extract 'name' and 'production_duration_expected'
    names, durations = extract_data(db_values) 
    # Save the result in JSON format  
    return jsonify({"names": names, "durations": durations})

    
@app.route('/api/execution', methods=['POST'])
def get_execution():
    # Extract name and duration from the json
    data = request.get_json()
    names = data['names']
    durations = data['durations']
    # Optimization model
    result = optimization_model(durations)
    # Optimal job order
    post_result = process_results(result, names)
    return jsonify(post_result)

@app.route('/api/execution_logs/<model_name>')
def get_execution_logs(model_name):
    logs = total_execution(model_name)
    return jsonify(logs)


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

def determine_apoc_procedure(submodel_url):
    try:
        with urllib.request.urlopen(submodel_url) as response:
            submodel_data = json.load(response)
    except Exception as e:
        print(f"Error accessing submodel URL {submodel_url}: {e}")
        return "procedure_1"  # Default procedure if there's an error

    # Check if submodel data contains SubmodelElementCollection
    if 'SubmodelElementCollection' in json.dumps(submodel_data):
        return "procedure_2"
    else:
        return "procedure_1"

# Specify the directory containing the JSON files
directory_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/asset/json'))

# Initialize list to store queries and configurations
queries_and_configs = []

# Iterate over all JSON files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith(".json"):
        file_path = os.path.join(directory_path, filename)

        try:
            with open(file_path, encoding='utf-8') as file:
                result = json.load(file)
        except FileNotFoundError:
            print(f"The file {file_path} does not exist.")
            continue
        except json.JSONDecodeError:
            print(f"Error decoding JSON from the file {file_path}.")
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

        try:
            # Fetch JSON data from AAS address
            with urllib.request.urlopen(AAS_address) as response:
                aas_data = json.load(response)
        except urllib.error.URLError as e:
            print(f"Error accessing AAS address {AAS_address}: {e}")
            continue
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from AAS address {AAS_address}: {e}")
            continue

        # Extract assetType from AAS data
        assetType = aas_data.get('assetInformation', {}).get('assetType')

        if not assetType:
            print(f"No assetType found in AAS data for {filename}.")
            continue

        submodel_urls = {}
        for i, entry in enumerate(submodel_identifier, start=1):
            base64_str = base64.b64encode(bytes(entry, 'utf-8')).decode('utf-8')
            submodel_urls[f'url{i}'] = f'http://localhost:5001/submodels/{base64_str}?format=json'

        # Neo4j Cypher query construction
        query = """
        MERGE (n:Asset {idShort: $idShort})
        SET n.url = $url, n.label = $label, n.assetType = $assetType, n.AAS_address = $AAS_address
        """

        for i in range(1, len(submodel_urls) + 1):
            query += f"""
            SET n.url{i} = $url{i}
            """

        # Prepare device_config dictionary
        device_config = {
            'idShort': idShort,
            'url': AAS_address,
            'label': idShort,
            'AAS_address': AAS_address,
            'assetType': assetType,
            **submodel_urls
        }

        queries_and_configs.append((query, device_config))

def execute_cypher_query(query, query_params):
    driver = GraphDatabase.driver(uri, auth=(username, password))
    with driver.session() as session:
        result = session.run(query, query_params)
        return result

# Iterate over each device configuration
for i, (query, device_config) in enumerate(queries_and_configs, start=1):
    try:
        # Execute the main Neo4j query for creating nodes and setting properties
        print(f"Executing query for device {i}: {device_config['idShort']}")
        result = execute_cypher_query(query, device_config)
        
        # Additional operations with APOC after each node creation
        try:
            # Neo4j Cypher query to create relationships and clean up node properties
            relationship_query = """
            MATCH (n:Asset)
            WHERE n.assetType IS NOT NULL AND n.idShort = $idShort
            MATCH (b)
            WHERE b.idS IS NOT NULL AND n.assetType = b.idS
            MERGE (n)-[:IsA]->(b)
            """
            execute_cypher_query(relationship_query, device_config)
            print("Relationship between nodes created successfully.")
            
            # Adding dynamic property extraction from submodel URLs
            for j in range(1, len(submodel_urls) + 1):
                submodel_url = device_config[f'url{j}']
                procedure = determine_apoc_procedure(submodel_url)
                
                if procedure == "procedure_1":
                    submodel_query = f"""
                    MATCH (n:Asset {{idShort: $idShort}})
                    CALL apoc.load.json(n.url{j}) YIELD value
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
                    CALL apoc.load.json(n.url{j}) YIELD value
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
                
                execute_cypher_query(submodel_query, device_config)
                print(f"Properties from submodel URL {j} added to asset node.")
        except Exception as e:
            print(f"An error occurred during property extraction from submodel URL {j}: {e}")

        # Add relationship creation and cleanup query after property extraction
        try:
            relationship_query = """
            MATCH (n:Asset {idShort: $idShort})
            WHERE n.assetType IS NOT NULL
            MATCH (b)
            WHERE b.idS IS NOT NULL AND n.assetType = b.idS
            MERGE (n)-[:IsA]->(b)
            """
            execute_cypher_query(relationship_query, device_config)
            print("Relationship between nodes created successfully.")
        except Exception as e:
            print(f"An error occurred during relationship creation: {e}")

        # Clean up node properties using apoc.map.clean
        try:
            cleanup_query = """
            MATCH (n:Asset {idShort: $idShort})
            WHERE n.assetType IS NOT NULL
            SET n = apoc.map.clean(n, ['de', 'en'], [])
            """
            execute_cypher_query(cleanup_query, device_config)
            print("Node properties cleaned up successfully.")
        except Exception as e:
            print(f"An error occurred during node property cleanup: {e}")

    except Exception as e:
        print(f"An error occurred while processing device {i}: {e}")

graph = Graph(uri, auth=(username, password))

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
    result = run_injection_molding_machine_query(graph)
    return jsonify(data=result, query_type='Injection Molding Machine Query')


  

if __name__ == '__main__':
    app.run(debug=True)