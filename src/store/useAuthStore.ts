import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: "ADMIN" | "USER";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: "ADMIN" | "USER"
  ) => Promise<void>;

  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;

  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signup: async (firstName, lastName, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      // Signup successful, user needs to verify OTP
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "OTP verification failed. Please try again.";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  resendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/auth/resend-otp", {
        email,
      });
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend OTP.";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  signin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/signin", {
        email,
        password,
      });

      // Store user info in local state
      set({
        user: { email, firstName: "", lastName: "" },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Logout failed. Please try again.";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
