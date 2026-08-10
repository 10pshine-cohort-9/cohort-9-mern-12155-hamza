import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./config/logger.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorHandler.js";
import prisma from "./utils/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.all("*", (req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

const connectDatabase = async () => {
  await prisma.$connect();
  logger.info("Database connection established successfully");
};

export { app, connectDatabase };
