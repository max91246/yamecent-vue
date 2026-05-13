import { http } from "@/utils/http";
const BASE = "/api/admin/stock";
type RT = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getDisposalList = (data?: object) =>
  http.request<RT>("post", `${BASE}/disposals`, { data });
export const getOilPriceList = (data?: object) =>
  http.request<RT>("post", `${BASE}/oil-prices`, { data });
