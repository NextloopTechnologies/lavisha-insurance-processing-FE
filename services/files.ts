import api from "@/lib/axios";

export const getFiles = () => api.get("/file/upload");
// export const getPatientById = (id: string) => api.get(`/patients/${id}`);
export const uploadFiles = (data: any) =>
  api.post("/file/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const bulkUploadFiles = (data: any) =>
  api.post("/file/bulkUpload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


export const bulkDeleteFiles = (fileNames: string[]) =>
  api.delete("/file/bulkDelete", { data: { fileNames } });

// Short-lived link that makes the browser save a claim document under its original name
export const getDownloadUrl = (key: string) =>
  api.get<{ url: string; fileName: string }>("/file/download-url", { params: { key } });

// export const deletePatient = (id: string) => api.delete(`/patients/${id}`);
