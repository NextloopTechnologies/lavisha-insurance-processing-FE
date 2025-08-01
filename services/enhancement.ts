import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createEnhancements = (data: any) => api.post("/enhancements", data);

export const getEnhancements = () => api.get("/enhancements");
