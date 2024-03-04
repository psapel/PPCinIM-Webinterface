def get_odoo_credentials():
    # Odoo User
    user_ps = 'patrick.sapel@ikv.rwth-aachen.de'
    pw_ps = 'ikv123!'

    # Database credentials
    url = 'https://edu-ikvds-rwth-aachen.odoo.com'
    db = 'edu-ikvds-rwth-aachen'
    username = user_ps
    password = pw_ps

    if not username or not password:
        raise ValueError("Odoo username and password are required")

    return url, db, username, password