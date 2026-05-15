import { http } from "@/utils/http";

export const getMezastarSeries = () =>
  http.get("/api/admin/mezastar/series");

export const getMezastarTypes = () =>
  http.get("/api/admin/mezastar/types");

export const getMezastarCards = (params: object) =>
  http.post("/api/admin/mezastar/cards", { data: params });

export const toggleGigantamax = (id: number, is_gigantamax: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/gigantamax`, { data: { is_gigantamax } });

export const toggleMega = (id: number, is_mega: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/mega`, { data: { is_mega } });
