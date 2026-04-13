require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Mate Imperial con Virola de Alpaca",
    description: "Calabaza natural de primera calidad con virola de alpaca labrada a mano. Curado y listo para usar. Ideal para el matero exigente que busca tradición y elegancia.",
    price: 18500,
    quantity: 15,
    category: "Calabazas",
    image: "/product-mate-1.jpg",
  },
  {
    name: "Bombilla Cincelada de Alpaca",
    description: "Bombilla artesanal de alpaca con diseño cincelado único. Filtro desmontable para fácil limpieza. Una pieza de colección para los amantes del mate.",
    price: 8900,
    quantity: 28,
    category: "Bombillas",
    image: "/product-bombilla-1.jpg",
  },
  {
    name: "Yerba Mate Premium Orgánica 1kg",
    description: "Yerba mate orgánica de producción sustentable. Sabor suave y equilibrado, perfecta para cebar durante todo el día sin perder intensidad.",
    price: 4500,
    quantity: 100,
    category: "Yerba Mate",
    image: "/product-yerba-1.jpg",
  },
  {
    name: "Set Completo Matero Premium",
    description: "Todo lo que necesitás para empezar: mate de calabaza, bombilla de alpaca, termo Stanley 1L, yerbera de cuero y bolso matero. El regalo perfecto.",
    price: 45000,
    quantity: 8,
    category: "Sets",
    image: "/product-set-1.jpg",
  },
  {
    name: "Mate de Algarrobo Tallado",
    description: "Mate tallado a mano en madera de algarrobo. Cada pieza es única con vetas naturales que lo hacen irrepetible. Incluye base para apoyar.",
    price: 24000,
    quantity: 12,
    category: "Calabazas",
    image: "/product-mate-2.jpg",
  },
  {
    name: "Termo Matero de Acero 1L",
    description: "Termo de acero inoxidable con sistema de vertido ideal para cebar mate. Mantiene la temperatura hasta 24 horas. Diseño elegante color verde bosque.",
    price: 28000,
    quantity: 20,
    category: "Accesorios",
    image: "/product-termo-1.jpg",
  },
  {
    name: "Bombilla Pico de Loro Acero",
    description: "Bombilla clásica pico de loro en acero quirúrgico. Ideal para iniciarse en el mundo del mate. Duradera y fácil de limpiar.",
    price: 3500,
    quantity: 50,
    category: "Bombillas",
    image: "/product-bombilla-1.jpg",
  },
  {
    name: "Yerba Mate Suave Sin Palo 500g",
    description: "Yerba mate suave ideal para quienes prefieren un sabor más delicado. Sin palo para mayor rendimiento y sabor más puro.",
    price: 2800,
    quantity: 75,
    category: "Yerba Mate",
    image: "/product-yerba-1.jpg",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");

    await Product.deleteMany({});
    console.log("Productos anteriores eliminados");

    await Product.insertMany(products);
    console.log(`${products.length} productos insertados correctamente`);

    await mongoose.disconnect();
    console.log("Listo!");
    process.exit(0);
  } catch (error) {
    console.error("Error en seed:", error.message);
    process.exit(1);
  }
};

seed();