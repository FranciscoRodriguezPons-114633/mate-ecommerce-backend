const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mate-ecommerce");
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error Mongo:", error);
    process.exit(1);
  }
};

module.exports = connectDB;