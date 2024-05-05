from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String


from flask import Flask, request, render_template, url_for, send_from_directory, jsonify
from flask_cors import CORS
import json
import os

from elasticsearch import Elasticsearch

from python_files.execution_logs import total_execution
from python_files.model_execution import total_order
from python_files.odoo_connect import connect

from py2neo import Graph

# Neo4j configuration
neo4j_uri = "bolt://localhost:7687"
neo4j_username = "neo4j"
neo4j_password = "12345678"

graph = Graph(neo4j_uri, auth=(neo4j_username, neo4j_password))

# Import queries from the local folder
from queries.coolant_query import get_coolant_data
from queries.handling_device_query import get_handling_device_data
from queries.injection_molding_machine_query import run_injection_molding_machine_query


es = Elasticsearch(hosts=['http://localhost:9200'])

app = Flask(__name__)
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
    asset_type: Mapped[str] = mapped_column(unique=True, nullable=False)
    asset_data: Mapped[str] = mapped_column(unique=True, nullable=False)
    asset_categories: Mapped[str] = mapped_column(nullable=False)
    asset_image: Mapped[str] = mapped_column(nullable=False)

class Model(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    model_name: Mapped[str] = mapped_column(unique=True, nullable=False)
    model_type: Mapped[str] = mapped_column(unique=True, nullable=False)
    model_data: Mapped[str] = mapped_column(unique=True, nullable=False)
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
                    "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment": {"type": "keyword"},
                    "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints": {"type": "keyword"},
                    "https://wwwmodels_search.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction": {
                        "type": "keyword"}
                }
            }
        }
    }
}

index_name = 'mapping'

if not es.indices.exists(index=index_name):
    # es.indices.create(index=index_name, body={"settings": index_settings["settings"]})
    es.indices.create(index=index_name, body={"settings": index_settings["settings"]},
                      mappings=index_settings["mappings"])


def load_models(es):
    model_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/decisionsupport/jsonModels'))
    models = []
    for filename in os.listdir(model_folder):
        if filename.endswith('.json'):
            model_path = os.path.join(model_folder, filename)
            try:
                with open(model_path, 'r', encoding='utf-8') as f:
                    model_data = json.load(f)
                    model_id = model_data.get('_id')
                    if model_id:
                        print(f"Original Model ID: {model_id}")
                        es.index(index=index_name, id=model_id, document=model_data["GrahamNotation"])
                        print(f"Model data: {model_data}")
                        print(f"Indexed model with ID: {model_id}")
                        models.append(model_data)
                    else:
                        print(f"Model ID not found in JSON: {model_path}")
            except FileNotFoundError:
                print(f"Failed to load model: {model_path}")

    return models


# Call the load_models function to start loading the JSON files
loaded_models = load_models(es)


def find_matching_model(es, url1, url2, url3):
    len_2 = len(url2)
    len_3 = len(url3)

    query = {
        "query": {
            "bool": {
                "must":
                    [{"match_phrase": {"https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment": url1}},
                     {"terms": {
                         "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints.keyword": url2}},
                     {
                         "script":
                             {
                                 "script":
                                     {
                                         "source": "doc['https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints.keyword'].length == params.fixed_array_length",
                                         "params": {
                                             "fixed_array_length": len_2
                                         }
                                     }
                             }
                     },
                     {
                         "terms": {
                             "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction.keyword": url3}},

                     {
                         "script":
                             {
                                 "script":
                                     {
                                         "source": "doc['https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction.keyword'].length == params.fixed_array_length",
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

    result = es.search(index='new_search', size=16, body=query)
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


@app.route('/api/underlying_asset/<model_name>')
def get_asset(model_name):
    model = model_name.replace(" ID ", "-")
    new_model = model.lower()
    print(new_model)
    asset = connect(new_model)
    # asset = asset.decode("utf-8")
    asset_json = json.dumps(asset, indent=4)
    return asset


@app.route('/api/execution/<model_name>')
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


@app.route('/query1', methods=['POST'])
def run_query1():
    coolant_data = get_coolant_data(neo4j_uri, neo4j_username, neo4j_password)
    return jsonify(data=coolant_data, query_type='Temperature Control Unit Query')

@app.route('/query2', methods=['POST'])
def run_query2():
    handling_device_data = get_handling_device_data(neo4j_uri, neo4j_username, neo4j_password)
    return jsonify(data=handling_device_data, query_type='Handling Device Query')

@app.route('/query3', methods=['POST'])
def run_query3():
    result = run_injection_molding_machine_query(graph)
    return jsonify(data=result, query_type='Injection Molding Machine Query')

if __name__ == '__main__':
    app.run(debug=True)