import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      logger.warn({ ip: req.ip }, "Unauthorized access attempt");
      throw new AppError("Not authorized to access this route", 401);
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      logger.warn({ ip: req.ip }, "Unauthorized access attempt");
      throw new AppError("Not authorized to access this route", 401);
    }
  } catch (error) {
    next(error);
  }
};
