from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/create_asset', methods=['POST'])
def create_asset():
    try:
        data = request.get_json()

        # Validate required fields - assetType and assetName
        if not data.get('assetType') or not data.get('assetName'):
            return jsonify({"error": "AssetType and AssetName are required"}), 400

        # Retrieve assetType and assetName from the request data
        asset_type = data['assetType']
        asset_name = data['assetName']

        # Respond with a success message
        return jsonify({"message": f"Asset '{asset_name}' of type '{asset_type}' created successfully"}), 200
    except Exception as e:
        # Handle exceptions or errors
        print(e)
        return jsonify({"error": "Failed to create asset"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
