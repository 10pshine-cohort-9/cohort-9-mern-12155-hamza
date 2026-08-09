const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use(errorHandler);

module.exports = app;
