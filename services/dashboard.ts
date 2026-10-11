import api from "@/lib/axios";

// hospitalUserId is only an admin filter; for hospital users the API uses the token.
export const getDashboardByDate = (
  startDate?: Date,
  endDate?: Date,
  hospitalUserId?: string | number
) => {
  const hospitalFilter =
    typeof hospitalUserId === "string" ? hospitalUserId.trim() : hospitalUserId;
  return api.get(`/dashboard`, {
    params: {
      fromDate: startDate,
      toDate: endDate,
      ...(hospitalFilter ? { hospitalUserId: hospitalFilter } : {}),
    },
  });
};
