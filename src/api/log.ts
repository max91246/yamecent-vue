import { http } from "@/utils/http";
const BASE = "/api/admin/logs";
type R = { code: number; data?: any };

export const getLogFiles   = ()             => http.request<R>("get", `${BASE}/files`);
export const getLogEntries = (params: object) => http.request<R>("get", `${BASE}/entries`, { params });
