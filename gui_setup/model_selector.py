from json_loader import load_json_files

def select_json_file(json_models):
    # Display available JSON files to the user
    print("Available JSON files:")
    for i, json_file in enumerate(json_models):
        print(f"{i + 1}. {json_file}")

    # Get user input for selecting a JSON file
    selected_index = input("Enter the number corresponding to the JSON file you want to use: ")
    
    # Convert the user input to an integer
    selected_index = int(selected_index)

    # Validate the user input
    if 1 <= selected_index <= len(json_models):
        selected_json = json_models[selected_index - 1]
        print(f"You selected: {selected_json}")

    return selected_json

       
