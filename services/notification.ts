import api from "@/lib/axios";
import { ParamValue } from "next/dist/server/request/params";


export const getNotificationsByParams = (params: {
  isRead?:boolean
}) => {
  return api.get('/notifications', { params });
};
