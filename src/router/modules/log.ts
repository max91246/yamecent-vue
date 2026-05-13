export default {
  path: "/log",
  redirect: "/log/index",
  meta: { title: "系統日誌", icon: "ri:file-list-3-line", rank: 8 },
  children: [
    {
      path: "/log/index",
      name: "LogViewer",
      component: () => import("@/views/log/index.vue"),
      meta: { title: "日誌查看", icon: "ri:file-text-line" }
    }
  ]
};
