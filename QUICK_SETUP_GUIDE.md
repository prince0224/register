# 🚀 快速設定指南

## ⚠️ 重要提醒

**您剛才的錯誤**：把 JavaScript 程式碼貼到了 SQL Editor 中
- ❌ SQL Editor 只能執行 SQL 語法
- ❌ 不能執行 JavaScript 程式碼（`const`, `let`, `function` 等）

## 📋 正確的設定步驟

### 步驟 1: 在 Supabase 中建立資料庫結構

1. **開啟 Supabase Dashboard**
   - 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 選擇您的專案

2. **進入 SQL Editor**
   - 左側選單點擊 **"SQL Editor"**
   - 點擊 **"New query"**

3. **執行 SQL 腳本**
   - 開啟 `clean-database-schema.sql` 檔案
   - 複製**全部內容**（只複製 SQL 語法）
   - 貼到 SQL Editor 中
   - 點擊 **"Run"** 執行

### 步驟 2: 取得 API 金鑰

1. **進入 API 設定**
   - 左側選單點擊 **"Settings"**
   - 點擊 **"API"**

2. **複製金鑰**
   - 複製 **Project URL**
   - 複製 **anon public key**

### 步驟 3: 更新前端設定檔

1. **編輯 `supabase-config.js`**
   - 開啟 `supabase-config.js` 檔案
   - 替換以下內容：

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';  // 貼上您的 Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';  // 貼上您的 anon public key
```

2. **儲存檔案**

### 步驟 4: 測試連接

1. **開啟測試頁面**
   - 在瀏覽器中開啟 `test-supabase.html`

2. **執行測試**
   - 點擊各個測試按鈕
   - 確認所有測試都通過

## 🔍 檔案用途說明

### SQL 檔案（在 Supabase 中執行）
- `clean-database-schema.sql` → 在 Supabase SQL Editor 中執行

### JavaScript 檔案（在前端使用）
- `supabase-config.js` → 在前端網頁中使用
- `script.js` → 主要功能程式碼
- `test-supabase.html` → 測試頁面

## 📊 執行順序

1. **先執行 SQL**：在 Supabase 中建立資料庫結構
2. **再設定前端**：更新 JavaScript 設定檔
3. **最後測試**：確認一切正常運作

## 🎯 重點提醒

- **SQL Editor** = 只執行 SQL 語法
- **JavaScript 檔案** = 在前端網頁中使用
- **不要混淆**：不要把 JavaScript 貼到 SQL Editor 中

## 🚀 完成後的效果

設定完成後，您的報名系統將：
- ✅ 從 Supabase 載入活動資料
- ✅ 將報名資料提交到 Supabase
- ✅ 即時同步所有資料
- ✅ 提供完整的資料管理功能




