import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createEnhancements = (data: any) => api.post("/enhancements", data);
export const updateEnhancements = (data: any, id: ParamValue) =>
  api.patch(`/enhancements/${id}`, data);

export const getEnhancements = () => api.get("/enhancements");
