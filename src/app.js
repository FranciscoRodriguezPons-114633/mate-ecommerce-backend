require('dotenv').config(); // Cargar variables de entorno

const express = require("express");
const connectDB = require("./config/db"); // 👈 IMPORTANTE

const app = express();
const PORT = process.env.PORT || 3000; // Usar variable de entorno para puerto

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

// Middleware de manejo de errores
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});