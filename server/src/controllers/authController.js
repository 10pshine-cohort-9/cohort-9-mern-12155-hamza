import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import { registerUser, loginUser } from "../services/authService.js";
import prisma from "../utils/prisma.js";
import { z } from "zod";

const authSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(6, { error: "Password must be at least 6 characters" }),
});

export const signup = async (req, res, next) => {
  try {
    const validationResult = authSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(validationResult.error.errors[0].message, 400);
    }
    const { email, password } = validationResult.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }
    const user = await registerUser({ email, password });
    logger.info({ userId: user.id }, "User registered successfully");
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validationResult = authSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(validationResult.error.errors[0].message, 400);
    }
    const { email, password } = validationResult.data;
    const result = await loginUser({ email, password });
    if (!result) {
      throw new AppError("Invalid credentials", 401);
    }
    logger.info({ userId: result.user.id }, "User logged in successfully");
    res.status(200).json({
      success: true,
      data: {
        id: result.user.id,
        email: result.user.email,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};
