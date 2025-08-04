import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";

export const getClaims = () => api.get("/claims");
export const getClaimsById = (id: ParamValue) => api.get(`/claims/${id}`);
export const createClaims = (data: any) => api.post("/claims", data);
export const updateClaims = (data: any, id: ParamValue) =>
  api.patch(`/claims/${id}`, data);

export const deleteClaims = (id: string) => api.delete(`/claims/${id}`);

export const getClaimsByParams = (params: {
  skip?: number;
  take?: number;
  sortBy?: string;
  cursor?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return api.get('/claims', { params });
};

