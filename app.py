from flask import Flask, request, jsonify
from flask_cors import CORS

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
                               search_query.lower() in asset['assetName'].lower() or
                               search_query.lower() in asset['assetType'].lower() or
                               any(search_query.lower() in category.lower() for category in asset['assetCategories'])]
            return jsonify(filtered_assets), 200
        else:
            return jsonify(memory_storage), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to retrieve assets"}), 500


if __name__ == '__main__':
    app.run(debug=True)