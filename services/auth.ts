import api from "@/lib/axios";
import Cookies from "js-cookie";

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  const resData = response.data;
  Cookies.set("access_token", resData?.access_token); // Store in cookie for middleware
  localStorage.setItem("userName", resData?.user?.name);
  localStorage.setItem("userId", resData?.user?.id);

  localStorage.setItem("userRole", resData?.user?.role);
  return response.data;
};
export const logout = () => {
  Cookies.remove("access_token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
};

export const isLoggedIn = () => {
  return !!Cookies.get("access_token");
};
