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

export const toggleUltraGigantamax = (id: number, is_ultra_gigantamax: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/ultra-gigantamax`, { data: { is_ultra_gigantamax } });

export const toggleDualMove = (id: number, is_dual_move: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/dual-move`, { data: { is_dual_move } });

export const toggleZMove = (id: number, is_z_move: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/z-move`, { data: { is_z_move } });

export const toggleMythical = (id: number, is_mythical: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/mythical`, { data: { is_mythical } });

export const toggleDoubleRush = (id: number, is_double_rush: number) =>
  http.request("put", `/api/admin/mezastar/cards/${id}/double-rush`, { data: { is_double_rush } });

export const updateCard = (id: number, data: object) =>
  http.request("put", `/api/admin/mezastar/cards/${id}`, { data });
