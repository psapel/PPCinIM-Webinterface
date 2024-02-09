from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/create_asset', methods=['POST'])
def create_asset():
    try:
        models = request.get_json()

        asset_type = models.get('assetType')
        asset_data = models.get('assetData')

        # Check if assetType matches derivedFrom value in assetData
        derived_from_value = asset_data["assetAdministrationShells"][0]["derivedFrom"]["keys"][0]["value"]

        if asset_type != derived_from_value:
            print(derived_from_value)
            return jsonify({"error": "Asset Type does not match model selection"}), 400
        else:
            # Asset creation logic 
            if models.get('assetName') and models.get('assetType') and models.get('assetData'):
                return jsonify({"message": "Asset created successfully"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to create asset"}), 500

if __name__ == '__main__':
    app.run(debug=True)
