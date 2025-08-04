import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createQuery = (data: any) => api.post("/queries", data);

// export const getQuery = () => api.get("/queries");
