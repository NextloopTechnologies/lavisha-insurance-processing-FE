import api from "@/lib/axios";

export const getPatients = () => api.get("/patients");
export const getPatientById = (id: string) => api.get(`/patients/${id}`);
export const createPatient = (data: any) => api.post("/patients", data);
export const updatePatient = (data: any, id: string) =>
  api.patch(`/patients/${id}`, data);
export const deletePatient = (id: string) => api.delete(`/patients/${id}`);
