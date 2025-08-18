import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createUsers = (data: any) => api.post("/users", data);




