const { createClient } = require("redis");

const redisClient = createClient({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));
redisClient.on("ready", () => console.log("Redis Client Ready"));

// Conectar a Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
