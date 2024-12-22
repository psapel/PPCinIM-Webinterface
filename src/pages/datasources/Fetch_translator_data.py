def fetch_URIOfTheProduct(data):
    
    for submodel in data['submodels']:
        if submodel.get('idShort') == 'SoftwareNameplate':
            for element in submodel['submodelElements']:
                if element.get('idShort') == 'SoftwareNameplateType':
                    for value_element in element['value']:
                        if value_element.get('idShort') == 'URIOfTheProduct':
                            return value_element.get('value')


def fetch_login_data(data):

    submodels = data['submodels']

    # Initialize variables
    instance_url = instance_name = username = password = connector_file = None

    # Extract UserAdministration details
    for submodel in submodels:
        if submodel['idShort'] == "UserAdministration":
            for element in submodel['submodelElements']:
                if element['idShort'] == "Username":
                    username = element['value']
                elif element['idShort'] == "Password":
                    password = element['value']
    
    # Extract SoftwareNameplateInstance details
    for submodel in submodels:
        if submodel['idShort'] == "SoftwareNameplate":
            for element in submodel['submodelElements']:
                if element['idShort'] == "SoftwareNameplateInstance":
                    for value in element['value']:
                        if value['idShort'] == "InstanceURL":
                            instance_url = value['value']
                        elif value['idShort'] == "InstanceName":
                            instance_name = value['value']
                        elif value['idShort'] == "ConnectorFile":
                            connector_file = value['value']
    
    return instance_url, instance_name, username, password, connector_file


def translate_properties(data, model_signatur_names, source_location_keys):
    translations = []
    
    # Verknüpfe semantic IDs (source_location_keys) mit den Signaturnamen
    semantic_to_name_map = dict(zip(source_location_keys, model_signatur_names))
    
    # Find the 'DataPoints' submodel
    for submodel in data.get("submodels", []):
        if submodel.get("idShort") == "DataPoints":
            for submodel_element in submodel.get("submodelElements", []):
                for element in submodel_element.get("value", []):
                    semantic_id = element.get("semanticId", {}).get("keys", [{}])[0].get("value")
                    if semantic_id in source_location_keys:
                        # Fetch the corresponding "type": "Property" value
                        for key in element.get("value", {}).get("keys", []):
                            if key.get("type") == "Property":
                                # Hole den korrekten model_signatur_name aus der Map
                                model_name = semantic_to_name_map.get(semantic_id)
                                translations.append((model_name, key.get("value")))
    return translations


