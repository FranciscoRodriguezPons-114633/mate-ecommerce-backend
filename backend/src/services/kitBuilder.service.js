const Order = require("../models/Order");
const Product = require("../models/Product");
const { driver, isNeo4jAvailable } = require("../config/neo4j");

const KIT_CATEGORIES = ["Yerba", "Calabazas", "Bombillas", "Termos", "Yerberas"];

const CYPHER_KIT_BUILDER = `
MATCH (u:User {id: $userId})-[:COMPRÓ]->(:Order)-[:CONTIENE]->(p:Product)-[:PERTENECE_A]->(c:Category)
WITH collect(DISTINCT c.nombre) AS categoriasCompradas
WITH categoriasCompradas, [c IN $todasLasCategorias WHERE NOT c IN categoriasCompradas] AS faltantes
UNWIND faltantes AS catFaltante
MATCH (p:Product)-[:PERTENECE_A]->(c:Category {nombre: catFaltante})
OPTIONAL MATCH (:User)-[:COMPRÓ]->(:Order)-[:CONTIENE]->(p)
RETURN categoriasCompradas,
       catFaltante,
       p.id AS productoId,
       p.nombre AS nombre,
       p.imageUrl AS imagen,
       p.precio AS precio,
       count(*) AS vecesComprado
ORDER BY catFaltante, vecesComprado DESC
`;

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const toKitCategory = (product) => {
  const category = normalizeText(product.category);
  const name = normalizeText(product.name);

  if (category.includes("yerbera") || category.includes("set")) return "Yerberas";
  if (category.includes("yerba")) return "Yerba";
  if (category.includes("calabaza")) return "Calabazas";
  if (category.includes("bombilla")) return "Bombillas";
  if (category.includes("termo")) return "Termos";

  if (name.includes("yerbera")) return "Yerberas";
  if (name.includes("yerba")) return "Yerba";
  if (name.includes("bombilla")) return "Bombillas";
  if (name.includes("termo")) return "Termos";
  if (name.includes("set")) return "Yerberas";
  if (/\bmate\b/.test(name) || name.includes("calabaza") || name.includes("camionero") || name.includes("torpedo")) {
    return "Calabazas";
  }

  return null;
};

const categoryCandidateScore = (product, kitCategory) => {
  const category = normalizeText(product.category);
  const name = normalizeText(product.name);

  const scoreByCategory = {
    Yerba: [
      { test: category.includes("yerba") && !category.includes("yerbera"), score: 100 },
      { test: name.includes("yerba") && !name.includes("yerbera"), score: 90 },
    ],
    Calabazas: [
      { test: category.includes("calabaza"), score: 100 },
      { test: /\bmate\b/.test(name) || name.includes("camionero") || name.includes("torpedo"), score: 90 },
    ],
    Bombillas: [
      { test: category.includes("bombilla") || name.includes("bombilla"), score: 100 },
    ],
    Termos: [
      { test: category.includes("termo") || name.includes("termo"), score: 100 },
      { test: category.includes("accesorio") || name.includes("set"), score: 45 },
    ],
    Yerberas: [
      { test: category.includes("yerbera") || name.includes("yerbera"), score: 100 },
      { test: category.includes("set") || name.includes("set"), score: 75 },
      { test: category.includes("accesorio"), score: 35 },
    ],
  };

  return Math.max(
    0,
    ...(scoreByCategory[kitCategory] || []).map((rule) =>
      rule.test ? rule.score : 0
    )
  );
};

const productToKitItem = (product, category, status, sales = 0) => ({
  category,
  status,
  product: product
    ? {
        id: product._id.toString(),
        name: product.name,
        image: product.image,
        price: product.price,
        discountPercentage: product.discountPercentage || 0,
        category: product.category,
      }
    : null,
  sales,
});

const getSalesByProduct = async () => {
  const rows = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        sales: { $sum: "$items.quantity" },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.sales]));
};

const buildMongoKit = async (userId) => {
  const [orders, products, salesByProduct] = await Promise.all([
    userId ? Order.find({ user: userId }).lean() : [],
    Product.find().lean(),
    getSalesByProduct(),
  ]);

  const boughtCategories = new Set();
  const ownedProductsByCategory = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const product = products.find(
        (candidate) => candidate._id.toString() === item.product.toString()
      );
      if (!product) continue;

      const kitCategory = toKitCategory(product);
      if (!kitCategory) continue;

      boughtCategories.add(kitCategory);
      if (!ownedProductsByCategory.has(kitCategory)) {
        ownedProductsByCategory.set(kitCategory, product);
      }
    }
  }

  const productsByKitCategory = new Map();
  for (const product of products) {
    const kitCategory = toKitCategory(product);
    if (!kitCategory) continue;

    const current = productsByKitCategory.get(kitCategory) || [];
    current.push(product);
    productsByKitCategory.set(kitCategory, current);
  }

  const findRecommendedProduct = (category) => {
    const exactCandidates = productsByKitCategory.get(category) || [];
    const scoredCandidates = products
      .map((product) => ({
        product,
        score: categoryCandidateScore(product, category),
        sales: salesByProduct.get(product._id.toString()) || 0,
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || b.sales - a.sales);

    const fallbackCandidates = products
      .map((product) => ({
        product,
        sales: salesByProduct.get(product._id.toString()) || 0,
      }))
      .sort((a, b) => b.sales - a.sales);

    return (
      exactCandidates.sort(
        (a, b) =>
          (salesByProduct.get(b._id.toString()) || 0) -
          (salesByProduct.get(a._id.toString()) || 0)
      )[0] ||
      scoredCandidates[0]?.product ||
      fallbackCandidates[0]?.product ||
      null
    );
  };

  const items = KIT_CATEGORIES.map((category) => {
    if (boughtCategories.has(category)) {
      return productToKitItem(
        ownedProductsByCategory.get(category),
        category,
        "owned",
        salesByProduct.get(ownedProductsByCategory.get(category)?._id.toString()) || 0
      );
    }

    const recommended = findRecommendedProduct(category);

    return productToKitItem(
      recommended || null,
      category,
      "missing",
      recommended ? salesByProduct.get(recommended._id.toString()) || 0 : 0
    );
  });

  const completed = items.filter((item) => item.status === "owned").length;
  const missing = items.filter((item) => item.status === "missing" && item.product);

  return {
    source: "mongo-fallback",
    categories: KIT_CATEGORIES,
    completed,
    total: KIT_CATEGORIES.length,
    progress: Math.round((completed / KIT_CATEGORIES.length) * 100),
    items,
    missing,
    discount: missing.length ? 10 : 0,
    coupon:
      completed === KIT_CATEGORIES.length
        ? {
            code: "MATERO10",
            message: "Felicitaciones, completaste tu kit y te ganaste un cupón.",
            discount: 10,
          }
        : null,
  };
};

const getNeo4jKit = async (userId) => {
  const session = driver.session();

  try {
    await session.executeRead((tx) =>
      tx.run(CYPHER_KIT_BUILDER, {
        userId,
        todasLasCategorias: KIT_CATEGORIES,
      })
    );
  } finally {
    await session.close();
  }
};

const getKitBuilder = async (userId) => {
  if (isNeo4jAvailable()) {
    try {
      await getNeo4jKit(userId);
    } catch (error) {
      console.error("No se pudo armar el kit desde Neo4j:", error.message);
    }
  }

  return buildMongoKit(userId);
};

module.exports = {
  getKitBuilder,
  KIT_CATEGORIES,
};
