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

        if asset_type != derived_from_value:
            print(derived_from_value)
            return jsonify({"error": "Asset Type does not match model selection"}), 400

        if asset_name and asset_type and asset_data and asset_categories:
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


if __name__ == '__main__':
    app.run(debug=True)