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
export const getAdminHospitalManagerCommentList = () => {
  return api.get(`/comments/list_manager_comments`);
};

export const getlManagerComments = (hospitalId?: string) => {
  return api.get(`/comments?hospitalId=${hospitalId}`);
};

export const markReadForAdminManagerComments = (hospitalId?: string) => {
  return api.patch(`/comments/markRead/${hospitalId}`);
};

export const createManagerChat = (data: {
  text: string;
  hospitalId: string;
  type: string;
}) => {
  return api.post(`/comments`, data);
};
