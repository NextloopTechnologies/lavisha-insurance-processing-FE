import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const getProfileById = (id: ParamValue) => api.get(`/users/${id}`);
export const updateProfile = (data: any, id: ParamValue) =>
  api.patch(`/users/${id}`, data);
