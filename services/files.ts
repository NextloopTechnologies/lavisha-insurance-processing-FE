import api from "@/lib/axios";

export const getFiles = () => api.get("/file/upload");
// export const getPatientById = (id: string) => api.get(`/patients/${id}`);
export const uploadFiles = (data: any) =>
  api.post("/file/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
// export const deletePatient = (id: string) => api.delete(`/patients/${id}`);
