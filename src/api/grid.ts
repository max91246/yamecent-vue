import { http } from "@/utils/http";

const BASE = "/api/admin/grid";

export const getGridTicker   = (market: string) => http.request("get", `${BASE}/ticker/${market}`);
export const getGridBalance  = ()                => http.request("get", `${BASE}/balance`);

export const getGridStrategies  = ()              => http.request("get",    `${BASE}/strategies`);
export const getGridStrategy    = (id: number)    => http.request("get",    `${BASE}/strategies/${id}`);
export const createGridStrategy = (data: any)     => http.request("post",   `${BASE}/strategies`, { data });
export const updateGridStrategy = (id: number, data: any) =>
  http.request("put", `${BASE}/strategies/${id}`, { data });
export const deleteGridStrategy = (id: number)    => http.request("delete", `${BASE}/strategies/${id}`);

export const startGridStrategy  = (id: number)    => http.request("post",   `${BASE}/strategies/${id}/start`);
export const stopGridStrategy   = (id: number)    => http.request("post",   `${BASE}/strategies/${id}/stop`);

export const getGridOrders  = (id: number) => http.request("get", `${BASE}/strategies/${id}/orders`);
export const getGridTrades  = (id: number) => http.request("get", `${BASE}/strategies/${id}/trades`);
