def cypher_query(url, label, url1, url2, url3):
    query = f"""
    CALL apoc.load.json($url) YIELD value
    WITH value
    MERGE (n:{label} {{ idShort: value.idShort }})
    SET n.assetType = value.assetInformation.assetType
    """

    if url1:
        query += f"""
        WITH n
        CALL apoc.load.json($url1) YIELD value
        WITH value.submodelElements AS elements, n
        UNWIND elements AS element
        WITH n, element
        WHERE element.modelType = 'Property' OR element.modelType = 'MultiLanguageProperty'
        WITH n, element,
        CASE
            WHEN element.modelType = 'MultiLanguageProperty' THEN element.value[0].text
            ELSE element.value
        END AS propertyValue
        SET n += apoc.map.fromPairs([[element.idShort, propertyValue]])
        """

    if url3:
        query += f"""
        WITH n
        CALL apoc.load.json($url3) YIELD value
        WITH value.submodelElements AS elements, n
        UNWIND elements AS element
        WITH n, element
        WHERE element.modelType = 'Property' OR element.modelType = 'MultiLanguageProperty'
        WITH n, element,
        CASE
            WHEN element.modelType = 'MultiLanguageProperty' THEN element.value[0].text
            ELSE element.value
        END AS propertyValue
        SET n += apoc.map.fromPairs([[element.idShort, propertyValue]])
        """

    query += f"""
    WITH n 
    CALL apoc.load.json($url2) YIELD value
    WITH value.submodelElements AS elements, n
    UNWIND elements AS element
    WITH n, element,
    CASE
        WHEN element.modelType = 'Property' THEN [element]
        ELSE []
    END AS properties,
    CASE
        WHEN element.modelType = 'SubmodelElementCollection' THEN element.value
        ELSE []
    END AS subElements

    FOREACH (prop IN properties |
    SET n += apoc.map.fromPairs([ [prop.idShort, prop.value] ])
    )
    FOREACH (subElem IN subElements |
    FOREACH (_ IN CASE WHEN subElem.modelType = 'Property' THEN [1] ELSE [] END |
        SET n += apoc.map.fromPairs([[subElem.idShort, subElem.value]])
        FOREACH (desc IN subElem.descriptions |
        SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
        )
    )
    FOREACH (nestedSubElem IN CASE WHEN subElem.modelType = 'SubmodelElementCollection' THEN subElem.value ELSE [] END |
        FOREACH (_ IN CASE WHEN nestedSubElem.modelType = 'Property' THEN [1] ELSE [] END |
        SET n += apoc.map.fromPairs([[nestedSubElem.idShort, nestedSubElem.value]])
        FOREACH (desc IN nestedSubElem.descriptions |
            SET n += apoc.map.fromPairs([ [desc.language, desc.text] ])
        )
        )
        FOREACH (deepNestedSubElem IN CASE WHEN nestedSubElem.modelType = 'SubmodelElementCollection' THEN nestedSubElem.value ELSE [] END |
        SET n += apoc.map.fromPairs([[deepNestedSubElem.idShort, deepNestedSubElem.value]])
            FOREACH (ts IN CASE WHEN deepNestedSubElem.idShort = 'TextStatement' THEN [deepNestedSubElem.value] ELSE [] END |
        SET n += apoc.map.fromPairs([ ['TextStatement', ts] ])
        )
        )
    )
    )

    WITH n 

    MATCH (n)
    WHERE n.assetType IS NOT NULL
    MATCH (b)
    WHERE b.idS IS NOT NULL AND n.assetType = b.idS
    WITH n, b LIMIT 1
    MERGE (n)-[:IsA]->(b)

    WITH n
    SET n = apoc.map.clean(n, ['de', 'en'], [])
    """
    return query
