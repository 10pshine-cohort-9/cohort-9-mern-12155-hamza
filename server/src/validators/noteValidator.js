import { body } from "express-validator";

export const noteValidator = [
  body("title").isString().notEmpty(),
  body("content").isString(),
];
