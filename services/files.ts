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

// Must match MAX_BULK_FILES on the API.
export const MAX_FILES_PER_UPLOAD = 20;

/** Uploads any number of files, in batches the API accepts. Results keep the input order. */
export async function uploadManyFiles(files: File[], folder: string): Promise<{ key: string; url?: string }[]> {
  const results: { key: string; url?: string }[] = [];
  for (let i = 0; i < files.length; i += MAX_FILES_PER_UPLOAD) {
    const formData = new FormData();
    files.slice(i, i + MAX_FILES_PER_UPLOAD).forEach((file) => formData.append("files", file));
    formData.append("folder", folder);
    const res = await bulkUploadFiles(formData);
    results.push(...res.data);
  }
  return results;
}

export const bulkDeleteFiles = (fileNames: string[]) =>
  api.delete("/file/bulkDelete", { data: { fileNames } });

// Short-lived link that makes the browser save a claim document under its original name
export const getDownloadUrl = (key: string) =>
  api.get<{ url: string; fileName: string }>("/file/download-url", { params: { key } });

// export const deletePatient = (id: string) => api.delete(`/patients/${id}`);
