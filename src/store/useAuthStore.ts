import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";

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
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setAuthenticated: (value: boolean) => {
        set({ isAuthenticated: value });
      },

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
          const res = await axiosInstance.post("/auth/signin", {
            email,
            password,
          });

          if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
          }

          const userData = { email, firstName: "", lastName: "" };
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Login failed. Please try again.";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
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
          // Explicitly clear from localStorage
          localStorage.removeItem("auth-storage");
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
