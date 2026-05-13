import { http } from "@/utils/http";

const BASE = "/api/admin/system";

type Result = {
  code: number;
  data?: Array<any>;
};

type ResultTable = {
  code: number;
  data?: {
    list: Array<any>;
    total?: number;
    pageSize?: number;
    currentPage?: number;
  };
};

// ── 用戶管理 ──────────────────────────────────────────────────
export const getUserList = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/user`, { data });

export const createUser = (data?: object) =>
  http.request<Result>("post", `${BASE}/user/create`, { data });

export const updateUser = (data: any) =>
  http.request<Result>("put", `${BASE}/user/${data.id}`, { data });

export const deleteUser = (id: number) =>
  http.request<Result>("delete", `${BASE}/user/${id}`);

export const getAllRoleList = () =>
  http.request<Result>("get", `${BASE}/list-all-role`);

export const getRoleIds = (data?: object) =>
  http.request<Result>("post", `${BASE}/list-role-ids`, { data });

// ── 角色管理 ──────────────────────────────────────────────────
export const getRoleList = (data?: object) =>
  http.request<ResultTable>("post", `${BASE}/role`, { data });

export const createRole = (data?: object) =>
  http.request<Result>("post", `${BASE}/role/create`, { data });

export const updateRole = (data: any) =>
  http.request<Result>("put", `${BASE}/role/${data.id}`, { data });

export const deleteRole = (id: number) =>
  http.request<Result>("delete", `${BASE}/role/${id}`);

export const getRoleMenu = (data?: object) =>
  http.request<Result>("post", `${BASE}/role-menu`, { data });

export const getRoleMenuIds = (data?: object) =>
  http.request<Result>("post", `${BASE}/role-menu-ids`, { data });

export const saveRoleMenus = (data?: object) =>
  http.request<Result>("post", `${BASE}/role-menu/save`, { data });

// ── 菜單管理 ──────────────────────────────────────────────────
export const getMenuList = (data?: object) =>
  http.request<Result>("post", `${BASE}/menu`, { data });

export const createMenu = (data?: object) =>
  http.request<Result>("post", `${BASE}/menu/create`, { data });

export const updateMenu = (data: any) =>
  http.request<Result>("put", `${BASE}/menu/${data.id}`, { data });

export const deleteMenu = (id: number) =>
  http.request<Result>("delete", `${BASE}/menu/${id}`);

// ── 未使用但保留介面（避免 import 錯誤）────────────────────────
export const getDeptList = () => Promise.resolve({ code: 0, data: [] });
export const getOnlineLogsList = () =>
  Promise.resolve({ code: 0, data: { list: [] } });
export const getLoginLogsList = () =>
  Promise.resolve({ code: 0, data: { list: [] } });
export const getOperationLogsList = () =>
  Promise.resolve({ code: 0, data: { list: [] } });
export const getSystemLogsList = () =>
  Promise.resolve({ code: 0, data: { list: [] } });
export const getSystemLogsDetail = () => Promise.resolve({ code: 0, data: [] });
