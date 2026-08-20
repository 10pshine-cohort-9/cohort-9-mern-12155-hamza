import prisma from "../utils/prisma.js";

export const createNote = async (userId, data) => {
  return await prisma.note.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getNotes = async (userId) => {
  return await prisma.note.findMany({
    where: { userId },
  });
};

export const getNoteById = async (userId, noteId) => {
  return await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });
};

export const updateNote = async (userId, noteId, data) => {
  return await prisma.note.updateMany({
    where: { id: noteId, userId },
    data,
  });
};

export const deleteNote = async (userId, noteId) => {
  return await prisma.note.deleteMany({
    where: { id: noteId, userId },
  });
};
