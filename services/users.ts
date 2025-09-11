import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createUsers = (data: any) => api.post("/users", data);
export const getUsersDropdown = (role?: string) =>
  api.get(`/users/dropdown?role=${role}`);

export const getUsers = () => api.get(`/users`);

export const updateUser = (data: any, id: string) =>
  api.patch(`/users/${id}`, data);

export const getUsersByParams = (params: {
  skip?: number;
  take?: number;
  sortBy?: string;
  cursor?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return api.get("/users", { params });
};
export const getUserById = (id?: string) => api.get(`/users/${id}`);

export const deleteUsers = (id: string) => api.delete(`/users/${id}`);
