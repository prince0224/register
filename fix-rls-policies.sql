-- 修復 RLS 政策腳本
-- 解決 Row Level Security 政策問題

-- 首先檢查現有的政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('events', 'registrations');

-- 刪除現有的政策（如果存在）
DROP POLICY IF EXISTS "任何人都可以讀取活動" ON events;
DROP POLICY IF EXISTS "任何人都可以新增報名" ON registrations;
DROP POLICY IF EXISTS "任何人都可以讀取報名資料" ON registrations;

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

-- 確認 RLS 已啟用
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 檢查政策是否正確建立
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('events', 'registrations');

-- 測試插入活動資料
INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
VALUES ('測試活動', 'test', '2024-12-31', '10:00-12:00', '測試地點', 10, 0, '這是一個測試活動', true);

-- 檢查是否成功插入
SELECT * FROM events WHERE name = '測試活動';

-- 清理測試資料
DELETE FROM events WHERE name = '測試活動';
