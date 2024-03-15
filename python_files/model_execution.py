import json
import time
import pulp as op
import itertools as it

from python_files.odoo_connect import connect


# I think the matrix must contain more parameters (order_n) where N < n and N = number of jobs from the odoo ERP 
# The setup times are random generated values - order_n to order_n is "big", i.e., 9999
def total_order(model_name):
    s = {"order_0": {"order_0": 9999, "order_1": 46, "order_2": 41, "order_3": 65, "order_4": 87, "order_5": 132},
         "order_1": {"order_0": 79, "order_1": 9999, "order_2": 89, "order_3": 64, "order_4": 135, "order_5": 52},
         "order_2": {"order_0": 117, "order_1": 94, "order_2": 9999, "order_3": 65, "order_4": 164, "order_5": 49},
         "order_3": {"order_0": 87, "order_1": 40, "order_2": 97, "order_3": 9999, "order_4": 80, "order_5": 102},
         "order_4": {"order_0": 192, "order_1": 24, "order_2": 112, "order_3": 181, "order_4": 9999, "order_5": 33},
         "order_5": {"order_0": 184, "order_1": 147, "order_2": 114, "order_3": 53, "order_4": 89, "order_5": 9999}}

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
    result_temp = result_temp + "List of Jobs : "
    result_temp = result_temp + str(job_names) + "\n\n"

    N = len(p)  # Set of jobs
    dispmodel = "y"
    solve = "y"
    dispresult = "y"
    
    J = range(len(p))
    K = range(len(J))

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
    
    # It seem like that the following calculation was wrongly inserted here... 
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
            # result_temp = result_temp + "Model --- \n" + str(m) + "\n"
        if solve == "y":
            result = m.solve(op.PULP_CBC_CMD(timeLimit=None))
            print("Status --- \n", op.LpStatus[result])
            # result_temp = result_temp + "Status --- \n" + op.LpStatus[result] + "\n"
            if dispresult == "y" and op.LpStatus[result] == 'Optimal':
                print("Objective --- \n", op.value(m.objective))
                # result_temp = result_temp + "Objective --- \n" + str(op.value(m.objective)) + "\n"
                print("Decision --- \n",
                      [(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0])
                # result_temp = result_temp + "Decision --- \n" + str([(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0]) + "\n"

    # replace m.name with str(m)
    result_temp = result_temp + "Model name -- " + m.name + "\n\n"
    result_temp = result_temp + "Status of solution -- " + op.LpStatus[result] + "\n\n"
    result_temp = result_temp + "Objective -- " + str(op.value(m.objective)) + "\n\n"
    result_temp = result_temp + "Decision -- " + str(
        [(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0]) + "\n\n"

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
    return result_temp


if __name__ == '__main__':
    name = "model-47"
    results = total_order(name)
    test_result = results.split("\n\n")
    print(test_result)
    print(results)