// Seed inicial de relaciones COMPLEMENTA para Neo4j.
// Ejecutar luego de crear nodos Product/Category desde los datos de MongoDB.

MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Mate" AND p2.nombre CONTAINS "Bombilla"
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);

MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Yerba" AND (p2.nombre CONTAINS "Yerbera" OR p2.nombre CONTAINS "Set")
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);

MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Termo" AND (p2.nombre CONTAINS "Mate" OR p2.nombre CONTAINS "Set")
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);
