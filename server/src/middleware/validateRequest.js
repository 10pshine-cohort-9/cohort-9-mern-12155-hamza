import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => err.msg).join(", ");
    throw new AppError(formattedErrors, 400);
  }
  next();
};
