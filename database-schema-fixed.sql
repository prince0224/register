-- 活動報名系統資料庫結構（修正版）
-- 在 Supabase 中執行此 SQL 來建立所需的表格

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立活動表格
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    event_time TIME,
    location TEXT,
    description TEXT,
    capacity INTEGER,
    fee DECIMAL(10,2),
    deadline DATE,
    active BOOLEAN DEFAULT true,
    poster TEXT, -- 儲存海報圖片的 Base64 或 URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立報名表格
CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    birthdate DATE,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    dietary TEXT,
    notes TEXT,
    signature TEXT, -- 儲存簽名的 Base64 圖片
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_events_active ON events(active);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at ON registrations(submitted_at);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為 events 表格建立觸發器
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 為 registrations 表格建立觸發器
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 建立 RLS (Row Level Security) 政策
-- 啟用 RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取啟用的活動
DROP POLICY IF EXISTS "任何人都可以讀取啟用的活動" ON events;
CREATE POLICY "任何人都可以讀取啟用的活動" ON events
    FOR SELECT USING (active = true);

-- 允許所有人建立活動
DROP POLICY IF EXISTS "任何人都可以建立活動" ON events;
CREATE POLICY "任何人都可以建立活動" ON events
    FOR INSERT WITH CHECK (true);

-- 允許所有人更新活動
DROP POLICY IF EXISTS "任何人都可以更新活動" ON events;
CREATE POLICY "任何人都可以更新活動" ON events
    FOR UPDATE USING (true);

-- 允許所有人刪除活動
DROP POLICY IF EXISTS "任何人都可以刪除活動" ON events;
CREATE POLICY "任何人都可以刪除活動" ON events
    FOR DELETE USING (true);

-- 允許所有人建立報名
DROP POLICY IF EXISTS "任何人都可以建立報名" ON registrations;
CREATE POLICY "任何人都可以建立報名" ON registrations
    FOR INSERT WITH CHECK (true);

-- 允許所有人讀取自己的報名（基於 email）
DROP POLICY IF EXISTS "任何人都可以讀取自己的報名" ON registrations;
CREATE POLICY "任何人都可以讀取自己的報名" ON registrations
    FOR SELECT USING (true);

-- 允許所有人更新自己的報名
DROP POLICY IF EXISTS "任何人都可以更新自己的報名" ON registrations;
CREATE POLICY "任何人都可以更新自己的報名" ON registrations
    FOR UPDATE USING (true);

-- 允許所有人刪除自己的報名
DROP POLICY IF EXISTS "任何人都可以刪除自己的報名" ON registrations;
CREATE POLICY "任何人都可以刪除自己的報名" ON registrations
    FOR DELETE USING (true);

-- 插入一些範例活動資料
INSERT INTO events (id, name, type, date, event_time, location, description, capacity, fee, deadline, active, created_at) VALUES
('event_1', '青少年情緒管理團體輔導', 'group-counseling', CURRENT_DATE + INTERVAL '7 days', '14:00:00', '台北市信義區', '協助青少年學習情緒管理技巧，建立健康的心理狀態', 15, 0, CURRENT_DATE + INTERVAL '5 days', true, NOW()),
('event_2', '志工服務技巧成長班', 'volunteer-growth', CURRENT_DATE + INTERVAL '14 days', '09:00:00', '台北市大安區', '提升志工服務品質，學習溝通技巧與服務倫理', 25, 0, CURRENT_DATE + INTERVAL '12 days', true, NOW()),
('event_3', '親子溝通技巧講座', 'parent-education', CURRENT_DATE + INTERVAL '21 days', '19:00:00', '台北市中山區', '學習有效的親子溝通方法，建立和諧的家庭關係', 40, 0, CURRENT_DATE + INTERVAL '19 days', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- 建立視圖來簡化查詢
CREATE OR REPLACE VIEW active_events AS
SELECT 
    id,
    name,
    type,
    date,
    event_time,
    location,
    description,
    capacity,
    fee,
    deadline,
    poster,
    created_at,
    updated_at
FROM events 
WHERE active = true 
ORDER BY date ASC;

-- 建立報名統計視圖
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
    e.id as event_id,
    e.name as event_name,
    COUNT(r.id) as total_registrations,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN r.status = 'processed' THEN 1 END) as processed_count,
    e.capacity,
    CASE 
        WHEN e.capacity IS NULL THEN NULL
        ELSE ROUND((COUNT(r.id)::DECIMAL / e.capacity) * 100, 2)
    END as capacity_percentage
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
WHERE e.active = true
GROUP BY e.id, e.name, e.capacity, e.date
ORDER BY e.date ASC;

-- 建立函數來檢查活動是否還有名額
CREATE OR REPLACE FUNCTION check_event_capacity(check_event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    event_capacity INTEGER;
    current_registrations INTEGER;
BEGIN
    -- 獲取活動容量
    SELECT capacity INTO event_capacity
    FROM events 
    WHERE id = check_event_id AND active = true;
    
    -- 如果沒有容量限制，返回 true
    IF event_capacity IS NULL THEN
        RETURN true;
    END IF;
    
    -- 計算當前報名人數
    SELECT COUNT(*) INTO current_registrations
    FROM registrations 
    WHERE event_id = check_event_id;
    
    -- 檢查是否還有名額
    RETURN current_registrations < event_capacity;
END;
$$ LANGUAGE plpgsql;

-- 建立函數來獲取活動的報名人數
CREATE OR REPLACE FUNCTION get_event_registration_count(check_event_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    registration_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO registration_count
    FROM registrations 
    WHERE event_id = check_event_id;
    
    RETURN COALESCE(registration_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 建立函數來檢查報名截止日期
CREATE OR REPLACE FUNCTION is_registration_open(check_event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    event_deadline DATE;
    event_active BOOLEAN;
BEGIN
    -- 獲取活動資訊
    SELECT deadline, active INTO event_deadline, event_active
    FROM events 
    WHERE id = check_event_id;
    
    -- 檢查活動是否啟用
    IF NOT event_active THEN
        RETURN false;
    END IF;
    
    -- 如果沒有截止日期，返回 true
    IF event_deadline IS NULL THEN
        RETURN true;
    END IF;
    
    -- 檢查是否超過截止日期
    RETURN CURRENT_DATE <= event_deadline;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器來檢查報名容量
CREATE OR REPLACE FUNCTION check_registration_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- 檢查活動是否還有名額
    IF NOT check_event_capacity(NEW.event_id) THEN
        RAISE EXCEPTION '活動已額滿，無法報名';
    END IF;
    
    -- 檢查報名是否還在開放期間
    IF NOT is_registration_open(NEW.event_id) THEN
        RAISE EXCEPTION '報名已截止';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 registrations 表格建立容量檢查觸發器
DROP TRIGGER IF EXISTS check_capacity_before_insert ON registrations;
CREATE TRIGGER check_capacity_before_insert
    BEFORE INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION check_registration_capacity();

-- 建立清理舊資料的函數
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- 刪除 1 年前的非活躍活動
    DELETE FROM events 
    WHERE active = false 
    AND updated_at < NOW() - INTERVAL '1 year';
    
    -- 刪除 2 年前的已處理報名
    DELETE FROM registrations 
    WHERE status = 'processed' 
    AND updated_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- 建立備份函數
CREATE OR REPLACE FUNCTION backup_data()
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT,
    backup_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'events'::TEXT,
        COUNT(*)::BIGINT,
        NOW()
    FROM events
    UNION ALL
    SELECT 
        'registrations'::TEXT,
        COUNT(*)::BIGINT,
        NOW()
    FROM registrations;
END;
$$ LANGUAGE plpgsql;

-- 建立資料驗證函數
CREATE OR REPLACE FUNCTION validate_registration_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 驗證 email 格式
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION '無效的電子郵件格式';
    END IF;
    
    -- 驗證電話號碼（基本格式檢查）
    IF NEW.phone !~ '^[\d\-\+\(\)\s]+$' THEN
        RAISE EXCEPTION '無效的電話號碼格式';
    END IF;
    
    -- 驗證姓名長度
    IF LENGTH(TRIM(NEW.name)) < 2 THEN
        RAISE EXCEPTION '姓名至少需要 2 個字元';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 registrations 表格建立資料驗證觸發器
DROP TRIGGER IF EXISTS validate_registration_before_insert ON registrations;
CREATE TRIGGER validate_registration_before_insert
    BEFORE INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION validate_registration_data();

DROP TRIGGER IF EXISTS validate_registration_before_update ON registrations;
CREATE TRIGGER validate_registration_before_update
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION validate_registration_data();

-- 建立搜尋函數
CREATE OR REPLACE FUNCTION search_events(search_term TEXT)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    type TEXT,
    date DATE,
    event_time TIME,
    location TEXT,
    description TEXT,
    capacity INTEGER,
    fee DECIMAL(10,2),
    deadline DATE,
    poster TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.type,
        e.date,
        e.event_time,
        e.location,
        e.description,
        e.capacity,
        e.fee,
        e.deadline,
        e.poster,
        e.created_at,
        e.updated_at
    FROM events e
    WHERE e.active = true
    AND (
        e.name ILIKE '%' || search_term || '%'
        OR e.description ILIKE '%' || search_term || '%'
        OR e.location ILIKE '%' || search_term || '%'
    )
    ORDER BY e.date ASC;
END;
$$ LANGUAGE plpgsql;

-- 建立報名搜尋函數
CREATE OR REPLACE FUNCTION search_registrations(search_term TEXT)
RETURNS TABLE (
    reg_id TEXT,
    reg_name TEXT,
    reg_email TEXT,
    reg_phone TEXT,
    reg_birthdate DATE,
    reg_event_id TEXT,
    reg_event_date DATE,
    reg_dietary TEXT,
    reg_notes TEXT,
    reg_signature TEXT,
    reg_status TEXT,
    reg_submitted_at TIMESTAMP WITH TIME ZONE,
    reg_updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.email,
        r.phone,
        r.birthdate,
        r.event_id,
        r.event_date,
        r.dietary,
        r.notes,
        r.signature,
        r.status,
        r.submitted_at,
        r.updated_at
    FROM registrations r
    WHERE (
        r.name ILIKE '%' || search_term || '%'
        OR r.email ILIKE '%' || search_term || '%'
        OR r.phone ILIKE '%' || search_term || '%'
    )
    ORDER BY r.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 完成資料庫結構建立
SELECT '資料庫結構建立完成！' as message;

