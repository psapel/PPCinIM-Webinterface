def translate_identifiers(json_data, id_to_name_mapping, id_to_duration_mapping, name_key="job_name", duration_key="job_duration"):
    translated_data = []

    # Translate identifiers to names and durations
    for item in json_data.get("input_data", []):
        job_name = item.get(name_key, {}).get("id")
        job_duration = item.get(duration_key, {}).get("id")

        translated_item = []

        if job_name in id_to_name_mapping:
            translated_item.append(id_to_name_mapping[job_name])

        if job_duration in id_to_duration_mapping:
            translated_item.append(id_to_duration_mapping[job_duration])

        translated_data.append(translated_item)

    return translated_data
