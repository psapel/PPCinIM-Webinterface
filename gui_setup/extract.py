import os
import json
import uuid

def run_extraction(file_path):
    # Define the paths to the folders
    models_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/pages/models/jsonModels'))

    models_new_folder =  os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/pages/decisionsupport/ModelsNew'))

    # Create the target folder if it doesn't exist
    if not os.path.exists(models_new_folder):
        os.makedirs(models_new_folder)

    # Iterate through the files in the source folder
    for filename in os.listdir(models_folder):
        if filename.endswith(".json"):
            # Generate a unique ID for the JSON file
            file_id = str(uuid.uuid4())
            # Extract name from filename
            name = os.path.splitext(filename)[0].replace(" ", "_")
            
            # Create the full file paths
            src_path = os.path.join(models_folder, filename)
            dest_path = os.path.join(models_new_folder, filename)
            
            # Load the JSON file
            with open(src_path, 'r') as file:
                data = json.load(file)
            
            # Extract the "Machine Environment", "Scheduling Constraints",
            # "Objective Functions", "Input Data",
            # "Preprocessing", "Postprocessing", "Scope of Model" and "Model-id" parts
            machine_environment = None
            scheduling_constraints = []
            objective_functions = []
            input_data = None
            model_file = None
            preprocessing = None
            postprocessing = None
            scope_of_model = None
            model_id = None
            
            for submodel in data["submodels"]:
                if submodel["idShort"] == "ModelSignature":
                    for element in submodel["submodelElements"]:
                        if element["idShort"] == "PurposeProperties":
                            for value_item in element["value"]:
                                if value_item["idShort"] == "MachineEnvironment":
                                    machine_environment = value_item
                                elif value_item["idShort"] == "SchedulingConstraints":
                                    scheduling_constraints.append(value_item)
                                elif value_item["idShort"] == "SchedulingObjectiveFunction":
                                    objective_functions.append(value_item)
                            graham_data = element
                        elif element["idShort"] == "InputData":
                            input_data = element
                        #elif element["idShort"] == "ModelFile":
                            #if element["idShort"] == "ModelFileVersion":
                                #if element["idShort"] == "DigitalFile":
                                    #model_file = element                            
                        elif element["idShort"] == "Preprocessing":
                            preprocessing = element
                        elif element["idShort"] == "Postprocessing":
                            postprocessing = element
                        elif element["idShort"] == "ScopeOfModel":
                            scope_of_model = element  
                        elif element["idShort"] == "Model-Id":
                            model_id = element  
            
            # Create a dictionary to store extracted data
            required_data = {}
            graham_aas_data = {}
            input_aas_data = {}
            
            # Add a 'name' attribute based on the filename
            required_data['name'] = os.path.splitext(filename)[0].replace("Model", "model_").replace(" ", "_").lower()

            # Extract "Model-Id"
            if model_id:
                required_data['model_id'] = model_id['displayName'][0]['text']
            
            # Extract "Machine Environment"
            if machine_environment and 'valueId' in machine_environment and 'keys' in machine_environment['valueId']:
                extracted_data = {
                    machine_environment['semanticId']['keys'][0]['value']: machine_environment['valueId']['keys'][0]['value']
                }
                graham_aas_data.update(extracted_data)
                
            # Extract "Scheduling Constraints" 
            if scheduling_constraints:
                for constraint in scheduling_constraints:
                    if 'semanticId' in constraint and 'keys' in constraint['semanticId']:
                        key = constraint['semanticId']['keys'][0]['value']
                        value_ids = [value_id['value'] for value_id in constraint.get('valueId', {}).get('keys', [])]
                        if value_ids:
                            extracted_data[key] = value_ids
                            graham_aas_data.update(extracted_data)
                
            # Extract "Objective Functions" 
            if objective_functions:
                for function in objective_functions:
                    if 'semanticId' in function and 'keys' in function['semanticId']:
                        key = function['semanticId']['keys'][0]['value']
                        value_ids = [value_id['value'] for value_id in function.get('valueId', {}).get('keys', [])]
                        if value_ids:
                            extracted_data[key] = value_ids
                            graham_aas_data.update(extracted_data)
                    
            # Extract "Input Data" 
            #if input_data:
                #for item in input_data.get("value", []):
                    #if 'value' in item and 'keys' in item['value'] and len(item['value']['keys']) > 1:
                        #required_data[item['idShort']] = item['value']['keys'][1]['value']         
    
            if input_data:
                for submodel in data.get("submodels", []):
                    for element in submodel.get("submodelElements", []):
                        if element.get("idShort") == "InputData":
                            # Iterate over the items in "InputData" to extract the necessary fields
                            for item in element.get("value", []):
                                id_short = item.get("idShort")
                                value_keys = item.get("value", {}).get("keys", [])
                                
                                # Extract id and source_location
                                if len(value_keys) >= 2:
                                    source_location = value_keys[0].get("value")
                                    id_value = value_keys[1].get("value")
                                    
                                    # Construct the entry in the input_data dictionary
                                    input_aas_data[id_short] = {
                                        "id": id_value,
                                        "source_location": source_location
                                    }
            
            # Extract "Model FIle"
            for submodel in data.get('submodels', []):
                for element in submodel.get('submodelElements', []):
                    if element.get('idShort') == 'ModelFile':
                        for item in element.get('value', []):
                            if item.get('idShort') == 'ModelFileVersion':
                                for version in item.get('value', []):
                                    if version.get('idShort') == 'DigitalFile':
                                        model_file = version.get('value')

            # Extract "Preprocessing"
            if preprocessing:
                preprocessing_values = [item['value'] for item in preprocessing.get("value", [])]
                if preprocessing_values:
                    required_data[preprocessing['idShort']] = preprocessing_values
            
            # Extract "Postprocessing"
            if postprocessing:
                postprocessing_values = [item['value'] for item in postprocessing.get("value", [])]
                if postprocessing_values:
                    required_data[postprocessing['idShort']] = postprocessing_values
            
            # Extract "Scope of Model" 
            if scope_of_model:
                required_data['formula'] = scope_of_model.get('value', None)
            
            # Create a new dictionary with the extracted data under "GrahamNotation" key
            #graham_notation_data = {"_id": file_id, "GrahamNotation": required_data}
            model_signature_data = {
                "_id": file_id, 
                "name": required_data['name'],
                "model_id": required_data['model_id'],
                "GrahamNotation": graham_aas_data,
                "inputData": input_aas_data,
                "ModelFile": model_file,
                "Preprocessing": required_data[preprocessing['idShort']],
                "Postprocessing": required_data[postprocessing['idShort']],
                "formula": required_data['formula']
                }            
            
            # Save the extracted data as a new JSON file
            with open(dest_path, 'w') as new_file:
                json.dump(model_signature_data, new_file, indent=4)

if __name__ == "__main__":
    run_extraction()
