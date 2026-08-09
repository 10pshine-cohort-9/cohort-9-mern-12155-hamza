const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./config/logger");
const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

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

module.exports = app;
