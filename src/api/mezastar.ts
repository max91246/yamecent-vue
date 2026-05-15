import { http } from "@/utils/http";

export const getMezastarSeries = () =>
  http.get("/api/admin/mezastar/series");

export const getMezastarTypes = () =>
  http.get("/api/admin/mezastar/types");

export const getMezastarCards = (params: object) =>
  http.post("/api/admin/mezastar/cards", { data: params });
