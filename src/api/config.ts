import { http } from "@/utils/http";
const BASE = "/api/admin/config";
type R = { code: number; data?: any };
type RT = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getConfigList = (data?: object) =>
  http.request<RT>("post", `${BASE}/`, { data });
export const createConfig = (data?: object) =>
  http.request<R>("post", `${BASE}/create`, { data });
export const updateConfig = (data: any) =>
  http.request<R>("put", `${BASE}/${data.id}`, { data });
export const deleteConfig = (id: number) =>
  http.request<R>("delete", `${BASE}/${id}`);
