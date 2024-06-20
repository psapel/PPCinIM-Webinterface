from neo4j import GraphDatabase

def run_injection_molding_machine_query(uri, username, password):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            query = """
            MATCH (inquiry:Inquiry_1)
            MATCH (imm)
            WHERE imm.ManufacturerProductRoot = 'InjectionMoldingMachine'
            WITH inquiry, imm,
              (inquiry.MinRequiredClampingForce <= imm.MaxClampingForce) AS OK1,
              (inquiry.ShotVolume <= imm.MaxPlasticizingCapacity) AS OK2,
              (inquiry.GreaterMoldDimension <= imm.GreaterClearDistanceBetweenColumns) AS OK3,
              (inquiry.SmallerMoldDimension <= imm.SmallerClearDistanceBetweenColumns) AS OK4,
              (inquiry.RequiredOpeningStroke <= imm.MaxOpeningStroke) AS OK5
            RETURN imm.idShort AS idShort,
              CASE
                WHEN OK1 AND OK2 AND OK3 AND OK4 AND OK5 THEN 'is technically capable'
                ELSE 'is not technically capable'
              END AS feasibility
            """
            result = session.run(query)
            return result.data()
