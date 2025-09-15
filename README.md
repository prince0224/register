# 活動報名系統

一個功能完整的報名網站，包含電子簽名功能和 Supabase 雲端同步。

## 功能特色

### 📝 報名表單
- **基本資訊**：姓名、電子郵件、聯絡電話、出生日期
- **報名資訊**：活動選擇、活動日期、飲食需求、備註
- **表單驗證**：即時驗證輸入格式和必填項目

### ✍️ 電子簽名
- **Canvas簽名板**：支援滑鼠和觸控操作
- **簽名儲存**：將簽名轉換為圖片資料
- **簽名清除**：一鍵清除重新簽名
- **響應式設計**：在手機和平板上都能正常使用

### ☁️ 雲端同步
- **Supabase 整合**：即時雲端資料同步
- **自動備份**：資料自動備份到雲端
- **多裝置同步**：支援多個裝置同時使用
- **狀態指示**：即時顯示同步狀態

### 🎨 使用者介面
- **現代化設計**：漸層背景和圓角設計
- **響應式布局**：適配各種螢幕尺寸
- **動畫效果**：流暢的過場動畫
- **中文化介面**：完全繁體中文介面

## 檔案結構

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
├── deploy.bat              # Windows 部署腳本
├── deploy.sh               # Linux/Mac 部署腳本
├── README.md               # 專案說明
├── README_SUPABASE.md      # Supabase 設定說明
├── SUPABASE_SETUP.md       # Supabase 部署指南
├── GITHUB_DEPLOYMENT.md    # GitHub + Netlify 部署指南
└── database-schema-clean.sql # 資料庫結構
```

## 使用方法

### 報名者使用
1. **開啟網站**：直接在瀏覽器中開啟 `index.html`
2. **填寫表單**：依序填寫基本資訊和報名資訊
3. **電子簽名**：在簽名區域使用滑鼠或手指簽名
4. **儲存簽名**：點擊「儲存簽名」按鈕
5. **提交報名**：點擊「提交報名」完成報名

### 管理者使用
1. **進入管理後台**：點擊報名頁面的「管理後台」按鈕，或直接開啟 `admin.html`
2. **查看報名資料**：在管理後台可以查看所有報名資料
3. **搜尋和篩選**：使用搜尋框和篩選器快速找到特定報名
4. **查看詳細資料**：點擊「查看」按鈕查看完整的報名資訊和簽名
5. **管理狀態**：標記報名為「已處理」或刪除不需要的報名
6. **匯出資料**：將所有報名資料匯出為CSV檔案

## 技術實作

### 簽名功能
- 使用HTML5 Canvas API實作
- 支援滑鼠和觸控事件
- 簽名資料以Base64格式儲存

### 表單驗證
- 即時驗證輸入格式
- 必填項目檢查
- 錯誤訊息顯示

### 資料儲存
- **Supabase 雲端資料庫**：主要資料儲存
- **localStorage 快取**：離線快取支援
- **即時同步**：自動同步到雲端
- **支援資料匯出為CSV格式**
- **自動生成唯一ID和時間戳記**

### 管理後台
- 清單和卡片兩種檢視模式
- 搜尋和篩選功能
- 統計資訊顯示
- 簽名圖片預覽

### 響應式設計
- CSS Grid和Flexbox布局
- 媒體查詢適配不同螢幕
- 觸控友善的介面設計

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 行動瀏覽器（iOS Safari, Chrome Mobile）

## 自訂說明

### 修改活動選項
在 `index.html` 中找到 `<select id="event">` 區塊，修改 `<option>` 標籤：

```html
<option value="your-event">您的活動名稱</option>
```

### 調整樣式
在 `styles.css` 中修改顏色變數：

```css
/* 主要顏色 */
--primary-color: #4facfe;
--secondary-color: #00f2fe;
```

### 修改表單欄位
在 `index.html` 中新增或修改表單欄位，並在 `script.js` 的 `FormValidator` 類別中加入對應的驗證規則。

## 🚀 快速部署

### 方法一：使用部署腳本（推薦）

**Windows 用戶：**
```bash
# 雙擊執行
deploy.bat
```

**Linux/Mac 用戶：**
```bash
# 給予執行權限並執行
chmod +x deploy.sh
./deploy.sh
```

### 方法二：手動部署

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **部署到 Netlify**
   - 前往 [netlify.com](https://netlify.com)
   - 選擇 "New site from Git"
   - 連接您的 GitHub 儲存庫
   - 設定部署選項並部署

詳細說明請查看 [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)

## 📋 設定需求

### Supabase 設定
1. 建立 Supabase 專案
2. 執行 `database-schema-clean.sql` 建立資料庫結構
3. 更新 `supabase-config.js` 中的配置

詳細設定請查看 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 注意事項

- 簽名資料會以Base64格式儲存在表單中
- 需要設定 Supabase 才能使用雲端同步功能
- 建議在HTTPS環境下使用以確保資料安全
- 簽名功能需要支援Canvas的現代瀏覽器

## 授權

此專案採用MIT授權條款。
