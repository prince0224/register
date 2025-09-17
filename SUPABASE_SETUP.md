# Supabase 整合設定指南

本指南將協助您設定 Supabase 來管理並同步更新您的活動報名系統。

## 📋 前置準備

1. 建立 Supabase 帳號：前往 [supabase.com](https://supabase.com) 註冊
2. 建立新的 Supabase 專案

## 🚀 步驟 1：建立 Supabase 專案

1. 登入 Supabase Dashboard
2. 點擊「New Project」
3. 填寫專案資訊：
   - **Name**: 活動報名系統
   - **Database Password**: 設定一個強密碼
   - **Region**: 選擇離您最近的區域
4. 點擊「Create new project」

## 🗄️ 步驟 2：設定資料庫

1. 在專案 Dashboard 中，點擊左側選單的「SQL Editor」
2. 點擊「New query」
3. 複製 `database-schema-fixed.sql` 檔案的內容（修正版，避免 PostgreSQL 保留字衝突）
4. 貼上到 SQL 編輯器中
5. 點擊「Run」執行 SQL

> **注意**: 使用 `database-schema-fixed.sql` 而不是 `database-schema.sql`，因為修正版解決了 PostgreSQL 保留字 `time` 的衝突問題。

這將建立以下表格：
- `events` - 活動資料
- `registrations` - 報名資料
- 相關的索引、觸發器和函數

## 🔑 步驟 3：取得 API 金鑰

1. 在專案 Dashboard 中，點擊左側選單的「Settings」
2. 點擊「API」
3. 複製以下資訊：
   - **Project URL**
   - **anon public** key

## ⚙️ 步驟 4：設定應用程式

1. 開啟 `supabase-config.js` 檔案
2. 將以下值替換為您的實際資訊：

```javascript
const SUPABASE_CONFIG = {
    // 替換為您的 Project URL
    url: 'https://your-project-id.supabase.co',
    
    // 替換為您的 anon public key
    anonKey: 'your-anon-key-here',
    
    // 表格名稱（通常不需要修改）
    tables: {
        events: 'events',
        registrations: 'registrations'
    }
};
```

## 🔒 步驟 5：設定資料庫權限

1. 在 Supabase Dashboard 中，點擊「Authentication」
2. 點擊「Policies」
3. 確認以下政策已建立：
   - 任何人都可以讀取啟用的活動
   - 任何人都可以建立報名
   - 任何人都可以讀取、更新、刪除自己的報名

## 🧪 步驟 6：測試設定

1. 開啟 `index.html` 檔案
2. 開啟瀏覽器開發者工具（F12）
3. 查看 Console 標籤
4. 您應該看到以下訊息：
   - ✅ Supabase 客戶端庫載入成功
   - ✅ Supabase 客戶端初始化成功
   - ✅ Supabase 連接測試成功

## 📱 功能特色

### 🔄 自動同步
- 每 5 分鐘自動同步資料
- 網路恢復時自動同步
- 頁面可見時同步

### 📴 離線支援
- 網路斷線時使用本地儲存
- 網路恢復後自動同步待處理資料
- 確保資料不遺失

### 🛡️ 錯誤處理
- 自動重試機制
- 優雅的錯誤處理
- 詳細的日誌記錄

## 🔧 進階設定

### 自訂同步間隔
在 `data-sync-manager.js` 中修改：

```javascript
this.syncInterval = 5 * 60 * 1000; // 改為您想要的間隔（毫秒）
```

### 自訂重試次數
在 `data-sync-manager.js` 中修改：

```javascript
this.retryAttempts = 3; // 改為您想要的次數
```

## 🐛 故障排除

### 常見問題

**Q: 看到「請先設定您的 Supabase 配置資訊」警告**
A: 請確認 `supabase-config.js` 中的 URL 和 API Key 已正確設定

**Q: 看到「Supabase 連接測試失敗」錯誤**
A: 請檢查：
- 網路連接是否正常
- API Key 是否正確
- 專案 URL 是否正確

**Q: 資料沒有同步到 Supabase**
A: 請檢查：
- 資料庫表格是否已建立
- RLS 政策是否正確設定
- 瀏覽器 Console 是否有錯誤訊息

### 檢查同步狀態

在瀏覽器 Console 中執行：

```javascript
// 檢查 Supabase 狀態
console.log('Supabase 可用:', window.supabaseClient.isAvailable());

// 檢查同步狀態
window.dataSyncManager.showSyncStatus();

// 強制同步
window.dataSyncManager.forceSync();
```

## 📊 監控和維護

### 查看資料庫使用情況
1. 在 Supabase Dashboard 中點擊「Database」
2. 查看表格大小和查詢統計

### 備份資料
1. 在 Supabase Dashboard 中點擊「Settings」
2. 點擊「Database」
3. 使用「Backup」功能

### 清理舊資料
資料庫已包含自動清理功能，會定期刪除：
- 1 年前的非活躍活動
- 2 年前的已處理報名

## 🆘 需要協助？

如果遇到問題，請：
1. 檢查瀏覽器 Console 的錯誤訊息
2. 確認 Supabase 專案設定
3. 查看 Supabase Dashboard 的日誌

## 📝 更新日誌

- **v1.0.0**: 初始 Supabase 整合
- 支援活動和報名資料同步
- 離線支援和自動重試
- 完整的錯誤處理機制
