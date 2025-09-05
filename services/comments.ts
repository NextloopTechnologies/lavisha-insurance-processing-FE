import api from "@/lib/axios";
import { CommentType } from "@/types/comments";

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

export const getManagerChatsUnReadCount = () => {
  return api.get(`/comments/manager_chats_unReadCount`);
};

export const getlManagerComments = (hospitalId?: string) => {
  // hospitalId is required for admin and superadmin and type is required for manager chats
  const query = hospitalId ? `hospitalId=${hospitalId}` : `type=${CommentType.HOSPITAL_NOTE}`;
  return api.get(`/comments?${query}`);
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
