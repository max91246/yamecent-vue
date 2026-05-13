import { http } from "@/utils/http";
const BASE = "/api/admin/tg";
type R = { code: number; data?: any };
type RT = {
  code: number;
  data?: { list: any[]; total: number; pageSize: number; currentPage: number };
};

export const getAllBots = () => http.request<R>("get", `${BASE}/bots/all`);
export const getBotList = (data?: object) =>
  http.request<RT>("post", `${BASE}/bots`, { data });
export const createBot = (data?: object) =>
  http.request<R>("post", `${BASE}/bots/create`, { data });
export const updateBot = (data: any) =>
  http.request<R>("put", `${BASE}/bots/${data.id}`, { data });
export const deleteBot = (id: number) =>
  http.request<R>("delete", `${BASE}/bots/${id}`);
export const setWebhook = (id: number) =>
  http.request<R>("post", `${BASE}/bots/${id}/webhook`);
export const getMessageList = (data?: object) =>
  http.request<RT>("post", `${BASE}/messages`, { data });
export const getHoldingList = (data?: object) =>
  http.request<RT>("post", `${BASE}/holdings`, { data });
export const getTradeList = (data?: object) =>
  http.request<RT>("post", `${BASE}/trades`, { data });
export const getUserDetail = (chatId: string | number, botId?: number) =>
  http.request<R>("get", `${BASE}/holdings/${chatId}`, {
    params: botId ? { bot_id: botId } : {}
  });
