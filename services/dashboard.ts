import api from "@/lib/axios";

export const getDashboardByDate = (
  startDate?: Date,
  endDate?: Date,
  hospitalUserId?: string | number
) =>
  api.get(
    `/dashboard?fromDate=${startDate}&toDate=${endDate}&hospitalUserId=${hospitalUserId}`
  );
