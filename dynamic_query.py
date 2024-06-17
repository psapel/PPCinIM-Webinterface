import json
import base64
import os

# Functions to extract data
def extract_idShort(data):
    return [shell['idShort'] for shell in data['assetAdministrationShells']]

def extract_AAS_Identifier(data):
    return [shell['id'] for shell in data['assetAdministrationShells']]

def extract_submodel_identifier(data):
    submodel_identifier = []
    # Traverse through assetAdministrationShells and extract values from "submodels"
    for shell in data['assetAdministrationShells']:
        for submodel in shell['submodels']:
            for key in submodel['keys']:
                submodel_identifier.append(key['value'])
    return submodel_identifier

# Specify the directory containing the JSON files
directory_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/asset/json'))

# Initialize list to store queries
query_list = []

# Iterate over all JSON files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith(".json"):
        file_path = os.path.join(directory_path, filename)

        # Open JSON file
        try:
            with open(file_path) as file:
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
        b = base64.b64encode(bytes(AAS_identifier_encoded_string, 'utf-8'))  # bytes
        AAS_identifier = b.decode('utf-8')  # convert bytes to string

        submodel_identifier = extract_submodel_identifier(result)

        # Build query for fetching AAS:
        AAS_address = "'url': 'http://localhost:5001/submodels/" + AAS_identifier + "?format=json'"

        # Build queries for fetching submodels:
        submodel_list = []
        for i, entry in enumerate(submodel_identifier, start=1):
            b = base64.b64encode(bytes(entry, 'utf-8'))  # bytes
            base64_str = b.decode('utf-8')  # convert bytes to string
            submodel_address = f"'url{i}': 'http://localhost:5001/submodels/{base64_str}?format=json'"
            submodel_list.append(submodel_address)

        # Build Final Query:
        query = idShort + " = { " + AAS_address + f", {', '.join(submodel_list)}, 'label': '" + idShort + "' }"

        # Add query to the list
        query_list.append(query)

# Now query_list contains all your queries

# Example of accessing each query individually:
for i, query in enumerate(query_list, start=1):
    print(f"Query {i}: {query}")
