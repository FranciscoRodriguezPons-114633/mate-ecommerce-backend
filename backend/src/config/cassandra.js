const cassandra = require("cassandra-driver");

let isAvailable = false;

const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOST || "127.0.0.1"],
  localDataCenter: process.env.CASSANDRA_DATACENTER || "datacenter1",
  keyspace: process.env.CASSANDRA_KEYSPACE || "mate_ecommerce",
  socketOptions: { connectTimeout: 5000 },
  policies: {
    retry: new cassandra.policies.retry.RetryPolicy(),
  },
});

const connectCassandra = async () => {
  try {
    await client.connect();
    isAvailable = true;
    console.log("Cassandra conectado");
  } catch (error) {
    isAvailable = false;
    console.error("Error conectando a Cassandra:", error.message);
    throw error;
  }
};

const isCassandraAvailable = () => isAvailable;

module.exports = { client, connectCassandra, isCassandraAvailable };
