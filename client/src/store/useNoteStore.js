import { create } from "zustand";
import axiosClient from "../api/axiosClient.js";

const useNoteStore = create((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  error: null,

  setCurrentNote: (note) => set({ currentNote: note }),

  clearCurrentNote: () => set({ currentNote: null }),

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.get("/notes");
      set({ notes: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch notes", loading: false });
      throw error;
    }
  },

  createNote: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.post("/notes", data);
      const newNote = response.data.data;
      set((state) => ({
        notes: [newNote, ...state.notes],
        loading: false,
      }));
      return newNote;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to create note", loading: false });
      throw error;
    }
  },

  updateNote: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.put(`/notes/${id}`, data);
      const updatedNote = response.data.data;
      set((state) => ({
        notes: state.notes.map((note) => (note.id === id ? updatedNote : note)),
        currentNote: null,
        loading: false,
      }));
      return updatedNote;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update note", loading: false });
      throw error;
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosClient.delete(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to delete note", loading: false });
      throw error;
    }
  },
}));

export default useNoteStore;
