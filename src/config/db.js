const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Validación importante
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida en las variables de entorno");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error Mongo:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;