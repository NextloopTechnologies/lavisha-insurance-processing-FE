import api from "@/lib/axios";

export const getClaims = () => api.get("/claims");
export const getClaimsById = (id: string) => api.get(`/claims/${id}`);
export const createClaims = (data: any) => api.post("/claims", data);
export const deleteClaims = (id: string) => api.delete(`/claims/${id}`);
