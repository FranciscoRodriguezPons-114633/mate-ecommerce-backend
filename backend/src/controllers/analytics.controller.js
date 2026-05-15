const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { redisClient } = require("../config/redis");
const {
  incrementProductView,
  getTopViewedProducts,
} = require("../services/analytics.service");
const { getTopSoldProducts } = require("../services/sales.analytics.service");

const slugify = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const productAliases = {
  "mate-imperial": "Mate Imperial con Virola de Alpaca",
  "bombilla-cincelada": "Bombilla Cincelada de Alpaca",
  "yerba-premium": "Yerba Mate Premium Orgánica 1kg",
  "set-matero-premium": "Set Completo Matero Premium",
  "mate-algarrobo": "Mate de Algarrobo Tallado",
  "termo-acero": "Termo Matero de Acero 1L",
  "bombilla-pico-loro": "Bombilla Pico de Loro Acero",
  "yerba-suave": "Yerba Mate Suave Sin Palo 500g",
};

const trackProductView = async (req, res, next) => {
  try {
    await incrementProductView(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error("No se pudo registrar la vista en Cassandra:", error.message);
    return res.status(204).send();
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    let views = [];

    try {
      views = await getTopViewedProducts(limit);
    } catch (error) {
      console.error("No se pudieron obtener vistas desde Cassandra:", error.message);
    }

    const productIds = views.map((item) => item.product_id);
    const objectIds = productIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const [productsById, allProducts] = await Promise.all([
      Product.find({ _id: { $in: objectIds } }).lean(),
      Product.find().lean(),
    ]);

    const productsByIdMap = new Map(
      productsById.map((product) => [product._id.toString(), product])
    );
    const productsBySlugMap = new Map(
      allProducts.map((product) => [slugify(product.name), product])
    );
    const productsByNameMap = new Map(
      allProducts.map((product) => [product.name, product])
    );

    const products = views.length
      ? views.map((item) => {
      const product =
        productsByIdMap.get(item.product_id) ||
        productsBySlugMap.get(item.product_id) ||
        productsByNameMap.get(productAliases[item.product_id]);

      return {
        product_id: item.product_id,
        views: item.views,
        name: product ? product.name : null,
        image: product ? product.image : null,
        product,
      };
    })
      : allProducts.slice(0, limit).map((product, index) => ({
          product_id: product._id.toString(),
          views: 0,
          name: product.name,
          image: product.image,
          product,
          position: index + 1,
        }));

    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getTopSoldProductsController = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `analytics:top-sold-products:${limit}`;

    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    }

    let sales = [];

    try {
      sales = await getTopSoldProducts(limit);
    } catch (error) {
      console.error("No se pudieron obtener ventas desde Cassandra:", error.message);
    }

    if (!sales.length) {
      sales = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            sales: { $sum: "$items.quantity" },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: limit },
      ]).then((rows) =>
        rows.map((row) => ({
          product_id: row._id.toString(),
          sales: row.sales,
        }))
      );
    }

    const productIds = sales.map((item) => item.product_id);
    const objectIds = productIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const [productsById, allProducts] = await Promise.all([
      Product.find({ _id: { $in: objectIds } }).lean(),
      Product.find().lean(),
    ]);

    const productsByIdMap = new Map(
      productsById.map((product) => [product._id.toString(), product])
    );
    const productsBySlugMap = new Map(
      allProducts.map((product) => [slugify(product.name), product])
    );
    const productsByNameMap = new Map(
      allProducts.map((product) => [product.name, product])
    );

    const response = sales.map((item, index) => {
      const product =
        productsByIdMap.get(item.product_id) ||
        productsBySlugMap.get(item.product_id) ||
        productsByNameMap.get(productAliases[item.product_id]);

      return {
        position: index + 1,
        product_id: item.product_id,
        sales: item.sales,
        name: product ? product.name : "Producto no encontrado",
        image: product ? product.image : null,
        category: product ? product.category : null,
        price: product ? product.price : null,
        product: product || null,
      };
    });

    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(response));
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackProductView,
  getTopProducts,
  getTopSoldProductsController,
};
