// lib/axios.ts
import { logout } from "@/services/auth";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 💥 Response interceptor → logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("error", error);
    if (error.response?.status === 401) {
      logout(); // Remove token + localStorage
      window.location.href = "/login"; // Redirect to login
    }

    return Promise.reject(error);
  }
);

export default api;
