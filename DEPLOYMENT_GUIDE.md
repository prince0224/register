# 🚀 完整部署指南

## 第一步：安裝 Git

### Windows 用戶
1. 前往 [git-scm.com](https://git-scm.com/download/win)
2. 下載並安裝 Git for Windows
3. 安裝完成後重新開啟命令提示字元

### 驗證安裝
```bash
git --version
```

## 第二步：建立 GitHub 儲存庫

1. **登入 GitHub**
   - 前往 [github.com](https://github.com)
   - 登入您的帳號

2. **建立新儲存庫**
   - 點擊右上角的 "+" 按鈕
   - 選擇 "New repository"
   - 輸入儲存庫名稱（例如：`activity-registration-system`）
   - 選擇 "Public" 或 "Private"
   - **不要**勾選 "Initialize this repository with a README"
   - 點擊 "Create repository"

## 第三步：上傳專案到 GitHub

### 方法一：使用命令列（推薦）

1. **開啟命令提示字元**
   - 按 `Win + R`，輸入 `cmd`，按 Enter
   - 或按 `Win + X`，選擇 "Windows PowerShell"

2. **導航到專案目錄**
   ```bash
   cd "C:\Users\ilove\Downloads\register-main"
   ```

3. **初始化 Git 並推送到 GitHub**
   ```bash
   # 初始化 Git 儲存庫
   git init
   
   # 添加所有檔案
   git add .
   
   # 提交變更
   git commit -m "Initial commit: Activity registration system with Supabase"
   
   # 設定主分支
   git branch -M main
   
   # 添加遠端儲存庫（替換 YOUR_USERNAME 和 YOUR_REPO_NAME）
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # 推送到 GitHub
   git push -u origin main
   ```

### 方法二：使用 GitHub Desktop

1. **下載 GitHub Desktop**
   - 前往 [desktop.github.com](https://desktop.github.com)
   - 下載並安裝

2. **建立儲存庫**
   - 開啟 GitHub Desktop
   - 點擊 "Create a New Repository on your Hard Drive"
   - 選擇專案目錄
   - 點擊 "Create Repository"

3. **推送到 GitHub**
   - 在 GitHub Desktop 中點擊 "Publish repository"
   - 選擇要推送到的 GitHub 帳號
   - 輸入儲存庫名稱
   - 點擊 "Publish Repository"

## 第四步：部署到 Netlify

### 1. 登入 Netlify
- 前往 [netlify.com](https://netlify.com)
- 點擊 "Sign up" 或 "Log in"
- 選擇 "Sign up with GitHub" 使用 GitHub 帳號登入

### 2. 建立新網站
- 點擊 "New site from Git"
- 選擇 "GitHub" 作為 Git 提供者
- 授權 Netlify 存取您的 GitHub 帳號

### 3. 選擇儲存庫
- 在儲存庫列表中找到您的專案
- 點擊 "Connect"

### 4. 設定建置選項
- **Branch to deploy**: `main`
- **Build command**: 留空（靜態網站不需要建置）
- **Publish directory**: `.` (根目錄)

### 5. 部署
- 點擊 "Deploy site"
- 等待部署完成（通常需要 1-2 分鐘）

## 第五步：設定 Supabase

### 1. 建立 Supabase 專案
- 前往 [supabase.com](https://supabase.com)
- 登入並建立新專案
- 記下專案的 URL 和 API Key

### 2. 設定資料庫
- 在 Supabase 控制台中，前往 "SQL Editor"
- 複製 `database-schema-clean.sql` 的內容
- 貼上並執行 SQL 腳本

### 3. 更新配置
- 在 Netlify 中，前往您的網站設定
- 進入 "Environment variables"
- 添加以下環境變數：
  - `SUPABASE_URL`: 您的 Supabase 專案 URL
  - `SUPABASE_ANON_KEY`: 您的 Supabase API Key

### 4. 更新前端配置
- 在您的 GitHub 儲存庫中，編輯 `supabase-config.js`
- 更新 `url` 和 `anonKey` 的值
- 提交並推送變更

## 第六步：測試部署

### 1. 檢查網站
- 前往您的 Netlify 網址（例如：`https://your-site-name.netlify.app`）
- 確認網站正常載入

### 2. 測試功能
- 嘗試填寫報名表單
- 測試電子簽名功能
- 檢查管理後台

### 3. 檢查 Supabase 連接
- 使用 `debug-supabase.html` 測試連接
- 確認資料能正常同步

## 🔧 常見問題解決

### Git 相關問題

**問題：找不到 git 命令**
- 解決：安裝 Git for Windows
- 重新開啟命令提示字元

**問題：認證失敗**
- 解決：使用 GitHub Personal Access Token
- 前往 GitHub Settings → Developer settings → Personal access tokens

### Netlify 相關問題

**問題：部署失敗**
- 檢查 `netlify.toml` 語法
- 確認所有檔案都在根目錄

**問題：網站無法載入**
- 檢查建置日誌
- 確認 `index.html` 存在

### Supabase 相關問題

**問題：連接失敗**
- 檢查 API Key 是否正確
- 確認 Supabase 專案狀態

**問題：資料庫錯誤**
- 檢查 SQL 腳本是否正確執行
- 確認表格和欄位名稱

## 📞 取得協助

如果遇到問題，可以：

1. **查看日誌**
   - Netlify 部署日誌
   - 瀏覽器 Console 錯誤

2. **檢查文件**
   - [Netlify 文件](https://docs.netlify.com/)
   - [Supabase 文件](https://supabase.com/docs)
   - [Git 文件](https://git-scm.com/doc)

3. **尋求協助**
   - GitHub Issues
   - 社群論壇

---

## 🎉 部署完成！

部署完成後，您將獲得：
- 🌐 **公開網址**: `https://your-site-name.netlify.app`
- 🔄 **自動部署**: 每次推送自動更新
- 📱 **響應式**: 支援所有裝置
- ⚡ **快速載入**: CDN 加速
- 🔒 **安全**: HTTPS 加密
- ☁️ **雲端同步**: Supabase 資料庫
