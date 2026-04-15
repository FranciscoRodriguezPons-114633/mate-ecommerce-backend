const Product = require("../models/Product");
const { redisClient } = require("../config/redis");

const CACHE_EXPIRY = 3600; // 1 hora en segundos
const CACHE_KEY_PREFIX = "product:";
const CACHE_ALL_KEY = "products:all:";

// Función auxiliar para obtener un producto con caché
const getProductWithCache = async (id) => {
  const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
  
  // Intentar obtener del caché
  try {
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      console.log(`[CACHE HIT] Producto ${id}`);
      return JSON.parse(cachedProduct);
    }
  } catch (error) {
    console.error(`Error reading cache for ${id}:`, error);
    // Continuar sin caché si hay error
  }

  // Cache miss: obtener de la BD
  console.log(`[CACHE MISS] Producto ${id}`);
  const product = await Product.findById(id).lean();
  
  // Guardar en caché
  if (product) {
    try {
      await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(product));
    } catch (error) {
      console.error(`Error setting cache for ${id}:`, error);
    }
  }
  
  return product;
};

// Función auxiliar para invalidar caché de un producto
const invalidateProductCache = async (id) => {
  const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
  try {
    await redisClient.del(cacheKey);
    console.log(`[CACHE INVALIDATED] Producto ${id}`);
  } catch (error) {
    console.error(`Error invalidating cache for ${id}:`, error);
  }
};

// Función auxiliar para invalidar caché de lista de productos
const invalidateAllProductsCache = async () => {
  try {
    // Eliminar todas las claves que comienzan con CACHE_ALL_KEY
    const keys = await redisClient.keys(`${CACHE_ALL_KEY}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[CACHE INVALIDATED] ${keys.length} cache keys eliminadas`);
    }
  } catch (error) {
    console.error(`Error invalidating all products cache:`, error);
  }
};

const getAllProducts = async (page = 1, limit = 10) => {
  const cacheKey = `${CACHE_ALL_KEY}page:${page}:limit:${limit}`;
  
  // Intentar obtener del caché
  try {
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log(`[CACHE HIT] getAllProducts page:${page}`);
      return JSON.parse(cachedResult);
    }
  } catch (error) {
    console.error(`Error reading cache for getAllProducts:`, error);
  }

  // Cache miss: obtener de la BD
  console.log(`[CACHE MISS] getAllProducts page:${page}`);
  const skip = (page - 1) * limit;
  const products = await Product.find().lean().sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Product.countDocuments();
  const totalPages = Math.ceil(total / limit);
  
  const result = {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
  
  // Guardar en caché
  try {
    await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(result));
  } catch (error) {
    console.error(`Error setting cache for getAllProducts:`, error);
  }
  
  return result;
};

const getProduct = async (id) => {
  try {
    return await getProductWithCache(id);
  } catch (error) {
    throw new Error(`Error al obtener producto con ID '${id}': ${error.message}`);
  }
};

const addProduct = async (data) => {
  try {
    // Validación básica
    if (!data.name || !data.price) {
      throw new Error("Nombre y precio son obligatorios");
    }
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }
    if (data.description && data.description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
    const product = new Product(data);
    const saved = await product.save();
    
    // Invalidar caché de lista de productos
    await invalidateAllProductsCache();
    
    return saved;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error(`Producto con nombre '${data.name}' ya existe`);
    }
    throw new Error(`Error al crear producto con nombre '${data.name}': ${error.message}`);
  }
};

const updateProductService = async (id, data) => {
  try {
    // Validación básica
    if (Object.keys(data).length === 0) {
      throw new Error("Debe proporcionar datos para actualizar");
    }
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }
    if (data.description && data.description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
    const existing = await Product.findById(id);
    if (!existing) {
      return null; // O lanza error
    }
    const updated = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    
    // Invalidar caché del producto actualizado y la lista
    await invalidateProductCache(id);
    await invalidateAllProductsCache();
    
    return updated;
  } catch (error) {
    throw new Error(`Error al actualizar producto con ID '${id}': ${error.message}`);
  }
};

const deleteProductService = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    
    if (result) {
      // Invalidar caché del producto eliminado y la lista
      await invalidateProductCache(id);
      await invalidateAllProductsCache();
    }
    
    return result !== null;
  } catch (error) {
    throw new Error(`Error al eliminar producto con ID '${id}': ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
  getProductWithCache,
  invalidateProductCache,
  invalidateAllProductsCache,
};