import { http } from "@/utils/http";

const BASE = "/api/admin/article";

type Result = { code: number; data?: any };
type ResultTable = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getArticleList = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/`, { data });
export const createArticle = (data?: object) =>
  http.request<Result>("post", `${BASE}/create`, { data });
export const updateArticle = (data: any) =>
  http.request<Result>("put", `${BASE}/${data.id}`, { data });
export const deleteArticle = (id: number) =>
  http.request<Result>("delete", `${BASE}/${id}`);

export const getCommentList = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/comments`, { data });
export const updateComment = (data: any) =>
  http.request<Result>("put", `${BASE}/comments/${data.id}`, { data });
export const deleteComment = (id: number) =>
  http.request<Result>("delete", `${BASE}/comments/${id}`);
