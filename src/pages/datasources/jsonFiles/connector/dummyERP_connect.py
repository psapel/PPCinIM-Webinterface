import psycopg2

def connect_and_fetch_data(url, db, username, password, db_prop_names):

    field_list = ', '.join([f'"{field}"' for field in db_prop_names])  # Quote column names to avoid SQL injection

    query = f"SELECT {field_list} FROM auftraege"

    try:
        conn = psycopg2.connect(
            dbname=db,
            user=username,
            password=password,
            host=url,
            port=5432,
            options="-c client_encoding=UTF8"
        )
        print(conn)
        
        #conn = psycopg2.connect(**db_settings)
        cur = conn.cursor()

        # Execute the dynamically generated query
        cur.execute(query)

        # Spaltennamen dynamisch abrufen
        column_names = [desc[0] for desc in cur.description]

        # Fetch all results
        #result = cur.fetchall()
        result = [dict(zip(column_names, row)) for row in cur.fetchall()]
        formatted_results = [[result] for result in result]

        # Ergebnisse ausgeben
        print("Aufträge in der Tabelle:")
        for row in result:
            print("HIER DIE REIHEN AUS POSTGRES FETCH         ",row)
        
        data = []
        for row in formatted_results:
            data.append(row)

        print(f"Fetched data from dummyERP: {data}")
        return data

    except Exception as e:
        print(f"Ein Fehler ist aufgetreteng: {e}")
    finally:
        # Verbindung schließen
        if conn:
            cur.close()
            conn.close()
            print("Datenbankverbindung geschlossen.")