import os
import json
import uuid

# Define the paths to the folders
models_folder = "Models"
models_new_folder = "ModelsNew"

# Create the target folder if it doesn't exist
if not os.path.exists(models_new_folder):
    os.makedirs(models_new_folder)

# Iterate through the files in the source folder
for filename in os.listdir(models_folder):
    if filename.endswith(".json"):
        # Generate a unique ID for the JSON file
        file_id = str(uuid.uuid4())
        
        # Create the full file paths
        src_path = os.path.join(models_folder, filename)
        dest_path = os.path.join(models_new_folder, filename)
        
        # Load the JSON file
        with open(src_path, 'r') as file:
            data = json.load(file)
        
        # Extract the "Machine Environment", "Scheduling Constraints",
        # "Objective Functions" and "Input Data" parts
        machine_environment = None
        scheduling_constraints = []
        objective_functions = []
        input_data = None
        
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
                        input_data = element
                    elif element["idShort"] == "InputData":
                        input_data = element
        
        # Create a dictionary to store extracted data
        required_data = {}
     
        # Extract "Machine Environment"
        if machine_environment:
            extracted_data = {
                machine_environment['semanticId']['keys'][0]['value']: machine_environment['valueId']['keys'][0]['value']
            }
            required_data.update(extracted_data)
            
        # Extract "Scheduling Constraints" 
        if scheduling_constraints:
            for constraint in scheduling_constraints:
                key = constraint['semanticId']['keys'][0]['value']
                value_ids = [value_id['value'] for value_id in constraint['valueId']['keys']]
                extracted_data[key] = value_ids
                required_data.update(extracted_data)
            
        # Extract "Objective Functions" 
        if objective_functions:
            for function in objective_functions:
                key = function['semanticId']['keys'][0]['value']
                value_ids = [value_id['value'] for value_id in function['valueId']['keys']]
                extracted_data[key] = value_ids
                required_data.update(extracted_data)
                
        # Extract "Input Data" 
        if input_data:
            for item in input_data["value"]:
                required_data[item['idShort']] = item['value']['keys'][1]['value']
        
        
        # Create a new dictionary with the extracted data under "GrahamNotation" key
        graham_notation_data = {"_id": file_id, "GrahamNotation": required_data}
        
        # Save the extracted data as a new JSON file
        with open(dest_path, 'w') as new_file:
            json.dump(graham_notation_data, new_file, indent=4)
