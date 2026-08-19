import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import * as noteService from "../services/noteService.js";

export const createNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const note = await noteService.createNote(userId, req.body);
    logger.info({ userId, noteId: note.id });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notes = await noteService.getNotes(userId);
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const note = await noteService.getNoteById(userId, req.params.id);
    if (!note) {
      throw new AppError("Note not found or does not belong to the user", 404);
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const existingNote = await noteService.getNoteById(userId, noteId);
    if (!existingNote) {
      throw new AppError("Note not found or does not belong to the user", 404);
    }
    const updatedNote = await noteService.updateNote(userId, noteId, req.body);
    res.status(200).json({ success: true, data: updatedNote });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const existingNote = await noteService.getNoteById(userId, noteId);
    if (!existingNote) {
      throw new AppError("Note not found or does not belong to the user", 404);
    }
    await noteService.deleteNote(userId, noteId);
    logger.info({ userId, noteId });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
