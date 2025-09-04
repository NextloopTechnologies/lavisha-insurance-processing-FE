import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const createUsers = (data: any) => api.post("/users", data);
export const getUsersDropdown = (role?:string) => api.get(`/users/dropdown?role=${role}`);
export const getUsers = (role?:string) => api.get(`/users`);

