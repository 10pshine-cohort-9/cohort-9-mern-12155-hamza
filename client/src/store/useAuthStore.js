import { create } from "zustand";
import axiosClient from "../api/axiosClient.js";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  login: async (credentials) => {
    const response = await axiosClient.post("/auth/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },
  register: async (credentials) => {
    const response = await axiosClient.post("/auth/signup", credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
