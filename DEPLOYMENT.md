# Netlify 部署指南

## 部署方式

### 方法一：從 GitHub 自動部署（推薦）

1. **登入 Netlify**
   - 前往 [netlify.com](https://netlify.com)
   - 使用 GitHub 帳號登入

2. **建立新網站**
   - 點擊 "New site from Git"
   - 選擇 "GitHub" 作為 Git 提供者
   - 授權 Netlify 存取您的 GitHub 帳號

3. **選擇儲存庫**
   - 找到並選擇 `prince0224/register` 儲存庫
   - 點擊 "Connect"

4. **設定建置選項**
   - **Branch to deploy**: `main`
   - **Build command**: 留空（靜態網站不需要建置）
   - **Publish directory**: `.` (根目錄)

5. **部署**
   - 點擊 "Deploy site"
   - 等待部署完成

### 方法二：手動上傳檔案

1. **準備檔案**
   - 確保所有檔案都在專案根目錄
   - 主要檔案：`index.html`, `admin.html`, `styles.css`, `script.js`, `admin-styles.css`, `admin-script.js`

2. **上傳到 Netlify**
   - 登入 Netlify
   - 點擊 "New site from Git" → "Deploy manually"
   - 將整個專案資料夾拖拽到上傳區域

## 自訂域名設定

1. **在 Netlify 中設定**
   - 進入網站設定 → Domain management
   - 點擊 "Add custom domain"
   - 輸入您的域名

2. **DNS 設定**
   - 在您的域名註冊商處設定 DNS
   - 添加 CNAME 記錄指向 Netlify 提供的網址

## 環境變數（如果需要）

在 Netlify 設定中可以添加環境變數：
- 進入 Site settings → Environment variables
- 添加需要的變數

## 自動部署設定

當您推送到 GitHub 的 main 分支時，Netlify 會自動重新部署網站。

## 網站功能

部署後的網站包含：
- **報名頁面**: 活動選擇和報名表單
- **管理後台**: 活動管理和報名資料查看
- **電子簽名**: Canvas 簽名功能
- **海報顯示**: 活動宣傳海報展示
- **響應式設計**: 適配各種裝置

## 注意事項

1. **localStorage 限制**: 資料儲存在使用者的瀏覽器中
2. **HTTPS**: Netlify 自動提供 HTTPS 憑證
3. **CDN**: 全球 CDN 加速
4. **備份**: 建議定期備份重要資料

## 支援

如有問題，請查看：
- [Netlify 文件](https://docs.netlify.com/)
- [GitHub 儲存庫](https://github.com/prince0224/register)
