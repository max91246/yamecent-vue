import { http } from "@/utils/http";

const BASE = "/api/admin/member";

type Result = { code: number; data?: any };
type ResultTable = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getMemberList = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/`, { data });
export const createMember = (data?: object) =>
  http.request<Result>("post", `${BASE}/create`, { data });
export const updateMember = (data: any) =>
  http.request<Result>("put", `${BASE}/${data.id}`, { data });
export const deleteMember = (id: number) =>
  http.request<Result>("delete", `${BASE}/${id}`);
export const activateMembership = (id: number, data: object) =>
  http.request<Result>("post", `${BASE}/${id}/activate`, { data });
export const revokeMembership = (id: number) =>
  http.request<Result>("post", `${BASE}/${id}/revoke`);
export const getBalanceLogs = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/balance/logs`, { data });
export const balanceAdjust = (data?: object) =>
  http.request<Result>("post", `${BASE}/balance/adjust`, { data });
