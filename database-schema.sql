-- 學校報名系統資料庫結構
-- 適用於 Supabase PostgreSQL

-- 建立活動資料表
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50),
    location VARCHAR(255),
    capacity INTEGER,
    fee DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    poster_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立報名資料表
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- 基本資訊
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    birthdate DATE,
    
    -- 報名資訊
    registration_date DATE NOT NULL,
    dietary_requirements TEXT,
    notes TEXT,
    signature_data TEXT, -- Base64 編碼的簽名圖片
    
    -- 系統資訊
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為 events 表建立更新時間觸發器
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 為 registrations 表建立更新時間觸發器
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 建立索引以提升查詢效能
CREATE INDEX idx_events_active ON events(active);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_submitted_at ON registrations(submitted_at);
CREATE INDEX idx_registrations_name ON registrations(name);

-- 啟用 Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 建立安全政策
-- 活動資料表政策（任何人都可以讀取）
CREATE POLICY "任何人都可以讀取活動" ON events
    FOR SELECT USING (true);

-- 報名資料表政策
CREATE POLICY "任何人都可以新增報名" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "任何人都可以讀取報名資料" ON registrations
    FOR SELECT USING (true);

-- 插入範例活動資料
INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) VALUES
('團體輔導活動', 'group-counseling', '2024-02-15', '14:00-16:00', '活動中心', 20, 0, '透過團體互動提升自我認知，幫助學生建立良好的人際關係', true),
('志工成長班', 'volunteer-growth', '2024-02-20', '09:00-12:00', '會議室A', 15, 0, '培養志工服務技能，提升服務品質', true),
('親職教育講座', 'parent-education', '2024-02-25', '19:00-21:00', '大禮堂', 100, 0, '提升親職教育能力，建立良好的親子關係', true),
('學生領導力培訓', 'leadership', '2024-03-01', '10:00-16:00', '多功能教室', 30, 500, '培養學生領導能力，提升團隊合作精神', true),
('藝術創作工作坊', 'art-workshop', '2024-03-05', '14:00-17:00', '美術教室', 25, 300, '透過藝術創作表達自我，培養創意思維', true);

-- 建立檢視表以便於查詢
CREATE VIEW active_events AS
SELECT 
    id,
    name,
    type,
    date,
    time,
    location,
    capacity,
    fee,
    description,
    poster_url,
    created_at
FROM events 
WHERE active = true 
ORDER BY date ASC;

-- 建立報名統計檢視表
CREATE VIEW registration_stats AS
SELECT 
    e.id as event_id,
    e.name as event_name,
    e.date as event_date,
    COUNT(r.id) as total_registrations,
    e.capacity,
    CASE 
        WHEN e.capacity IS NULL THEN '無限制'
        ELSE CONCAT(COUNT(r.id), '/', e.capacity)
    END as registration_count
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
WHERE e.active = true
GROUP BY e.id, e.name, e.date, e.capacity
ORDER BY e.date ASC;
