import json
import base64
import os
import urllib.request
from neo4j import GraphDatabase

# Neo4j configuration
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"

def extract_idShort(data):
    return [shell['idShort'] for shell in data['assetAdministrationShells']]

def extract_AAS_Identifier(data):
    return [shell['id'] for shell in data['assetAdministrationShells']]

def extract_submodel_identifier(data):
    submodel_identifier = []
    for shell in data['assetAdministrationShells']:
        for submodel in shell['submodels']:
            for key in submodel['keys']:
                submodel_identifier.append(key['value'])
    return submodel_identifier

def determine_apoc_procedure(submodel_url):
    try:
        with urllib.request.urlopen(submodel_url) as response:
            submodel_data = json.load(response)
    except Exception as e:
        print(f"Error accessing submodel URL {submodel_url}: {e}")
        return "procedure_1"  # Default procedure if there's an error

    # Check if submodel data contains SubmodelElementCollection
    if 'SubmodelElementCollection' in json.dumps(submodel_data):
        return "procedure_2"
    else:
        return "procedure_1"

# Specify the directory containing the JSON files
directory_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src/pages/asset/json1'))

# Initialize list to store queries and configurations
queries_and_configs = []

# Iterate over all JSON files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith(".json"):
        file_path = os.path.join(directory_path, filename)

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
        AAS_identifier = base64.b64encode(bytes(AAS_identifier_encoded_string, 'utf-8')).decode('utf-8')

        submodel_identifier = extract_submodel_identifier(result)

        AAS_address = f'http://localhost:5001/shells/{AAS_identifier}?format=json'

        try:
            # Fetch JSON data from AAS address
            with urllib.request.urlopen(AAS_address) as response:
                aas_data = json.load(response)
        except urllib.error.URLError as e:
            print(f"Error accessing AAS address {AAS_address}: {e}")
            continue
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from AAS address {AAS_address}: {e}")
            continue

        # Extract assetType from AAS data
        assetType = aas_data.get('assetInformation', {}).get('assetType')

        if not assetType:
            print(f"No assetType found in AAS data for {filename}.")
            continue

        submodel_urls = {}
        for i, entry in enumerate(submodel_identifier, start=1):
            base64_str = base64.b64encode(bytes(entry, 'utf-8')).decode('utf-8')
            submodel_urls[f'url{i}'] = f'http://localhost:5001/submodels/{base64_str}?format=json'

        # Neo4j Cypher query construction
        query = """
        MERGE (n:Asset {idShort: $idShort})
        SET n.label = $label, n.assetType = $assetType
        """

        # Prepare device_config dictionary
        device_config = {
            'idShort': idShort,
            'label': idShort,
            'assetType': assetType
        }

        queries_and_configs.append((query, device_config, submodel_urls))

def execute_cypher_query(query, query_params):
    driver = GraphDatabase.driver(uri, auth=(username, password))
    with driver.session() as session:
        result = session.run(query, query_params)
        return result

# Iterate over each device configuration
for i, (query, device_config, submodel_urls) in enumerate(queries_and_configs, start=1):
    try:
        # Execute the main Neo4j query for creating nodes and setting properties
        print(f"Executing query for device {i}: {device_config['idShort']}")
        result = execute_cypher_query(query, device_config)
        
        # Additional operations with APOC after each node creation
        try:
            # Neo4j Cypher query to create relationships and clean up node properties
            relationship_query = """
            MATCH (n:Asset)
            WHERE n.assetType IS NOT NULL AND n.idShort = $idShort
            MATCH (b)
            WHERE b.idS IS NOT NULL AND n.assetType = b.idS
            MERGE (n)-[:IsA]->(b)
            """
            execute_cypher_query(relationship_query, device_config)
            print("Relationship between nodes created successfully.")
            
            # Adding dynamic property extraction from submodel URLs
            for j in range(1, len(submodel_urls) + 1):
                submodel_url = submodel_urls[f'url{j}']
                procedure = determine_apoc_procedure(submodel_url)
                
                if procedure == "procedure_1":
                    submodel_query = f"""
                    MATCH (n:Asset {{idShort: $idShort}})
                    CALL apoc.load.json($url{j}) YIELD value
                    WITH value.submodelElements AS elements, n
                    UNWIND elements AS element
                    WITH n, element
                    WHERE element.modelType = 'Property' OR element.modelType = 'MultiLanguageProperty'
                    WITH n, element,
                      CASE
                        WHEN element.modelType = 'MultiLanguageProperty' THEN element.value[0].text
                        ELSE element.value
                      END AS propertyValue
                    SET n += apoc.map.fromPairs([[element.idShort, propertyValue]])
                    """
                else:
                    submodel_query = f"""
                    MATCH (n:Asset {{idShort: $idShort}})
                    CALL apoc.load.json($url{j}) YIELD value
                    WITH value.submodelElements AS elements, n
                    UNWIND elements AS element
                    WITH n, element,
                      CASE
                        WHEN element.modelType = 'Property' THEN [element]
                        ELSE []
                      END AS properties,
                      CASE
                        WHEN element.modelType = 'SubmodelElementCollection' THEN element.value
                        ELSE []
                      END AS subElements

                    FOREACH (prop IN properties |
                      SET n += apoc.map.fromPairs([ [prop.idShort, prop.value] ])
                    )
                    FOREACH (subElem IN subElements |
                      FOREACH (_ IN CASE WHEN subElem.modelType = 'Property' THEN [1] ELSE [] END |
                        SET n += apoc.map.fromPairs([[subElem.idShort, subElem.value]])
                        FOREACH (desc IN subElem.descriptions |
                          SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
                        )
                      )
                      FOREACH (nestedSubElem IN CASE WHEN subElem.modelType = 'SubmodelElementCollection' THEN subElem.value ELSE [] END |
                        FOREACH (_ IN CASE WHEN nestedSubElem.modelType = 'Property' THEN [1] ELSE [] END |
                          SET n += apoc.map.fromPairs([[nestedSubElem.idShort, nestedSubElem.value]])
                          FOREACH (desc IN nestedSubElem.descriptions |
                            SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
                          )
                        )
                        FOREACH (deepNestedSubElem IN CASE WHEN nestedSubElem.modelType = 'SubmodelElementCollection' THEN nestedSubElem.value ELSE [] END |
                          SET n += apoc.map.fromPairs([[deepNestedSubElem.idShort, deepNestedSubElem.value]])
                            FOREACH (ts IN CASE WHEN deepNestedSubElem.idShort = 'TextStatement' THEN [deepNestedSubElem.value] ELSE [] END |
                          SET n += apoc.map.fromPairs([ ['TextStatement', ts] ])
                            )
                        )
                      )
                    )
                    """
                
                execute_cypher_query(submodel_query, {**device_config, f'url{j}': submodel_url})
                print(f"Properties from submodel URL {j} added to asset node.")
        except Exception as e:
            print(f"An error occurred during property extraction from submodel URL {j}: {e}")

        # Add relationship creation and cleanup query after property extraction
        try:
            relationship_query = """
            MATCH (n:Asset {idShort: $idShort})
            WHERE n.assetType IS NOT NULL
            MATCH (b)
            WHERE b.idS IS NOT NULL AND n.assetType = b.idS
            MERGE (n)-[:IsA]->(b)
            """
            execute_cypher_query(relationship_query, device_config)
            print("Relationship between nodes created successfully.")
        except Exception as e:
            print(f"An error occurred during relationship creation: {e}")

    except Exception as e:
        print(f"An error occurred while executing query {i}: {e}")

