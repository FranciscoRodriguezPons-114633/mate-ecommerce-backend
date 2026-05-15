const neo4j = require("neo4j-driver");

const uri = process.env.NEO4J_URI || "bolt://127.0.0.1:7687";
const user = process.env.NEO4J_USER || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

let isAvailable = false;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const connectNeo4j = async () => {
  try {
    await driver.verifyConnectivity();
    isAvailable = true;
    console.log("Neo4j conectado");
  } catch (error) {
    isAvailable = false;
    console.error("Error conectando a Neo4j:", error.message);
    throw error;
  }
};

const closeNeo4j = async () => {
  await driver.close();
};

const isNeo4jAvailable = () => isAvailable;

module.exports = {
  driver,
  connectNeo4j,
  closeNeo4j,
  isNeo4jAvailable,
};
