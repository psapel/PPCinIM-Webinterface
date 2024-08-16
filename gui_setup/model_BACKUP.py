import pulp as op
import itertools as it

def optimization_model(durations):

    N = len(durations)  # Set of jobs
    dispmodel = "y"
    solve = "y"
    dispresult = "y"

    m = op.LpProblem("SingleMachineSchedulingWithSequenceDependentSetuptime", op.LpMinimize)
    x = {(i, j): op.LpVariable(f"x{i}{j}", 0, 1, op.LpBinary) for i, j in it.product(range(N), range(N))}
    u = {i: op.LpVariable(f"u{i}", 0, None, op.LpInteger) for i in range(1, N)}

    '''
    s = {"order_0": {"order_0": 9999, "order_1": 46, "order_2": 41, "order_3": 65, "order_4": 87, "order_5": 132},
         "order_1": {"order_0": 79, "order_1": 9999, "order_2": 89, "order_3": 64, "order_4": 135, "order_5": 52},
         "order_2": {"order_0": 117, "order_1": 94, "order_2": 9999, "order_3": 65, "order_4": 164, "order_5": 49},
         "order_3": {"order_0": 87, "order_1": 40, "order_2": 97, "order_3": 9999, "order_4": 80, "order_5": 102},
         "order_4": {"order_0": 192, "order_1": 24, "order_2": 112, "order_3": 181, "order_4": 9999, "order_5": 33},
         "order_5": {"order_0": 184, "order_1": 147, "order_2": 114, "order_3": 53, "order_4": 89, "order_5": 9999}}
    '''
    
    s = {"order_0": {"order_0": 9999, "order_1": 55, "order_2": 50, "order_3": 55, "order_4": 45},
         "order_1": {"order_0": 45, "order_1": 9999, "order_2": 9999, "order_3": 35, "order_4": 60},
         "order_2": {"order_0": 45, "order_1": 55, "order_2": 9999, "order_3": 60, "order_4": 55},
         "order_3": {"order_0": 125, "order_1": 135, "order_2": 125, "order_3": 9999, "order_4": 130},
         "order_4": {"order_0": 130, "order_1": 145, "order_2": 140, "order_3": 120, "order_4": 9999}}
    
    objs = {0: sum((durations[i] + s[f"order_{i}"][f"order_{j}"]) * x[(i, j)] for i in range(N) for j in range(N) if j != i)}
    cons = {0: {j: (sum(x[(i, j)] for i in range(N) if i != j) == 1, f"eq1_{j}") for j in range(N)},  # Constraint (1)
            1: {i: (sum(x[(i, j)] for j in range(N) if j != i) == 1, f"eq2_{i}") for i in range(N)},  # Constraint (2)
            2: {(i, j): (u[i] - u[j] + (N - 1) * x[(i, j)] <= N - 2, f"eq3_{i}{j}") for i in range(1, N) for j in
                range(1, N) if j != i},  # Constraint(3)
            3: {i: (u[i] >= 1, f"eq4_{i}") for i in range(1, N)},  # Constraint (4)
            4: {i: (u[i] <= N - 1, f"eq5_{i}") for i in range(1, N)},  # Constraint (4)
            }
    
    m += objs[0]
    for keys1 in cons:
        for keys2 in cons[keys1]: 
            m += cons[keys1][keys2]
            if dispmodel == "y":
                print("Model --- \n", str(m.name))
            if solve == "y":
                result = m.solve(op.PULP_CBC_CMD(timeLimit=None))
                print("Status  --- \n", op.LpStatus[result])
            if dispresult == "y" and op.LpStatus[result] == 'Optimal':
                print("Objective --- \n", op.value(m.objective))
                print("Decision --- \n", [(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0])

                
             # Return relevant information
    if op.LpStatus[result] == 'Optimal':
        return {
            "model" : str(m.name),
            "status": op.LpStatus[result],
            "objective_value": op.value(m.objective),
            "decision_variables": [(variables.name, variables.varValue) for variables in m.variables() if variables.varValue != 0]
        }
    else:
        return {"status": op.LpStatus[result]}