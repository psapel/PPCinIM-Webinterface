import ssl
import xmlrpc.client
import json
import copy
from datetime import date


def connect(model_id):
    # Odoo User
    user_ps = 'patrick.sapel@rwth-aachen.de'
    pw_ps = 'ikv123!!'

    # Database credentials
    url = 'https://edu-ikvds-rwth-aachen.odoo.com'
    db = 'edu-ikvds-rwth-aachen'
    username = user_ps
    password = pw_ps

    if not username or not password:
        raise ValueError("Odoo username and password are required")

    # Establish Odoo DB connection with SSL context
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', context=ssl._create_unverified_context())
    uid = common.authenticate(db, username, password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', context=ssl._create_unverified_context())

    # Check if login was successful (boolean)
    is_authenticated = models.execute_kw(db, uid, password,
                                         'res.partner', 'check_access_rights',
                                         ['read'], {'raise_exception': False})
    if is_authenticated:
        print("Successfully connected to Odoo")
    else:
        print("Failed to authenticate with Odoo")

    state = ['confirmed', 'progress']

    odoo_models = models.execute_kw(db, uid, password,
                                    'ir.model', 'search_read',
                                    [[]],
                                    {'fields': ['model']})
    m_id = model_id
    m_id = 596
    model_value = ''
    for item in odoo_models:
        if item['id'] == m_id:
            model_value = item['model']
            print(model_value)
            break  # Stop the loop when the target ID is found

    print(models.execute_kw(db, uid, password,
                            'res.partner', 'check_access_rights',
                            ['read'], {'raise_exception': False}))

    fields = models.execute_kw(db, uid, password,
                               model_value, 'fields_get', [], {'attributes': ['string', 'type']})

    jobs = (models.execute_kw(db, uid, password,
                              model_value, 'search_read',
                              [[['state', '=', state]]],
                              {'fields': ['name', 'duration_expected', 'date_planned_finished', 'product_id',
                                          'product_uom_qty', 'state', 'company_id']}))

    # Building a deepcopy to prohibit errors in original file
    jobs_copy = copy.deepcopy(jobs)

    # Definition of needed variables
    # name = name of job j
    # pj = Processing time of job j

    # Read names of jobs
    name_first = []
    name_first_array = []
    i_name_ini = 0
    i_name_end = len(jobs_copy) - 1

    # Insert values for name
    while i_name_ini <= i_name_end:
        name_first = jobs_copy[i_name_ini]['name']
        name_first_array.append(name_first)
        i_name_ini = i_name_ini + 1

    # Read duration_expected from all jobs
    pj_first = []
    pj_first_array = []
    i_pj_ini = 0
    i_pj_end = len(jobs_copy) - 1

    # Insert values for duration_expected
    while i_pj_ini <= i_pj_end:
        pj_first = jobs_copy[i_pj_ini]['duration_expected']
        pj_first_array.append(pj_first)
        i_pj_ini = i_pj_ini + 1

    # Read origin
    origin = []
    origin_array = []
    i_origin_ini = 0
    i_origin_end = len(jobs_copy) - 1

    # Insert values for origin
    while i_origin_ini <= i_origin_end:
        origin = jobs_copy[i_origin_ini]['date_planned_finished']
        origin_array.append(origin)
        i_origin_ini = i_origin_ini + 1

    # actual date, because odoo date is not compatible to algorithm date
    actual_date = date.today()
    # print(actual_date)
    # Printing results
    """
    print("Number of jobs to be considered: " + str(len(jobs_copy)))
    i = 0
    i_end = len(jobs_copy) - 1
    while i <= i_end:
        print("job name: " + str(name_first_array[i]) + " | duration: " + str(pj_first_array[i]) + " | due date: " + str(origin_array[i]))
        i = i+1
    """
    print(name_first_array)
    print(pj_first_array)
    print(origin_array)

    for i in range(0, len(jobs)):
        jobs[i]['Reference'] = jobs[i]['name']
        del jobs[i]['name']
        jobs[i]['Duration'] = jobs[i]['duration_expected']
        del jobs[i]['duration_expected']
        jobs[i]['Company'] = jobs[i]['company_id']
        del jobs[i]['company_id']
        jobs[i]['Product'] = jobs[i]['product_id']
        del jobs[i]['product_id']
        jobs[i]['Quantity'] = jobs[i]['product_uom_qty']
        del jobs[i]['product_uom_qty']
        jobs[i]['State'] = jobs[i]['state']
        del jobs[i]['state']
        del jobs[i]['date_planned_finished']
        del jobs[i]['id']
        jobs[i]['Company'] = jobs[i]['Company'][1]
        jobs[i]['Product'] = jobs[i]['Product'][1]

    print(jobs)
    return jobs
    # documentation: https://www.odoo.com/documentation/15.0/developer/misc/api/odoo.html


def display_job_contents(model_ids):
    jobs = connect(model_ids)
    modified_jobs = jobs
    for i in range(0, len(modified_jobs)):
        del modified_jobs[i]['Company']
        del modified_jobs[i]['Product']

    return modified_jobs


if __name__ == '__main__':
    model_id = "model-47"
    result = connect(model_id)
    print(result)
