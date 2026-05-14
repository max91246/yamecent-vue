# yamecent-vue

Yamecent 後台管理前端，基於 [pure-admin v7](https://github.com/pure-admin/vue-pure-admin) 開發。

## 技術棧

- **Vue 3** + **TypeScript** + **Vite**
- **Element Plus** — UI 組件庫
- **Pinia** — 狀態管理
- **Tailwind CSS** — 樣式
- **ECharts** — 圖表（首頁 Dashboard）

## 功能模塊

| 模塊 | 說明 |
|------|------|
| 首頁 Dashboard | 數字卡片、影片入庫趨勢、TG 訊息量、處置股警示、損益排行 |
| 文章管理 | 文章 CRUD、留言管理（顯示/隱藏/回覆） |
| 會員管理 | 會員 CRUD、會員資格開通/撤銷、餘額調整、餘額記錄 |
| AV 影片 | 影片列表（搜尋/番號/女優/片商）、女優列表 |
| TG Bot | Bot 管理 + Webhook 設定、訊息記錄、持股概覽、持股明細、交易記錄 |
| 股票工具 | 處置股列表、油價 K 線資料 |
| 系統設定 | Key-Value 設定管理 |
| 系統管理 | 用戶、角色、菜單（動態路由由後端控制） |

## 專案架構

```
yamecent-vue/
├── src/
│   ├── api/          # API 呼叫（article / member / av / tg / stock / config / dashboard）
│   ├── router/       # 路由（靜態：home、error；動態：從後端 /get-async-routes 載入）
│   ├── views/        # 頁面
│   │   ├── welcome/  # 首頁 Dashboard
│   │   ├── article/  # 文章、留言
│   │   ├── member/   # 會員、餘額記錄
│   │   ├── av/       # 影片、女優
│   │   ├── tg/       # Bot、訊息、持股、交易
│   │   ├── stock/    # 處置股、油價
│   │   ├── config/   # 系統設定
│   │   └── system/   # 用戶/角色/菜單管理
│   └── utils/
│       └── http/     # Axios 封裝（自動轉換 Laravel success/code 格式）
├── mock/             # 已停用（改用真實 API）
└── public/
```

## 與後端的關係

```
yamecent-vue  ──/api/*──►  yamecent-admin（Laravel Lumen）
                               │
                           MySQL + Redis
```

- 所有 `/api/*` 請求由 nginx 轉發給 Laravel php-fpm
- 認證：JWT（`Authorization: Bearer <token>`）
- 登入 API：`POST /api/admin/auth/login`
- 動態菜單：`GET /api/admin/system/get-async-routes`

## 本地開發

```bash
# 安裝依賴
pnpm install

# 打包（nginx serve dist/）
pnpm build
```

> **注意：** 本專案使用 production build 模式，修改後執行 `pnpm build` 即可，nginx 自動 serve 新的 `dist/`。

## 部署流程（CI/CD）

升級由開發者在本地 build + push 後，**手動前往 GitHub Actions 觸發**，不自動部署。

### 開發者工作流

```bash
# 1. 修改代碼
# 2. 打包
pnpm build

# 3. 推上 GitHub
git add -A
git commit -m "feat: ..."
git push origin master
```

```text
4. 前往 GitHub Actions 手動觸發
   https://github.com/max91246/yamecent-vue/actions
   → Deploy Vue → Run workflow → master → Run workflow

5. 等候 Telegram 通知確認結果
```

### GitHub Actions 部署步驟（自動執行）

```bash
# GCP 上執行
cd /home/max91246/www/yamecent-vue-repo
git fetch origin master
git reset --hard origin/master
# nginx 自動 serve 新的 dist/ 無需 reload
```

### 說明

- `yamecent-vue-repo` — GCP 上 nginx serve 的目錄，包含 build 後的 `dist/`
- `yamecent-vue` — 本 repo，包含源碼 + `dist/`（一起 commit）
- push 的 `dist/` 就是線上版本，GCP git reset 後立即生效

## 相關專案

- [yamecent-admin](https://github.com/max91246/yamecent-admin) — Laravel 後端 API
- [yamecent-work](https://github.com/max91246/yamecent-work) — 環境 & Docker Compose
