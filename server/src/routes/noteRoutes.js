import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { noteValidator } from "../validators/noteValidator.js";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.use(protect);

router.post("/", noteValidator, validateRequest, createNote);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", noteValidator, validateRequest, updateNote);
router.delete("/:id", deleteNote);

export default router;
