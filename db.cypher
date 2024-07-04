// Creates a graph database schema 

// Don't run the query as a whole because it's very big and
// Neo4j throws a timeout error.
// First, execute the db and then each newly added node individually

// Initial DB

MERGE (m:Mold)
SET m.caption = 'Mold'
SET m.idS = 'InjectionMold'

MERGE (im:InjectionMoldingMachine)
SET im.caption = 'InjectionMoldingMachine'
SET im.idS = 'InjectionMoldingMachine'

MERGE (m)-[:isEquippedWith]->(im)   

MERGE (mi:MoldInsert)
SET mi.caption = 'MoldInsert'

MERGE (mi)-[:isEquippedWith]->(m)

MERGE (tcd:TemperatureControlUnit)
SET tcd.caption = 'TemperatureControlUnit'
SET tcd.idS = 'TemperatureControlUnit'

MERGE (hrd:HotRunnerDevice)
SET hrd.caption = 'HotRunnerDevice'
SET hrd.idS = 'HotRunnerSystem'

MERGE (d:Dryer)
SET d.caption = 'Dryer'

MERGE (hd:HandlingDevice)
SET hd.caption = 'HandlingDevice'
SET hd.idS = 'HandlingDevice'

MERGE (tc:TransportContainer)
SET tc.caption = 'TransportContainer'

MERGE (co:Conveyor)
SET co.caption = 'Conveyor'

MERGE (s:Scale)
SET s.caption = 'Scale'        

MERGE (ta:TechnicalAsset)
SET ta.caption = 'TechnicalAsset'
  
MERGE (im)-[:isA]->(ta)

MERGE (tcd)-[:isA]->(ta)

MERGE (d)-[:isA]->(ta)

MERGE (hd)-[:isA]->(ta)

MERGE (tc)-[:isA]->(ta)

MERGE (co)-[:isA]->(ta)

MERGE (s)-[:isA]->(ta)

MERGE (hrd)-[:isA]->(ta)

MERGE (inq:Inquiry)
SET inq.caption = 'Inquiry'
SET inq.idS = 'Inquiry'

MERGE (inq)-[:checksTechnicalFeasibility]->(ta)

MERGE (sd:SalesDocument)
SET sd.caption = 'SalesDOcument'

MERGE (inq)-[:isA]->(sd)

MERGE (so:SalesOrder)
SET so.caption = 'SalesOrder'

MERGE (so)-[:isBuiltFrom]->(inq)

MERGE (po:ProductionOrder)
SET po.caption = 'ProductionOrder'

MERGE (po)-[:isConnectedTo]->(so)

MERGE (ps:ProductionSchedule)
SET ps.caption = 'ProductionSchedule'

MERGE (ps)-[:consistsOf]->(po)

MERGE (om:OptimizationModel)
SET om.caption = 'OptimizationModel'

MERGE (om)-[:optimizes]->(ps)

MERGE (pe:Person)
SET pe.caption = 'Person'

MERGE (pq:PersonalQualification)    
SET pq.caption = 'PersonalQualification'

MERGE (pe)-[:operatesAt]->(ta)

MERGE (pe)-[:has]->(pq)

MERGE (sc:ShiftCalendar)
SET sc.caption = 'ShiftCalendar'

MERGE (sc)-[:providesHighCapacity]->(ta)
MERGE (sc)-[:providesHighCapacity]->(pe) 

MERGE (p:Part)
SET p.caption = 'Part'

MERGE (r:Routing)
SET r.caption = 'Routing'  

MERGE (o:Operation)
SET o.caption = 'Operation'

MERGE (purO:PurchaseOrder)
SET purO.caption = 'PurchaseOrder'

MERGE (rm:RawMaterial)
SET rm.caption = 'RawMaterial'

MERGE (bom:BillOfMaterial)
SET bom.caption = 'BillOfMaterial'

MERGE (bp:BOMPosition)
SET bp.caption = 'BOMPosition'   

MERGE (id:InventoryData)
SET id.caption = 'InventoryData'  

MERGE (st:Storage)
SET st.caption = 'Storage'

MERGE (stp:StoragePosition)
SET stp.caption = 'StoragePosition'        

MERGE (pg:PlasticsGranulate)
SET pg.caption = 'PlasticsGranulate'  

MERGE (b:Batch)
SET b.caption = 'Batch'      

MERGE (po)-[:produces]->(p)

MERGE (po)-[:isSuborderOf]->(purO)

MERGE (purO)-[:delivers]->(rm)

MERGE (p)-[:consistsOf]->(rm)

MERGE (p)-[:consistsOf]->(r)

MERGE (p)-[:consistsOf]->(bom)

MERGE (r)-[:consistsOf]->(o)

MERGE (bom)-[:consistsOf]->(bp)

MERGE (pg)-[:isA]->(rm)

MERGE (b)-[:has]->(pg)

MERGE (st)-[:has]->(stp)

MERGE (id)-[:has]->(p)

MERGE (id)-[:has]->(bp)

MERGE (id)-[:has]->(st)

MERGE (bp)-[:isAssociatedWith]->(o)

MERGE (o)-[:isProcesseBy]->(td)


// End of Initial DB

// The following queries (currently 'Inquiry' only) fetch and structure data for some nodes in the graph db, 
// including their submodels and technical details, 
// and link them to an 'assetType' node if they share the same property.


// Inquiry_1

CALL apoc.load.json('http://localhost:5001/shells/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vYWFzLzEvMS9pbnF1aXJ5XzE?format=json') YIELD value
WITH value
MERGE (n:Inquiry_1 { idShort: value.idShort })
SET n.assetType = value.assetInformation.assetType

WITH n

CALL apoc.load.json('http://localhost:5001/submodels/d3d3LmV4YW1wbGUuY29tL2lkcy9zbS8xMjI1XzkwMjBfNTAyMl8xOTc0L0lOUVVJUlkx?format=json') YIELD value
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

WITH n 

CALL apoc.load.json('http://localhost:5001/submodels/aHR0cHM6Ly9hZG1pbi1zaGVsbC5pby9aVkVJL1RlY2huaWNhbERhdGEvU3VibW9kZWwvMS8yL0lOUVVJUlkx?format=json') YIELD value
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

CALL apoc.load.json('http://localhost:5001/submodels/aHR0cHM6Ly9pb3Aucnd0aC1hYWNoZW4uZGUvSU0vc20vMS8xL3NwZWNpZmljYXRpb25zL0lOUVVJUlkx?format=json') YIELD value
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

WITH n 

MATCH (n)
WHERE n.assetType IS NOT NULL
MATCH (b)
WHERE b.idS IS NOT NULL AND n.assetType = b.idS
WITH n, b LIMIT 1
MERGE (n)-[:IsA]->(b)

WITH n
SET n = apoc.map.clean(n, ['de', 'en'], [])



// Retrieve and return all nodes from the graph database without any specific filtering or conditions

MATCH (n)
RETURN n




