import ssl
import xmlrpc.client

def connect_and_fetch_data(url, db, username, password, db_prop_names):
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
        return  # Exit function if authentication fails

    # Odoo model
    table = 'mrp.production'
    print(f"Fetching data from {table}")

    # Check if the user has read access to the model
    read_access = models.execute_kw(db, uid, password,
                                    table, 'check_access_rights',
                                    ['read'], {'raise_exception': False})
    if not read_access:
        print(f"Error: No read access to {table}")
        return  # Exit function if no read access

    # Fetch data for the specified field names
    domain = [('state', 'in', ['confirmed', 'progress'])]
    record_ids = models.execute_kw(db, uid, password,
                                   table, 'search', [domain])
    
    #print("TYPEN ODOO         ",type(['state']), type(db_prop_names),db_prop_names,[db_prop_names])
    data = []
    for record_id in record_ids:
        fields_to_read = db_prop_names + ['state']
        record = models.execute_kw(db, uid, password,
                                   table, 'read', [record_id], {'fields': fields_to_read})
        data.append(record)

    print(f"Fetched data from odoo: {data}")
    return data
