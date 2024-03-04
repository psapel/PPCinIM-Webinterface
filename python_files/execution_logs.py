import json
import time
import pulp as op
import itertools as it
from datetime import datetime
from python_files.odoo_connect import connect



def total_execution(model_name):
    s = {"order_0": {"order_0": 0, "order_1": 0, "order_2": 0, "order_3": 0, "order_4": 0},
         "order_1": {"order_0": 0, "order_1": 0, "order_2": 2, "order_3": 5, "order_4": 3},
         "order_2": {"order_0": 0, "order_1": 2, "order_2": 0, "order_3": 3, "order_4": 2}}

    response = connect(model_name)
    p = []  # Processing time of each job
    job_names = []
    for i in range(0, len(response)):
        current_job = response[i]['Reference']
        current_duration = response[i]['Duration']
        if current_job:
            job_names.append(current_job)
        if current_duration:
            p.append(current_duration)
    result_temp = ""
    current_time = datetime.now()
    # Format the timestamp as a string in a specific format
    timestamp_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
    result_temp = result_temp + timestamp_string + " - " + "List of Jobs : "
    result_temp = result_temp + str(job_names) + "\n\n"

    N = len(p)  # Set of jobs
    dispmodel = "y"
    solve = "y"
    dispresult = "y"

    m = op.LpProblem("SingleMachineSchedulingWithSequenceDependentSetuptime", op.LpMinimize)
    x = {(i, j): op.LpVariable(f"x{i}{j}", 0, 1, op.LpBinary) for i, j in it.product(range(N), range(N))}
    u = {i: op.LpVariable(f"u{i}", 0, None, op.LpInteger) for i in range(1, N)}

    # Source: https://en.wikipedia.org/wiki/Travelling_salesman_problem
    objs = {0: sum((p[i] + s[f"order_{i}"][f"order_{j}"]) * x[(i, j)] for i in range(N) for j in range(N) if j != i)}
    cons = {0: {j: (sum(x[(i, j)] for i in range(N) if i != j) == 1, f"eq1_{j}") for j in range(N)},  # Constraint (1)
            1: {i: (sum(x[(i, j)] for j in range(N) if j != i) == 1, f"eq2_{i}") for i in range(N)},  # Constraint (2)
            2: {(i, j): (u[i] - u[j] + (N - 1) * x[(i, j)] <= N - 2, f"eq3_{i}{j}") for i in range(1, N) for j in
                range(1, N) if j != i},  # Constraint(3)
            3: {i: (u[i] >= 1, f"eq4_{i}") for i in range(1, N)},  # Constraint (4)
            4: {i: (u[i] <= N - 1, f"eq5_{i}") for i in range(1, N)},  # Constraint (4)
            }

    var1 = 0
    m += objs[0]
    M = 1000  # BigM constraint
    # Here we need the number of weights according to the number of jobs, instad an error will occur  
    w = []  
    for job in range(0,N):
        w.append(1.0) 
    #w = [0.125, 0.125, 0.125, 0.125]
    J = range(len(p))
    K = range(len(J))
    y = {k: op.LpVariable(f"y{k}", 0, None, op.LpContinuous) for k in K}
    C = {j: op.LpVariable(f"C{j}", 0, None, op.LpContinuous) for j in J}
    u = {(j, k): op.LpVariable(f"u{j}{k}", 0, 1, op.LpBinary) for j, k in it.product(J, K)}  # (4.6
    objs = {0: sum(w[k] * y[k] for k in K)}
    cons = {0: {j: (sum(u[(j, k)] for k in K) == 1, f"eq1_{j}") for j in J},  # (4.1)
            1: {k: (sum(u[(j, k)] for j in J) == 1, f"eq2_{k}") for k in K},  # (4.2)
            2: {0: (y[0] >= sum(p[j] * u[(j, 0)] for j in J), "eq3_")},  # (4.3)
            3: {k: (y[k] >= y[k - 1] + sum(p[j] * u[(j, k)] for j in J), f"eq4_{k}") for k in K if k != 0},  # (4.4)
            4: {k: (y[k] >= 0, f"eq5_{k}") for k in K},  # (4.5)
            5: {(j, k): (C[j] >= y[k] - M * (1 - u[(j, k)]), f"eq6_{j}{k}") for k in K for j in J},  # (4.10)
            6: {j: (C[j] >= 0, f"eq7_{j}") for j in J}  # (4.11)
            }
    m += objs[0]
    for keys1 in cons:
        for keys2 in cons[keys1]: m += cons[keys1][keys2]
        if dispmodel == "y":
            print("Model --- \n", m)
            current_time = datetime.now()
            # Format the timestamp as a string in a specific format
            timestamp_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
            result_temp = result_temp + timestamp_string + " - " + "Model --- " + str(m) + "\n\n"
        if solve == "y":
            result = m.solve(op.PULP_CBC_CMD(timeLimit=None))
            print("Status --- \n", op.LpStatus[result])
            current_time = datetime.now()
            # Format the timestamp as a string in a specific format
            timestamp_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
            result_temp = result_temp + timestamp_string + " - " + "Status ---" + op.LpStatus[result] + "\n\n"
            if dispresult == "y" and op.LpStatus[result] == 'Optimal':
                print("Objective --- \n", op.value(m.objective))
                current_time = datetime.now()
                # Format the timestamp as a string in a specific format
                timestamp_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
                result_temp = result_temp + timestamp_string + " - " + "Objective --- " + str(op.value(m.objective)) + "\n\n"
                print("Decision --- \n",
                      [(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0])
                current_time = datetime.now()
                # Format the timestamp as a string in a specific format
                timestamp_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
                result_temp = result_temp + timestamp_string + " - " + "Decision ---" + str([(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0]) + "\n\n"


    seq = []
    for k in K:
        for j in J:
            if u[(j, k)].varValue == 1:
                seq.append(j + 1)
    print(seq)
    print(m.name)
    job_dict = []
    for item in seq:
        indv_job = []
        indv_job.append("u" + str(item))
        indv_job.append(job_names[item - 1])
        job_dict.append(indv_job)
    result_temp = result_temp + "Optimal Job Order: "
    result_temp = result_temp + str(job_dict)
    final_logs = result_temp.split("\n\n")
    return final_logs


if __name__ == '__main__':
    name = "model-47"
    results = total_execution(name)
    print(results)
