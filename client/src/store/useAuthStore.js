import { create } from "zustand";
import axiosClient from "../api/axiosClient.js";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (credentials) => {
    try {
      const response = await axiosClient.post("/auth/login", credentials);
      const { token, id, email } = response.data.data;
      set({ user: { id, email }, token, isAuthenticated: true });
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false });
      throw error;
    }
  },
  register: async (credentials) => {
    try {
      await axiosClient.post("/auth/signup", credentials);
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false });
      throw error;
    }
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
