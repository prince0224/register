-- 乾淨版資料庫結構 - 避免所有語法衝突

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
    poster TEXT,
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
    signature TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
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

-- 建立觸發器
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 建立 RLS 政策
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 刪除現有政策
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_insert_policy" ON events;
DROP POLICY IF EXISTS "events_update_policy" ON events;
DROP POLICY IF EXISTS "events_delete_policy" ON events;
DROP POLICY IF EXISTS "registrations_select_policy" ON registrations;
DROP POLICY IF EXISTS "registrations_insert_policy" ON registrations;
DROP POLICY IF EXISTS "registrations_update_policy" ON registrations;
DROP POLICY IF EXISTS "registrations_delete_policy" ON registrations;

-- 建立新的 RLS 政策
CREATE POLICY "events_select_policy" ON events
    FOR SELECT USING (true);

CREATE POLICY "events_insert_policy" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "events_update_policy" ON events
    FOR UPDATE USING (true);

CREATE POLICY "events_delete_policy" ON events
    FOR DELETE USING (true);

CREATE POLICY "registrations_select_policy" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "registrations_insert_policy" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "registrations_update_policy" ON registrations
    FOR UPDATE USING (true);

CREATE POLICY "registrations_delete_policy" ON registrations
    FOR DELETE USING (true);

-- 插入範例活動資料
INSERT INTO events (id, name, type, date, event_time, location, description, capacity, fee, deadline, active, created_at) VALUES
('event_1', '青少年情緒管理團體輔導', 'group-counseling', CURRENT_DATE + INTERVAL '7 days', '14:00:00', '台北市信義區', '協助青少年學習情緒管理技巧，建立健康的心理狀態', 15, 0, CURRENT_DATE + INTERVAL '5 days', true, NOW()),
('event_2', '志工服務技巧成長班', 'volunteer-growth', CURRENT_DATE + INTERVAL '14 days', '09:00:00', '台北市大安區', '提升志工服務品質，學習溝通技巧與服務倫理', 25, 0, CURRENT_DATE + INTERVAL '12 days', true, NOW()),
('event_3', '親子溝通技巧講座', 'parent-education', CURRENT_DATE + INTERVAL '21 days', '19:00:00', '台北市中山區', '學習有效的親子溝通方法，建立和諧的家庭關係', 40, 0, CURRENT_DATE + INTERVAL '19 days', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- 完成
SELECT '乾淨版資料庫結構建立完成！' as message;
