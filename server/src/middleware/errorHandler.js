const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const raw = err.statusCode;
  const statusCode =
    Number.isInteger(raw) && raw >= 400 && raw <= 599 ? raw : 500;
  const message = err.isOperational ? err.message : "Internal server error";

  logger.error({
    err,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
