import api from "@/lib/axios";

export const getDashboardByDate = (startDate?: Date, endDate?: Date) =>
  api.get(`/dashboard?fromDate=${startDate}&toDate=${endDate}`);
