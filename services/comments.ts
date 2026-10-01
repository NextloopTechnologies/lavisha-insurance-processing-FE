import api from "@/lib/axios";
import { CommentType } from "@/types/comments";

// The API derives the caller's role and hospital from the token, so neither is sent.
export const getComments = (params: {
  insuranceRequestId: string;
  cursor?: string;
}) => {
  const { insuranceRequestId } = params;
  return api.get(`/comments`, { params: { insuranceRequestId } });
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
  const params = hospitalId ? { hospitalId } : { type: CommentType.HOSPITAL_NOTE };
  return api.get(`/comments`, { params });
};

export const markReadForAdminManagerComments = (hospitalId?: string) => {
  return api.patch(`/comments/markRead/${encodeURIComponent(hospitalId ?? "")}`);
};

export const createManagerChat = (data: {
  text: string;
  hospitalId: string;
  type: string;
}) => {
  return api.post(`/comments`, data);
};

export const markCommentsAsRead = (insuranceRequestId: Number | string) => {
  return api.patch(`/comments/mark_read`, { insuranceRequestId });
};
