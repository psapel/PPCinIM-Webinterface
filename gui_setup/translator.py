def translate_identifiers(json_data, id_to_name_mapping, id_to_duration_mapping, name_key="jobName", duration_key="jobDuration"):
    translated_data = []

    # Translate identifiers to names and durations
    job_name = json_data.get("GrahamNotation", {}).get(name_key)
    job_duration = json_data.get("GrahamNotation", {}).get(duration_key)

    if job_name in id_to_name_mapping:
        translated_data.append([id_to_name_mapping[job_name]])
    else:
        translated_data.append([])

    if job_duration in id_to_duration_mapping:
        translated_data.append([id_to_duration_mapping[job_duration]])
    else:
        translated_data.append([])

    return translated_data
