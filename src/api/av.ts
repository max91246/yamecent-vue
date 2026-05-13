import { http } from "@/utils/http";
const BASE = "/api/admin/av";
type R = { code: number; data?: any };
type RT = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getVideoList = (data?: object) =>
  http.request<RT>("post", `${BASE}/videos`, { data });
export const updateVideo = (data: any) =>
  http.request<R>("put", `${BASE}/videos/${data.id}`, { data });
export const deleteVideo = (id: number) =>
  http.request<R>("delete", `${BASE}/videos/${id}`);
export const getActressList = (data?: object) =>
  http.request<RT>("post", `${BASE}/actresses`, { data });
export const updateActress = (data: any) =>
  http.request<R>("put", `${BASE}/actresses/${data.id}`, { data });
export const deleteActress = (id: number) =>
  http.request<R>("delete", `${BASE}/actresses/${id}`);
