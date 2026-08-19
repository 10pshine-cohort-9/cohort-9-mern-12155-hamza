import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const registerUser = async ({ email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  return user;
};

export const     loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return null;
  }
         const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }
  const token = jwt.sign({ id:user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return { user,  token };
};
