from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/create_asset', methods=['POST'])
def create_asset():
    try:
        data = request.get_json()

        # Validate required field - assetType
        if not data.get('assetType'):
            return jsonify({"error": "AssetType is required"}), 400

        # Respond with a success message
        return jsonify({"message": "Asset type selected successfully"}), 200
    except Exception as e:
        # Handle exceptions or errors
        print(e)
        return jsonify({"error": "Failed to create asset"}), 500

if __name__ == '__main__':
    app.run(debug=True)
