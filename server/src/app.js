import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./config/logger.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorHandler.js";
import prisma from "./utils/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

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
