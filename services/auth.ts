// services/auth.ts
import api from "@/lib/axios";
import Cookies from "js-cookie";

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  const token = response.data.access_token;
  Cookies.set("access_token", token); // Store in cookie for middleware

  return response.data;
};

export const logout = () => {
  Cookies.remove("access_token");
};

export const isLoggedIn = () => {
  return !!Cookies.get("access_token");
};
