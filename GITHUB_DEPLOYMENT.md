# GitHub + Netlify 部署指南

## 🚀 快速部署步驟

### 第一步：準備 GitHub 儲存庫

1. **建立新的 GitHub 儲存庫**
   ```bash
   # 在 GitHub 上建立新儲存庫，例如：activity-registration-system
   ```

2. **初始化 Git 並推送到 GitHub**
   ```bash
   # 在專案目錄中執行
   git init
   git add .
   git commit -m "Initial commit: Activity registration system with Supabase"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 第二步：部署到 Netlify

1. **登入 Netlify**
   - 前往 [netlify.com](https://netlify.com)
   - 使用 GitHub 帳號登入

2. **建立新網站**
   - 點擊 "New site from Git"
   - 選擇 "GitHub" 作為 Git 提供者
   - 授權 Netlify 存取您的 GitHub 帳號

3. **選擇儲存庫**
   - 找到並選擇您的儲存庫
   - 點擊 "Connect"

4. **設定建置選項**
   - **Branch to deploy**: `main`
   - **Build command**: 留空（靜態網站不需要建置）
   - **Publish directory**: `.` (根目錄)

5. **部署**
   - 點擊 "Deploy site"
   - 等待部署完成

## 📁 專案檔案結構

```
activity-registration-system/
├── index.html              # 主要報名頁面
├── admin.html              # 管理後台
├── script.js               # 主要功能腳本
├── admin-script.js         # 管理後台腳本
├── styles.css              # 主要樣式
├── admin-styles.css        # 管理後台樣式
├── supabase-config.js      # Supabase 配置
├── supabase-client.js      # Supabase 客戶端
├── data-sync-manager.js    # 資料同步管理
├── sync-status-indicator.js # 同步狀態指示器
├── netlify.toml            # Netlify 配置
├── README.md               # 專案說明
├── README_SUPABASE.md      # Supabase 設定說明
├── SUPABASE_SETUP.md       # Supabase 部署指南
└── database-schema-clean.sql # 資料庫結構
```

## ⚙️ Netlify 配置說明

### netlify.toml 功能
- **自動重定向**: 支援 SPA 路由
- **安全標頭**: 防止 XSS 和點擊劫持
- **快取優化**: 靜態資源長期快取
- **資源壓縮**: CSS/JS 自動壓縮

### 環境變數設定
在 Netlify 中設定環境變數（如果需要）：
- 進入 Site settings → Environment variables
- 添加 Supabase 相關變數

## 🔧 部署後設定

### 1. 自訂域名（可選）
- 進入 Netlify 網站設定 → Domain management
- 點擊 "Add custom domain"
- 設定 DNS 記錄

### 2. 自動部署
- 每次推送到 `main` 分支時自動重新部署
- 可以在 Netlify 中查看部署歷史

### 3. 分支預覽
- 可以設定其他分支的預覽部署
- 適合測試新功能

## 📊 網站功能

部署後的網站包含：

### 主要功能
- ✅ **活動報名**: 選擇活動並填寫報名表單
- ✅ **電子簽名**: Canvas 簽名功能
- ✅ **管理後台**: 活動管理和報名資料查看
- ✅ **Supabase 整合**: 雲端資料同步
- ✅ **響應式設計**: 適配各種裝置

### 技術特色
- ✅ **即時同步**: 與 Supabase 即時同步
- ✅ **離線快取**: localStorage 作為快取
- ✅ **狀態指示**: 即時顯示同步狀態
- ✅ **錯誤處理**: 完善的錯誤處理機制

## 🛠️ 故障排除

### 常見問題

1. **部署失敗**
   - 檢查 `netlify.toml` 語法
   - 確認所有檔案都在根目錄

2. **Supabase 連接失敗**
   - 檢查 `supabase-config.js` 配置
   - 確認 Supabase 專案設定

3. **功能異常**
   - 檢查瀏覽器 Console 錯誤
   - 確認 Supabase 資料庫結構

### 除錯工具
- 使用 `debug-supabase.html` 測試 Supabase 連接
- 檢查 Netlify 部署日誌

## 📈 效能優化

### Netlify 自動優化
- ✅ **CDN 加速**: 全球內容分發網路
- ✅ **HTTPS**: 自動 SSL 憑證
- ✅ **壓縮**: 自動 Gzip 壓縮
- ✅ **快取**: 智慧快取策略

### 建議優化
- 使用 WebP 圖片格式
- 啟用 Brotli 壓縮
- 設定適當的快取標頭

## 🔒 安全性

### Netlify 安全功能
- ✅ **DDoS 防護**: 自動防護
- ✅ **安全標頭**: 防止常見攻擊
- ✅ **HTTPS 強制**: 自動重定向到 HTTPS

### 建議設定
- 定期更新依賴
- 使用強密碼
- 啟用雙因素認證

## 📞 支援

如有問題，請查看：
- [Netlify 文件](https://docs.netlify.com/)
- [Supabase 文件](https://supabase.com/docs)
- [GitHub 儲存庫](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)

---

## 🎉 部署完成！

部署完成後，您將獲得：
- 🌐 **公開網址**: `https://your-site-name.netlify.app`
- 🔄 **自動部署**: 每次推送自動更新
- 📱 **響應式**: 支援所有裝置
- ⚡ **快速載入**: CDN 加速
- 🔒 **安全**: HTTPS 加密
