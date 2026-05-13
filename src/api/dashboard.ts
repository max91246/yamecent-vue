import { http } from "@/utils/http";
export const getDashboardStats = () =>
  http.request<{ code: number; data: any }>(
    "get",
    "/api/admin/dashboard/stats"
  );
