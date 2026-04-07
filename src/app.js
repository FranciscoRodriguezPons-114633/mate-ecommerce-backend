require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});