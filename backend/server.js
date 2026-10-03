import fs from "fs";
import express from "express";
import mongoose from "mongoose";
import { createClient } from "redis";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const MONGO_URL =
  process.env.MONGO_URL ||
  `mongodb://${fs.readFileSync(
    "/etc/shopfast-secrets/mongo-username",
    "utf8"
  ).trim()}:${fs.readFileSync(
    "/etc/shopfast-secrets/mongo-password",
    "utf8"
  ).trim()}@mongodb:27017/shopfast?authSource=admin`;

const REDIS_URL = "redis://redis:6379";

async function connectServices() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    const redisClient = createClient({
      url: REDIS_URL
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    await redisClient.connect();

    console.log("Redis connected");

    return redisClient;
  } catch (error) {
    console.error("Service connection failed:", error);
    process.exit(1);
  }
}

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "backend"
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "ShopFast Backend API"
  });
});

connectServices().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
  });
});
