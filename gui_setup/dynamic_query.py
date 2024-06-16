import json
import base64

# file that makes the dynamic query for the configuration. In the app.py, it replaces, for example:
#injection_molding_machine_4 = {
#    'url': 'http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbmplY3Rpb25Nb2xkaW5nTWFjaGluZV80?format=json',
#    'url1': 'http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lNTTQ?format=json',
#    'url2': 'http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lNTTQ?format=json',
#    'url3': 'http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NldHVwUGVyaXBoZXJ5L0lNTTQ?format=json',
#    'label': 'InjectionMoldingMachine_4'
#}

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


# Specify the directory and file name
file_path = 'C:/PPCinIM-Demonstrator/testfiles/TCU_2.json'
#file_path = 'C:/PPCinIM-Demonstrator/testfiles/HandDev_1.json'

# Open json file
with open(file_path) as file:
    result = json.load(file)

idShort_list = extract_idShort(result)
idShort = idShort_list[0]

AAS_identifier_encoded_list = extract_AAS_Identifier(result)
AAS_identifier_encoded_string = AAS_identifier_encoded_list[0]
b = base64.b64encode(bytes(AAS_identifier_encoded_string, 'utf-8')) # bytes
AAS_identifier = b.decode('utf-8') # convert bytes to string

submodel_identifier = extract_submodel_identifier(result)

# Build queriy for fetiching AAS:
AAS_address = "'url" + "':" + "'http://localhost:5001/submodels/" + AAS_identifier + "?format=json'," # add pre and suffix

# Build queries for fetiching submodels:

i = 1
submodel_list = []
for entry in submodel_identifier:
    str_nr = str(i)
    b = base64.b64encode(bytes(entry, 'utf-8')) # bytes
    base64_str = b.decode('utf-8') # convert bytes to string
    submodel_address = "'url" + str_nr + "':" + "'http://localhost:5001/submodels/" + base64_str + "?format=json'" # add pre and suffix
    submodel_list.append(submodel_address)
    i += 1
    #print(submodel_address)

# Build Final Query:

query = idShort + " = { " + AAS_address + f" {', '.join(str(submodel_address) for submodel_address in submodel_list)}, 'label': '" + idShort + "'}"

print(query)
file.close()