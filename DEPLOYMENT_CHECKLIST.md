# Netlify 部署檢查清單

## 📋 部署前檢查

### ✅ 必要文件確認
- [x] `index.html` - 報名頁面
- [x] `admin.html` - 管理後台
- [x] `styles.css` - 報名頁面樣式
- [x] `admin-styles.css` - 管理後台樣式
- [x] `script.js` - 報名頁面功能
- [x] `admin-supabase-script.js` - 管理後台功能
- [x] `supabase-config.js` - Supabase 配置
- [x] `netlify.toml` - Netlify 配置

### ✅ Supabase 配置確認
- [x] Supabase URL: `https://ljuixaaysvbzmrmhpnlb.supabase.co`
- [x] Supabase Anon Key: 已配置
- [x] 資料庫表結構: `events`, `registrations`
- [x] RLS 政策: 已設定

### ✅ 功能測試確認
- [x] 活動載入和顯示
- [x] 報名表單提交
- [x] 電子簽名功能
- [x] 管理後台功能
- [x] 活動新增/編輯/刪除
- [x] 報名資料查看和管理
- [x] 響應式設計
- [x] 離線功能

## 🚀 部署步驟

### 方法一：GitHub 自動部署（推薦）

1. **準備 GitHub 儲存庫**
   ```bash
   # 初始化 Git（如果還沒有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交變更
   git commit -m "準備部署到 Netlify"
   
   # 推送到 GitHub
   git push origin main
   ```

2. **在 Netlify 中部署**
   - 前往 [netlify.com](https://netlify.com)
   - 使用 GitHub 帳號登入
   - 點擊 "New site from Git"
   - 選擇您的 GitHub 儲存庫
   - 設定：
     - **Branch to deploy**: `main`
     - **Build command**: 留空
     - **Publish directory**: `.`
   - 點擊 "Deploy site"

### 方法二：手動上傳

1. **壓縮專案文件**
   - 選擇所有必要文件（不包括 `.git` 資料夾）
   - 創建 ZIP 檔案

2. **上傳到 Netlify**
   - 前往 [netlify.com](https://netlify.com)
   - 點擊 "New site from Git" → "Deploy manually"
   - 拖拽 ZIP 檔案到上傳區域

## 🔧 部署後設定

### 1. 自訂域名（可選）
- 進入網站設定 → Domain management
- 添加自訂域名
- 設定 DNS 記錄

### 2. 環境變數（如果需要）
- 進入 Site settings → Environment variables
- 添加任何需要的環境變數

### 3. 表單處理（如果需要）
- 進入 Site settings → Forms
- 啟用表單處理功能

## 🧪 部署後測試

### 基本功能測試
- [ ] 網站正常載入
- [ ] 報名頁面顯示活動列表
- [ ] 可以選擇活動並填寫報名表單
- [ ] 電子簽名功能正常
- [ ] 表單提交成功
- [ ] 管理後台可以正常存取
- [ ] 可以新增/編輯/刪除活動
- [ ] 可以查看報名資料

### 響應式測試
- [ ] 桌面版正常顯示
- [ ] 平板版正常顯示
- [ ] 手機版正常顯示

### 效能測試
- [ ] 頁面載入速度正常
- [ ] 圖片載入正常
- [ ] 沒有 JavaScript 錯誤

## 📱 網站功能

部署後的網站包含：

### 報名頁面 (`/`)
- 活動選擇和展示
- 報名表單填寫
- 電子簽名功能
- 海報大圖顯示
- 響應式設計

### 管理後台 (`/admin.html`)
- 活動管理（新增/編輯/刪除）
- 報名資料查看
- 資料搜尋和篩選
- 報名狀態管理
- 資料匯出功能

## 🔒 安全設定

Netlify 自動提供：
- [x] HTTPS 憑證
- [x] 安全標頭設定
- [x] DDoS 防護
- [x] 全球 CDN

## 📊 監控和分析

建議設定：
- [ ] Google Analytics
- [ ] Netlify Analytics
- [ ] 錯誤監控

## 🆘 故障排除

### 常見問題
1. **網站無法載入**
   - 檢查 `netlify.toml` 配置
   - 確認所有文件都已上傳

2. **Supabase 連接失敗**
   - 檢查 `supabase-config.js` 中的 URL 和 Key
   - 確認 Supabase 專案狀態

3. **功能不正常**
   - 檢查瀏覽器控制台錯誤
   - 確認所有 JavaScript 文件載入

### 支援資源
- [Netlify 文件](https://docs.netlify.com/)
- [Supabase 文件](https://supabase.com/docs)
- [GitHub 儲存庫](https://github.com/prince0224/register)

## ✅ 部署完成確認

部署成功後，您將獲得：
- [x] 一個 `.netlify.app` 網址
- [x] 自動 HTTPS 憑證
- [x] 全球 CDN 加速
- [x] 自動部署（如果使用 GitHub）
- [x] 表單處理功能
- [x] 網站分析功能

---

**部署完成後，請記得測試所有功能並更新相關文件！**
