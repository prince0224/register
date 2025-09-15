# 🔧 欄位錯誤解決方案

## ❌ 遇到的錯誤

```
ERROR: 42703: column "time" of relation "events" does not exist
```

## 🔍 錯誤原因

這個錯誤表示 `events` 資料表中沒有 `time` 欄位。這可能是因為：

1. 現有的資料表結構不完整
2. 之前建立的資料表缺少某些欄位
3. 資料表結構與預期不符

## ✅ 解決方案

### 方案 1: 使用修復腳本（推薦）

我已經為您建立了 `fix-database-schema.sql` 檔案，這個檔案會：

- ✅ **檢查現有結構**：顯示現有資料表的欄位
- ✅ **添加缺失欄位**：自動添加不存在的欄位
- ✅ **保持現有資料**：不會刪除現有的資料
- ✅ **完整設定**：包含所有必要的索引、觸發器和政策

### 方案 2: 手動檢查結構

如果您想先了解現有的資料表結構，可以執行：

```sql
-- 檢查 events 表的現有結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 檢查 registrations 表的現有結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;
```

### 方案 3: 重新建立資料表（謹慎使用）

如果您確定要重新開始：

```sql
-- 刪除現有資料表（會刪除所有資料！）
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
```

然後執行 `clean-database-schema.sql`

## 🎯 推薦做法

**使用 `fix-database-schema.sql`**，因為它：

1. **安全**：不會刪除現有資料
2. **智慧**：只添加缺失的欄位
3. **完整**：包含所有必要的設定
4. **可重複執行**：可以多次執行而不會出錯

## 📋 執行步驟

1. **開啟 Supabase SQL Editor**
2. **複製 `fix-database-schema.sql` 的全部內容**
3. **貼到 SQL Editor 中**
4. **點擊 "Run" 執行**
5. **查看執行結果**

## 🔍 執行結果說明

執行完成後，您會看到：

1. **現有結構檢查**：顯示現有資料表的欄位
2. **欄位添加**：自動添加缺失的欄位
3. **索引建立**：建立必要的索引
4. **政策設定**：設定安全政策
5. **範例資料**：插入範例活動資料

## 🚀 驗證結果

執行完成後，您可以：

1. **檢查資料表**：在 Table Editor 中查看 events 和 registrations 表
2. **檢查欄位**：確認所有必要的欄位都已存在
3. **檢查資料**：確認範例活動資料已插入
4. **測試連接**：使用 `test-supabase.html` 測試功能

## 📊 預期的資料表結構

### events 表應該包含：
- id (UUID, Primary Key)
- name (VARCHAR)
- type (VARCHAR)
- date (DATE)
- time (VARCHAR) ← 這個欄位之前缺失
- location (VARCHAR)
- capacity (INTEGER)
- fee (DECIMAL)
- description (TEXT)
- poster_url (TEXT)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### registrations 表應該包含：
- id (UUID, Primary Key)
- event_id (UUID, Foreign Key)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- birthdate (DATE)
- registration_date (DATE)
- dietary_requirements (TEXT)
- notes (TEXT)
- signature_data (TEXT)
- status (VARCHAR)
- submitted_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 🎉 下一步

SQL 執行成功後：
1. 更新 `supabase-config.js` 中的 API 金鑰
2. 開啟 `test-supabase.html` 測試連接
3. 開始使用報名系統

## 📞 如果還有問題

如果執行 `fix-database-schema.sql` 後仍有問題：
1. 檢查錯誤訊息
2. 確認 Supabase 專案權限
3. 逐步執行 SQL 語句
4. 查看 Supabase 官方文件


