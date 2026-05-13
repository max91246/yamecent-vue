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
type SR = { code: number; data?: any };
const sq = (path: string, params: object, timeout = 15000) =>
  http.request<SR>("get", `${BASE}/${path}`, { params, timeout });

export const getStockQuote        = (code: string) => sq("quote",         { code }, 15000);
export const getStockInstitutional = (code: string) => sq("institutional", { code }, 30000);
export const getStockDistribution  = (code: string) => sq("distribution",  { code }, 20000);
export const getStockRevenue       = (code: string) => sq("revenue",       { code }, 30000);
export const getStockNews          = (code: string, ticker: string) =>
  sq("news", { code, ticker }, 15000);
