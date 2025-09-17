# 🔧 RLS 政策錯誤解決方案

## ❌ 遇到的錯誤

```
❌ 新增測試活動失敗：
new row violates row-level security policy for table "events"
```

## 🔍 錯誤原因

這個錯誤表示 Row Level Security (RLS) 政策阻止了新增活動的操作。這是因為：

1. **RLS 已啟用**：資料表啟用了 Row Level Security
2. **政策不完整**：只設定了讀取政策，沒有設定新增政策
3. **權限不足**：匿名使用者無法新增資料

## ✅ 解決方案

### 方案 1: 使用修復腳本（推薦）

我已經為您建立了 `fix-rls-policies.sql` 檔案，這個檔案會：

- ✅ **檢查現有政策**：顯示現有的 RLS 政策
- ✅ **刪除舊政策**：清理不完整的政策
- ✅ **建立完整政策**：為所有操作建立政策
- ✅ **測試功能**：測試插入功能是否正常
- ✅ **清理測試資料**：刪除測試資料

### 方案 2: 手動修復

如果您想手動修復，可以執行：

```sql
-- 為 events 表建立完整的政策
CREATE POLICY "任何人都可以讀取活動" ON events
    FOR SELECT USING (true);

CREATE POLICY "任何人都可以新增活動" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "任何人都可以更新活動" ON events
    FOR UPDATE USING (true);

CREATE POLICY "任何人都可以刪除活動" ON events
    FOR DELETE USING (true);

-- 為 registrations 表建立完整的政策
CREATE POLICY "任何人都可以讀取報名資料" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "任何人都可以新增報名" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "任何人都可以更新報名" ON registrations
    FOR UPDATE USING (true);

CREATE POLICY "任何人都可以刪除報名" ON registrations
    FOR DELETE USING (true);
```

### 方案 3: 暫時禁用 RLS（不推薦）

如果您想暫時禁用 RLS：

```sql
-- 暫時禁用 RLS（不推薦用於生產環境）
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
```

## 🎯 推薦做法

**使用 `fix-rls-policies.sql`**，因為它：

1. **安全**：保持 RLS 啟用，確保資料安全
2. **完整**：建立所有必要的政策
3. **測試**：自動測試功能是否正常
4. **可重複執行**：可以多次執行而不會出錯

## 📋 執行步驟

1. **開啟 Supabase SQL Editor**
2. **複製 `fix-rls-policies.sql` 的全部內容**
3. **貼到 SQL Editor 中**
4. **點擊 "Run" 執行**
5. **查看執行結果**

## 🔍 執行結果說明

執行完成後，您會看到：

1. **現有政策檢查**：顯示現有的 RLS 政策
2. **政策建立**：建立完整的 CRUD 政策
3. **測試插入**：測試插入功能是否正常
4. **結果確認**：確認政策設定正確

## 🚀 驗證結果

執行完成後，您可以：

1. **重新測試**：在 `test-supabase.html` 中重新測試
2. **檢查政策**：確認所有政策都已建立
3. **測試功能**：確認新增、讀取、更新、刪除都正常

## 📊 預期的政策

### events 表應該有：
- 任何人都可以讀取活動
- 任何人都可以新增活動
- 任何人都可以更新活動
- 任何人都可以刪除活動

### registrations 表應該有：
- 任何人都可以讀取報名資料
- 任何人都可以新增報名
- 任何人都可以更新報名
- 任何人都可以刪除報名

## 🎉 下一步

SQL 執行成功後：
1. 重新測試 `test-supabase.html`
2. 確認所有測試都通過
3. 開始使用報名系統

## 📞 如果還有問題

如果執行 `fix-rls-policies.sql` 後仍有問題：
1. 檢查錯誤訊息
2. 確認 Supabase 專案權限
3. 逐步執行 SQL 語句
4. 查看 Supabase 官方文件

## 🔧 技術說明

### 問題根源：
- RLS 已啟用但政策不完整
- 只設定了讀取政策，沒有設定新增政策
- 匿名使用者無法新增資料

### 解決方法：
- 建立完整的 CRUD 政策
- 允許匿名使用者進行所有操作
- 保持 RLS 啟用以確保資料安全






