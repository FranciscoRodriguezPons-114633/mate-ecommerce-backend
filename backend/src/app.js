require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { connectCassandra } = require("./config/cassandra");
const { connectNeo4j } = require("./config/neo4j");

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Conectar a Redis
connectRedis().catch((err) => {
  console.error("Failed to connect to Redis, continuing without cache:", err);
  // La aplicación continúa sin Redis si falla la conexión
});

// Conectar a Cassandra
connectCassandra().catch((err) => {
  console.error("Failed to connect to Cassandra, continuing without it:", err);
});

// Conectar a Neo4j
connectNeo4j().catch((err) => {
  console.error("Failed to connect to Neo4j, using recommendation fallback:", err.message);
});

app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const customerJourneyRoutes = require("./routes/customerJourney.routes");
const kitBuilderRoutes = require("./routes/kitBuilder.routes");

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/customer-journey", customerJourneyRoutes);
app.use("/api/kit-builder", kitBuilderRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
