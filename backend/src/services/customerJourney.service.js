const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { driver, isNeo4jAvailable } = require("../config/neo4j");

const levels = [
  { min: 1, label: "Iniciado" },
  { min: 2, label: "Aprendiz" },
  { min: 3, label: "Conocedor" },
  { min: 4, label: "Matero" },
  { min: 5, label: "Maestro matero" },
];

const getLevel = (categoryCount) => {
  if (categoryCount <= 0) {
    return {
      label: "Explorador",
      progress: 0,
      current: 0,
      next: "Iniciado",
      nextAt: 1,
    };
  }

  const current =
    [...levels].reverse().find((level) => categoryCount >= level.min) || levels[0];
  const next = levels.find((level) => level.min > categoryCount);

  return {
    label: current.label,
    progress: Math.min((categoryCount / levels[levels.length - 1].min) * 100, 100),
    current: categoryCount,
    next: next ? next.label : null,
    nextAt: next ? next.min : null,
  };
};

const productId = (value) => value.toString();

const buildMongoJourney = async (userId) => {
  const [user, orders, allOrders, allProducts] = await Promise.all([
    User.findById(userId).lean(),
    Order.find({ user: userId }).sort({ createdAt: 1 }).lean(),
    Order.find().populate("user", "name email").lean(),
    Product.find().lean(),
  ]);

  const productsById = new Map(
    allProducts.map((product) => [product._id.toString(), product])
  );
  const categorySet = new Set();
  const productCounts = new Map();
  const categoryFirstSeen = new Set();

  const timeline = orders.map((order) => {
    const newCategories = [];
    const products = order.items.map((item) => {
      const id = productId(item.product);
      const product = productsById.get(id);
      const category = product ? product.category : "Producto";

      productCounts.set(id, {
        product: product || {
          _id: id,
          name: item.name,
          image: item.image,
          category,
          price: item.price,
        },
        quantity: (productCounts.get(id)?.quantity || 0) + item.quantity,
      });

      categorySet.add(category);

      if (!categoryFirstSeen.has(category)) {
        categoryFirstSeen.add(category);
        newCategories.push(category);
      }

      return {
        id,
        name: product ? product.name : item.name,
        image: product ? product.image : item.image,
        category,
        quantity: item.quantity,
        subtotal: item.subtotal,
      };
    });

    return {
      id: order._id.toString(),
      date: order.createdAt,
      total: order.total,
      status: order.status,
      products,
      newCategories,
    };
  });

  const topProductEntry = Array.from(productCounts.values()).sort(
    (a, b) => b.quantity - a.quantity
  )[0];

  const myCategories = Array.from(categorySet);
  const predictionScores = new Map();

  for (const order of allOrders) {
    if (order.user?._id?.toString() === userId) continue;

    const orderCategories = new Set(
      order.items
        .map((item) => productsById.get(productId(item.product))?.category)
        .filter(Boolean)
    );
    const sharesCategory = Array.from(orderCategories).some((category) =>
      categorySet.has(category)
    );

    if (!sharesCategory) continue;

    for (const category of orderCategories) {
      if (categorySet.has(category)) continue;
      predictionScores.set(category, (predictionScores.get(category) || 0) + 1);
    }
  }

  if (!predictionScores.size) {
    for (const product of allProducts) {
      if (!categorySet.has(product.category)) {
        predictionScores.set(product.category, (predictionScores.get(product.category) || 0) + 1);
      }
    }
  }

  const totalPredictionVotes = Array.from(predictionScores.values()).reduce(
    (sum, value) => sum + value,
    0
  );
  const [predictedCategory, predictedVotes] =
    Array.from(predictionScores.entries()).sort((a, b) => b[1] - a[1])[0] || [];

  return {
    source: "mongo-fallback",
    user: {
      id: userId,
      name: user ? user.name : "Usuario",
      email: user ? user.email : "",
    },
    level: getLevel(categorySet.size),
    stats: {
      totalOrders: orders.length,
      categoriesCount: categorySet.size,
      categories: myCategories,
      topProduct: topProductEntry
        ? {
            id: topProductEntry.product._id.toString(),
            name: topProductEntry.product.name,
            image: topProductEntry.product.image,
            quantity: topProductEntry.quantity,
          }
        : null,
    },
    timeline,
    prediction: predictedCategory
      ? {
          category: predictedCategory,
          confidence: totalPredictionVotes
            ? Math.round((predictedVotes / totalPredictionVotes) * 100)
            : 0,
          href: `/productos?categoria=${encodeURIComponent(predictedCategory)}`,
        }
      : null,
  };
};

const CYPHER_JOURNEY = `
MATCH (u:User {id: $userId})-[:COMPRÓ]->(o:Order)-[:CONTIENE]->(p:Product)-[:PERTENECE_A]->(c:Category)
RETURN o.id AS orderId, o.fecha AS fecha, o.total AS total, o.estado AS estado,
       collect({id: p.id, nombre: p.nombre, imagen: p.imageUrl, categoria: c.nombre}) AS productos
ORDER BY fecha ASC
`;

const getCustomerJourney = async (userId) => {
  if (isNeo4jAvailable()) {
    try {
      const session = driver.session();
      try {
        await session.executeRead((tx) => tx.run(CYPHER_JOURNEY, { userId }));
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error("No se pudo leer el recorrido desde Neo4j:", error.message);
    }
  }

  return buildMongoJourney(userId);
};

module.exports = {
  getCustomerJourney,
};
