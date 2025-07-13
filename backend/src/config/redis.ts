import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.on("connect", () => console.log("✅ Redis Client Connected"));

export const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};

export default client;
