import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";


export const getNotificationsByParams = (params: {
  isRead?:boolean
}) => {
  return api.get('/notifications', { params });
};

// export const markAllRead = (params: {
//   isRead?:boolean
// }) => {
//   return api.get('/notifications', { params });
// };

export const markAllRead = async (ids: string[], markAll = false) => {
  return api.patch("/notifications", {
    markAllRead: markAll,
    batchRead: ids,
  });
};
