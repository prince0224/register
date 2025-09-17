# 🗄️ Supabase SQL 設定步驟

## ⚠️ 重要提醒

**請使用 `clean-database-schema.sql` 檔案，不要使用 `database-schema.sql`**

## 📋 設定步驟

### 步驟 1: 開啟 Supabase SQL Editor
1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 在左側選單點擊 **"SQL Editor"**
4. 點擊 **"New query"**

### 步驟 2: 執行 SQL 腳本
1. 開啟 `clean-database-schema.sql` 檔案
2. **複製全部內容**（從第一行到最後一行）
3. 貼到 Supabase SQL Editor 中
4. 點擊 **"Run"** 按鈕執行

### 步驟 3: 確認執行結果
執行成功後，您應該會看到：
- ✅ 所有 CREATE TABLE 語句成功
- ✅ 所有 CREATE INDEX 語句成功
- ✅ 所有 CREATE POLICY 語句成功
- ✅ 範例資料插入成功

## 🔍 如果遇到錯誤

### 常見錯誤 1: 語法錯誤
```
ERROR: 42601: syntax error at or near "//"
```
**解決方法**：
- 確保使用 `clean-database-schema.sql`
- 不要複製 JavaScript 註解（`//`）
- 只複製 SQL 語法（`--` 註解是正確的）

### 常見錯誤 2: 權限錯誤
```
ERROR: permission denied for table events
```
**解決方法**：
- 確認您有專案的管理員權限
- 檢查 RLS 政策設定

### 常見錯誤 3: 表格已存在
```
ERROR: relation "events" already exists
```
**解決方法**：
- 如果表格已存在，可以跳過 CREATE TABLE 語句
- 或者先刪除現有表格再重新建立

## 📊 驗證設定

執行完成後，您可以：

### 1. 檢查資料表
在 Supabase Dashboard 的 **"Table Editor"** 中應該看到：
- `events` 表
- `registrations` 表

### 2. 檢查範例資料
在 `events` 表中應該看到 5 筆範例活動資料

### 3. 測試連接
開啟 `test-supabase.html` 測試連接是否正常

## 🚀 下一步

SQL 設定完成後：
1. 更新 `supabase-config.js` 中的 API 金鑰
2. 測試 `test-supabase.html`
3. 開始使用報名系統

## 📞 需要幫助？

如果遇到問題：
1. 檢查錯誤訊息
2. 確認使用的是 `clean-database-schema.sql`
3. 逐步執行 SQL 語句（不要一次執行全部）
4. 查看 Supabase 官方文件




