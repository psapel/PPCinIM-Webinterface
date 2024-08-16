def postprocessing(opt_result, job_names):
    """
    Get the optimal job order from the optimization result and map to job identifiers.

    Parameters:
    - opt_result (dict): The result dictionary obtained from the optimization model.
    - job_names (list): List containing job identifiers.

    Returns:
    - list: A list of sublists, where each sublist contains a job number with 'u' prefix and its corresponding job identifier in the optimal order.
    """
    global optimal_order
    if "status" in opt_result and opt_result["status"] == 'Optimal':
        decision_variables = opt_result["decision_variables"]
        job_order = sorted([(int(var[0][1]), int(var[0][2])) for var in decision_variables if var[0][0] == 'x' and var[1] == 1],
                           key=lambda x: x[1])
        optimal_order = [['u{}'.format(job_pair[0] + 1), job_names[job_pair[0]]] for job_pair in job_order]
        print("The optimal job order is: {}".format(optimal_order))
        return optimal_order
    else:
        print("No optimal solution found.")
        return []

