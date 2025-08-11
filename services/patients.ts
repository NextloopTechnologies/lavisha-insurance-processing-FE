import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const getPatients = () => api.get("/patients");
export const getPatientById = (id?: ParamValue) => api.get(`/patients/${id}`);
export const createPatient = (data: any) => api.post("/patients", data);
export const updatePatient = (data: any, id: string) =>
  api.patch(`/patients/${id}`, data);
export const deletePatient = (id: string) => api.delete(`/patients/${id}`);
export const getPatientsByParams = (params: {
  skip?: number;
  take?: number;
  sortBy?: string;
  cursor?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return api.get("/patients", { params });
};

export const getPatientsByDropdownParams = (params: {
  skip?: number;
  take?: number;
  sortBy?: string;
  cursor?: string;
  sortOrder?: "asc" | "desc";
  search?:string;
}) => {
  return api.get("/patients/dropdown", { params });
};
