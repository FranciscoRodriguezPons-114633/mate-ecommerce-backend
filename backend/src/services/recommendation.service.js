const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { driver, isNeo4jAvailable } = require("../config/neo4j");

const CYPHER_COLLABORATIVE_RECOMMENDATIONS = `
MATCH (me:User {id: $userId})-[:PURCHASED]->(owned:Product)
MATCH (similar:User)-[:PURCHASED]->(owned)
WHERE similar.id <> me.id
MATCH (similar)-[purchase:PURCHASED]->(candidate:Product)
WHERE NOT (me)-[:PURCHASED]->(candidate)
OPTIONAL MATCH (candidate)-[:IN_CATEGORY]->(category:Category)
RETURN candidate, category, count(DISTINCT similar) AS similarUsers, sum(purchase.quantity) AS score
ORDER BY score DESC, similarUsers DESC
LIMIT $limit
`;

const CYPHER_CATEGORY_TRAVERSAL = `
MATCH (me:User {id: $userId})-[:PURCHASED]->(:Product)-[:IN_CATEGORY]->(category:Category)
MATCH (category)<-[:IN_CATEGORY]-(candidate:Product)
WHERE NOT (me)-[:PURCHASED]->(candidate)
RETURN candidate, category
LIMIT $limit
`;

const nodeKey = (type, id) => `${type}:${id}`;

const addNode = (map, node) => {
  const key = nodeKey(node.type, node.id);
  if (!map.has(key)) {
    map.set(key, node);
  }
};

const productToRecommendation = (product, score, reason, position) => ({
  position,
  product_id: product._id.toString(),
  score,
  reason,
  name: product.name,
  image: product.image,
  category: product.category,
  price: product.price,
  product,
});

const getNeo4jRecommendations = async (userId, limit) => {
  const session = driver.session();

  try {
    const result = await session.executeRead((tx) =>
      tx.run(CYPHER_COLLABORATIVE_RECOMMENDATIONS, {
        userId,
        limit: Number(limit),
      })
    );

    if (!result.records.length) {
      return null;
    }

    const productIds = result.records
      .map((record) => record.get("candidate").properties.id)
      .filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    return result.records
      .map((record, index) => {
        const productId = record.get("candidate").properties.id;
        const product = productsById.get(productId);
        if (!product) return null;

        return productToRecommendation(
          product,
          Number(record.get("score") || 0),
          "Usuarios con compras similares tambien eligieron este producto.",
          index + 1
        );
      })
      .filter(Boolean);
  } finally {
    await session.close();
  }
};

const getMongoRecommendations = async (userId, limit) => {
  const [user, myOrders, allOrders, allProducts] = await Promise.all([
    User.findById(userId).lean(),
    Order.find({ user: userId }).lean(),
    Order.find().populate("user", "name email").lean(),
    Product.find().lean(),
  ]);

  const productsById = new Map(
    allProducts.map((product) => [product._id.toString(), product])
  );
  const myProductIds = new Set();
  const myCategories = new Set();
  const candidateScores = new Map();
  const nodes = new Map();
  const relationships = [];

  addNode(nodes, {
    id: userId,
    type: "User",
    label: user ? user.name : "Usuario",
  });

  for (const order of myOrders) {
    addNode(nodes, {
      id: order._id.toString(),
      type: "Order",
      label: `Pedido ${order._id.toString().slice(-6)}`,
    });

    relationships.push({
      from: userId,
      to: order._id.toString(),
      type: "PURCHASED",
      date: order.createdAt,
    });

    for (const item of order.items) {
      const productId = item.product.toString();
      const product = productsById.get(productId);
      myProductIds.add(productId);

      relationships.push({
        from: order._id.toString(),
        to: productId,
        type: "CONTAINS",
        quantity: item.quantity,
      });

      if (product) {
        myCategories.add(product.category);
        addNode(nodes, {
          id: productId,
          type: "Product",
          label: product.name,
          image: product.image,
        });
        addNode(nodes, {
          id: product.category,
          type: "Category",
          label: product.category,
        });
        relationships.push({
          from: productId,
          to: product.category,
          type: "IN_CATEGORY",
        });
      }
    }
  }

  for (const order of allOrders) {
    const orderProductIds = order.items.map((item) => item.product.toString());
    const sharesProduct = orderProductIds.some((productId) =>
      myProductIds.has(productId)
    );
    const sharesCategory = orderProductIds.some((productId) => {
      const product = productsById.get(productId);
      return product && myCategories.has(product.category);
    });

    if (!sharesProduct && !sharesCategory) continue;

    for (const item of order.items) {
      const productId = item.product.toString();
      const product = productsById.get(productId);

      if (!product || myProductIds.has(productId)) continue;

      const previous = candidateScores.get(productId) || {
        product,
        score: 0,
        similarUsers: new Set(),
        sharedCategories: new Set(),
      };

      previous.score += item.quantity * (sharesProduct ? 3 : 1);
      if (order.user?._id) {
        previous.similarUsers.add(order.user._id.toString());
      }
      if (myCategories.has(product.category)) {
        previous.sharedCategories.add(product.category);
      }
      candidateScores.set(productId, previous);
    }
  }

  if (!candidateScores.size) {
    for (const product of allProducts) {
      const productId = product._id.toString();

      candidateScores.set(productId, {
        product,
        score: myProductIds.has(productId)
          ? 1
          : myCategories.has(product.category)
          ? 2
          : 1,
        isRestock: myProductIds.has(productId),
        similarUsers: new Set(),
        sharedCategories: new Set(myCategories.has(product.category) ? [product.category] : []),
      });
    }
  }

  const recommendations = Array.from(candidateScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit) || 8)
    .map((candidate, index) => {
      const productId = candidate.product._id.toString();
      addNode(nodes, {
        id: productId,
        type: "Product",
        label: candidate.product.name,
        image: candidate.product.image,
        recommended: true,
      });
      addNode(nodes, {
        id: candidate.product.category,
        type: "Category",
        label: candidate.product.category,
      });
      relationships.push({
        from: productId,
        to: candidate.product.category,
        type: "IN_CATEGORY",
      });
      relationships.push({
        from: userId,
        to: productId,
        type: "SIMILAR_TO",
        score: candidate.score,
      });

      return productToRecommendation(
        candidate.product,
        candidate.score,
        candidate.isRestock
          ? "Ya lo compraste antes; puede ser una buena recompra."
          : candidate.sharedCategories.size
          ? `Relacionado con ${Array.from(candidate.sharedCategories).join(", ")}.`
          : "Usuarios con compras similares eligieron este producto.",
        index + 1
      );
    });

  return {
    source: "mongo-fallback",
    user: {
      id: userId,
      name: user ? user.name : "Usuario",
    },
    recommendations,
    graph: {
      nodes: Array.from(nodes.values()).slice(0, 32),
      relationships: relationships.slice(0, 48),
    },
    stats: {
      purchasedProducts: myProductIds.size,
      categories: myCategories.size,
      recommendations: recommendations.length,
    },
    cypherExamples: {
      collaborative: CYPHER_COLLABORATIVE_RECOMMENDATIONS.trim(),
      categoryTraversal: CYPHER_CATEGORY_TRAVERSAL.trim(),
    },
  };
};

const getRecommendationGraph = async (userId, limit = 8) => {
  if (isNeo4jAvailable()) {
    try {
      const neo4jRecommendations = await getNeo4jRecommendations(userId, limit);

      if (neo4jRecommendations && neo4jRecommendations.length) {
        const fallback = await getMongoRecommendations(userId, limit);
        return {
          ...fallback,
          source: "neo4j",
          recommendations: neo4jRecommendations,
        };
      }
    } catch (error) {
      console.error("No se pudieron obtener recomendaciones desde Neo4j:", error.message);
    }
  }

  return getMongoRecommendations(userId, limit);
};

module.exports = {
  getRecommendationGraph,
};
