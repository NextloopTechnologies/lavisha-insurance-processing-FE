import api from "@/lib/axios";

export const getComments = (params: {
  role: string;
  insuranceRequestId: string;
  cursor?: string;
}) => {
  const { role, insuranceRequestId, cursor } = params;
  return api.get(
    `/comments?role=${role}&insuranceRequestId=${insuranceRequestId}`
  );
};

export const createComments = (data: {
  text: string;
  insuranceRequestId: string;
  type: string;
}) => {
  return api.post(`/comments`, data);
};
