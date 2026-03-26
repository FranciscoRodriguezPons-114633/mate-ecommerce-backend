const express = require("express");
const connectDB = require("./config/db"); // 👈 IMPORTANTE

const app = express();
const PORT = 3000;

// Conectar a Mongo
connectDB(); // 👈 ESTO FALTABA

// Middleware
app.use(express.json());

// Rutas
const productRoutes = require("./routes/product.routes");
app.use("/api/products", productRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});