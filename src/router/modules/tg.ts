export default {
  path: "/tg",
  meta: { title: "TG Bot", icon: "ri:telegram-line", rank: 5 },
  children: [
    {
      path: "/tg/bot",
      name: "TgBot",
      component: () => import("@/views/tg/bot.vue"),
      meta: { title: "Bot 管理", icon: "ri:robot-line" }
    },
    {
      path: "/tg/message",
      name: "TgMessage",
      component: () => import("@/views/tg/message.vue"),
      meta: { title: "訊息記錄", icon: "ri:message-3-line" }
    },
    {
      path: "/tg/holding",
      name: "TgHolding",
      component: () => import("@/views/tg/holding.vue"),
      meta: { title: "持股概覽", icon: "ri:stock-line" }
    },
    {
      path: "/tg/holding/:chatId",
      name: "TgHoldingDetail",
      component: () => import("@/views/tg/holding-detail.vue"),
      meta: { title: "持股明細", showLink: false }
    },
    {
      path: "/tg/trade",
      name: "TgTrade",
      component: () => import("@/views/tg/trade.vue"),
      meta: { title: "交易記錄", icon: "ri:exchange-line" }
    }
  ]
};
