import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization?.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      logger.warn({ ip: req.ip }, "Unauthorized access attempt");
      throw new AppError("Not authorized to access this route", 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.warn({ ip: req.ip }, "Unauthorized access attempt");
    next(new AppError("Not authorized to access this route", 401));
  }
};
