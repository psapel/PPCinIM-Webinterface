from flask import Flask, request, render_template, url_for, jsonify
from flask_cors import CORS
import json
import os

from elasticsearch import Elasticsearch

app = Flask(__name__)
CORS(app)

memory_storage = []

@app.route('/api/create_asset', methods=['POST'])
def create_asset():
    try:
        models = request.get_json()

        asset_name = models.get('assetName')
        asset_type = models.get('assetType')
        asset_data = models.get('assetData')
        asset_categories = models.get('assetCategories')

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
                'assetCategories': asset_categories
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

        if search_query:
            # Filter assets based on the search query
            filtered_assets = [asset for asset in memory_storage if
                               any(word.lower().startswith(search_query.lower()) for word in asset['assetName'].split()) or
                               any(word.lower().startswith(search_query.lower()) for word in asset['assetType'].split()) or
                               any(category.lower().startswith(search_query.lower()) for category in asset['assetCategories'])]
            return jsonify(filtered_assets), 200
        else:
            return jsonify(memory_storage), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to retrieve assets"}), 500


es = Elasticsearch(hosts=['http://localhost:9200'])

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
            

if __name__ == '__main__':
    app.run(debug=True)