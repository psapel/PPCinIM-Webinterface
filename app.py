from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String


from flask import Flask, request,  jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json

from py2neo import Graph
from neo4j import GraphDatabase

from elasticsearch import Elasticsearch

from gui_setup.db_login import get_odoo_credentials
from gui_setup.translator import translate_identifiers
from gui_setup.connector import connect_and_fetch_data
from gui_setup.mappings import id_to_name_mapping, id_to_duration_mapping
from gui_setup.preprocessing import extract_data
from gui_setup.model import optimization_model
from gui_setup.postprocessing import process_results

from python_files.execution_logs import total_execution
from python_files.model_execution import total_order
from python_files.odoo_connect import connect

# Import queries from the local folder
from queries.metadata import cypher_query
from queries.coolant_query import get_coolant_data
from queries.handling_device_query import get_handling_device_data
from queries.injection_molding_machine_query import run_injection_molding_machine_query


# Neo4j configuration
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"

es = Elasticsearch(hosts=['http://localhost:9200'])

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

        asset = Asset(
            asset_name=asset_name,
            asset_type=asset_type,
            asset_data=json.dumps(asset_data),
            asset_categories=json.dumps(asset_categories),
            asset_image=asset_image
        )
        db.session.add(asset)
        db.session.commit()
        return "asset created"
            
    except Exception as e:
        print(e)

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
        model_image = "models.get('modelImage')"

        model = Model(
            model_name=model_name,
            model_type=model_type,
            model_data=json.dumps(model_data),
            model_image=model_image
        )
        db.session.add(model)
        db.session.commit()
        return "model created"
            
    except Exception as e:
        print(e)  

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

    db.session.delete(asset)
    db.session.commit()

    return jsonify({'message': 'Asset deleted'}), 200

@app.route('/delete_model/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    model = Model.query.get(model_id)
    if model is None:  
        return jsonify({'message': 'Model not found'}), 404

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

        # Check if assetType matches derivedFrom value in assetData
        derived_from_value = asset_data["assetAdministrationShells"][0]["derivedFrom"]["keys"][0]["value"]
        
        if asset_type != derived_from_value:
            print(derived_from_value)
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

index_name = 'final_version'

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

    result = es.search(index= 'final_version', size=16, body=query)
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
            return jsonify(selected_models), 200
        else:
            return "No matching model found."
    return jsonify({"message": "Invalid request method"})


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


@app.route('/underlying-asset/<model_name>')
def get_asset(model_name):
    model = model_name.replace(" ID ", "-")
    new_model = model.lower()
    print(new_model)
    asset = connect(new_model)
    # asset = asset.decode("utf-8")
    asset_json = json.dumps(asset, indent=4)
    return asset


@app.route('/execution/<model_name>')
def get_execution(model_name):
    model = model_name.replace(" ID ", "-")
    new_model = model.lower()
    print(new_model)
    job_order = total_order(new_model)
    return job_order

@app.route('/api/execution_logs/<model_name>')
def get_execution_logs(model_name):
    model = model_name.replace(" ID ", "-")
    new_model = model.lower()
    print(new_model)
    logs = total_execution(new_model)
    return logs

# Define the URLs

# HandlingDevice_1 configuration
handling_device_1 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9oYW5kbGluZ0RldmljZV8x?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0hEMQ?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0hEMQ?format=json',
    'label': 'HandlingDevice_1'
}

# HandlingDevice_2 configuration
handling_device_2 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9oYW5kbGluZ0RldmljZV8y?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0hEMg?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0hEMg?format=json',
    'label': 'HandlingDevice_2'
}

# TemperatureControlUnit_1 configuration
temperature_control_unit_1 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS90ZW1wZXJhdHVyZUNvbnRyb2xVbml0XzE?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L1RDVTE?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL1RDVTE?format=json',
    'label': 'TemperatureControlUnit_1'
}

# TemperatureControlUnit_2 configuration
temperature_control_unit_2 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS90ZW1wZXJhdHVyZUNvbnRyb2xVbml0XzI?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L1RDVTI?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL1RDVTI?format=json',
    'label': 'TemperatureControlUnit_2'
}

# IMM_1 configuration
injection_molding_machine_1 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbmplY3Rpb25Nb2xkaW5nTWFjaGluZV8x?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lNTTE?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lNTTE?format=json',
    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NldHVwUGVyaXBoZXJ5L0lNTTE??format=json',
    'label': 'InjectionMoldingMachine_1'
}

# IMM_2 configuration
injection_molding_machine_2 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbmplY3Rpb25Nb2xkaW5nTWFjaGluZV8y?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lNTTI?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lNTTI?format=json',
    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NldHVwUGVyaXBoZXJ5L0lNTTI?format=json',
    'label': 'InjectionMoldingMachine_2'
}

# IMM_3 configuration
injection_molding_machine_3 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbmplY3Rpb25Nb2xkaW5nTWFjaGluZV8z?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lNTTM?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lNTTM?format=json',
    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NldHVwUGVyaXBoZXJ5L0lNTTM?format=json',
    'label': 'InjectionMoldingMachine_3'
}

# IMM_4 configuration
injection_molding_machine_4 = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbmplY3Rpb25Nb2xkaW5nTWFjaGluZV80?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lNTTQ?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lNTTQ?format=json',
    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NldHVwUGVyaXBoZXJ5L0lNTTQ?format=json',
    'label': 'InjectionMoldingMachine_4'
}

# Injection Mold configuration
injection_mold = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9tb2xkRXhhbXBsZQ?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL01vbGQ?format=json',
    'label': 'Mold'
}

# Inquiry_1 configuration
inquiry = {
    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbnF1aXJ5XzE?format=json',
    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lOUVVJUlkx?format=json',
    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lOUVVJUlkx?format=json',
    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NwZWNpZmljYXRpb25zL0lOUVVJUlkx?format=json',
    'label': 'Inquiry_1'
}

def execute_cypher_query(query, device_config, **params):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            if 'url1' in device_config and 'url3' in device_config:
                result = session.run(query, 
                                     url=device_config['url'], 
                                     label=device_config['label'], 
                                     url1=device_config['url1'], 
                                     url2=device_config['url2'], 
                                     url3=device_config['url3'], 
                                     **params)
            elif 'url1' in device_config:
                result = session.run(query, 
                                     url=device_config['url'], 
                                     label=device_config['label'], 
                                     url1=device_config['url1'], 
                                     url2=device_config['url2'], 
                                     **params)
            else:
                result = session.run(query, 
                                     url=device_config['url'], 
                                     label=device_config['label'], 
                                     url2=device_config['url2'], 
                                     **params)
            return result.data()


# Define the Cypher queries for each device
cypher_query_hd1 = cypher_query(handling_device_1['url'], handling_device_1['label'], handling_device_1['url1'], handling_device_1['url2'], None)
cypher_query_hd2 = cypher_query(handling_device_2['url'], handling_device_2['label'], handling_device_2['url1'], handling_device_2['url2'], None)
cypher_query_tcu1 = cypher_query(temperature_control_unit_1['url'], temperature_control_unit_1['label'], temperature_control_unit_1['url1'], temperature_control_unit_1['url2'], None)
cypher_query_tcu2 = cypher_query(temperature_control_unit_2['url'], temperature_control_unit_2['label'], temperature_control_unit_2['url1'], temperature_control_unit_2['url2'], None)
cypher_query_mold = cypher_query(injection_mold['url'], injection_mold['label'], None, injection_mold['url2'], None)
cypher_query_inquiry = cypher_query(inquiry['url'], inquiry['label'], inquiry['url1'], inquiry['url2'], inquiry['url3'])
cypher_query_imm1 = cypher_query(injection_molding_machine_1['url'], injection_molding_machine_1['label'], injection_molding_machine_1['url1'], injection_molding_machine_1['url2'], injection_molding_machine_1['url3'])
cypher_query_imm2 = cypher_query(injection_molding_machine_2['url'], injection_molding_machine_2['label'], injection_molding_machine_2['url1'], injection_molding_machine_2['url2'], injection_molding_machine_2['url3'])
cypher_query_imm3 = cypher_query(injection_molding_machine_3['url'], injection_molding_machine_3['label'], injection_molding_machine_3['url1'], injection_molding_machine_3['url2'], injection_molding_machine_3['url3'])
cypher_query_imm4 = cypher_query(injection_molding_machine_4['url'], injection_molding_machine_4['label'], injection_molding_machine_4['url1'], injection_molding_machine_4['url2'], injection_molding_machine_4['url3'])

# Execute the queries for each device
result_hd1 = execute_cypher_query(cypher_query_hd1, handling_device_1)
result_hd2 = execute_cypher_query(cypher_query_hd2, handling_device_2)
result_tcu1 = execute_cypher_query(cypher_query_tcu1, temperature_control_unit_1)
result_tcu2 = execute_cypher_query(cypher_query_tcu2, temperature_control_unit_2)
result_mold = execute_cypher_query(cypher_query_mold, injection_mold)
result_inuiry = execute_cypher_query(cypher_query_inquiry, inquiry)
result_imm1 = execute_cypher_query(cypher_query_imm1, injection_molding_machine_1)
result_imm2 = execute_cypher_query(cypher_query_imm2, injection_molding_machine_2)
result_imm3 = execute_cypher_query(cypher_query_imm3, injection_molding_machine_3)
result_imm4 = execute_cypher_query(cypher_query_imm4, injection_molding_machine_4)

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