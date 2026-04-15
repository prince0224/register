-- 修復資料庫結構腳本
-- 檢查現有結構並添加缺失的欄位

-- 首先檢查 events 表的現有結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 檢查 registrations 表的現有結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;

-- 為 events 表添加缺失的欄位（如果不存在）
DO $$ 
BEGIN
    -- 添加 time 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'time') THEN
        ALTER TABLE events ADD COLUMN time VARCHAR(50);
    END IF;
    
    -- 添加 location 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
        ALTER TABLE events ADD COLUMN location VARCHAR(255);
    END IF;
    
    -- 添加 capacity 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'capacity') THEN
        ALTER TABLE events ADD COLUMN capacity INTEGER;
    END IF;
    
    -- 添加 fee 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'fee') THEN
        ALTER TABLE events ADD COLUMN fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- 添加 description 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'description') THEN
        ALTER TABLE events ADD COLUMN description TEXT;
    END IF;
    
    -- 添加 poster_url 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'poster_url') THEN
        ALTER TABLE events ADD COLUMN poster_url TEXT;
    END IF;
    
    -- 添加 active 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'active') THEN
        ALTER TABLE events ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
    
    -- 添加 created_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
        ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加 updated_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'updated_at') THEN
        ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 為 registrations 表添加缺失的欄位（如果不存在）
DO $$ 
BEGIN
    -- 添加 event_id 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'event_id') THEN
        ALTER TABLE registrations ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
    END IF;
    
    -- 添加 name 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'name') THEN
        ALTER TABLE registrations ADD COLUMN name VARCHAR(255) NOT NULL;
    END IF;
    
    -- 添加 email 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'email') THEN
        ALTER TABLE registrations ADD COLUMN email VARCHAR(255) NOT NULL;
    END IF;
    
    -- 添加 phone 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'phone') THEN
        ALTER TABLE registrations ADD COLUMN phone VARCHAR(50) NOT NULL;
    END IF;
    
    -- 添加 birthdate 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'birthdate') THEN
        ALTER TABLE registrations ADD COLUMN birthdate DATE;
    END IF;
    
    -- 添加 registration_date 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'registration_date') THEN
        ALTER TABLE registrations ADD COLUMN registration_date DATE NOT NULL;
    END IF;
    
    -- 添加 dietary_requirements 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'dietary_requirements') THEN
        ALTER TABLE registrations ADD COLUMN dietary_requirements TEXT;
    END IF;
    
    -- 添加 notes 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'notes') THEN
        ALTER TABLE registrations ADD COLUMN notes TEXT;
    END IF;
    
    -- 添加 signature_data 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'signature_data') THEN
        ALTER TABLE registrations ADD COLUMN signature_data TEXT;
    END IF;
    
    -- 添加 status 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'status') THEN
        ALTER TABLE registrations ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    -- 添加 submitted_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'submitted_at') THEN
        ALTER TABLE registrations ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加 created_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'created_at') THEN
        ALTER TABLE registrations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加 updated_at 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'updated_at') THEN
        ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為 events 表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 為 registrations 表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_events_active ON events(active);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at ON registrations(submitted_at);
CREATE INDEX IF NOT EXISTS idx_registrations_name ON registrations(name);

-- 啟用 Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 建立安全政策
DROP POLICY IF EXISTS "任何人都可以讀取活動" ON events;
CREATE POLICY "任何人都可以讀取活動" ON events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "任何人都可以新增報名" ON registrations;
CREATE POLICY "任何人都可以新增報名" ON registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "任何人都可以讀取報名資料" ON registrations;
CREATE POLICY "任何人都可以讀取報名資料" ON registrations
    FOR SELECT USING (true);

-- 插入範例活動資料（如果不存在）
INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
SELECT '團體輔導活動', 'group-counseling', '2024-02-15', '14:00-16:00', '活動中心', 20, 0, '透過團體互動提升自我認知，幫助學生建立良好的人際關係', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '團體輔導活動');

INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
SELECT '志工成長班', 'volunteer-growth', '2024-02-20', '09:00-12:00', '會議室A', 15, 0, '培養志工服務技能，提升服務品質', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '志工成長班');

INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
SELECT '親職教育講座', 'parent-education', '2024-02-25', '19:00-21:00', '大禮堂', 100, 0, '提升親職教育能力，建立良好的親子關係', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '親職教育講座');

INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
SELECT '學生領導力培訓', 'leadership', '2024-03-01', '10:00-16:00', '多功能教室', 30, 500, '培養學生領導能力，提升團隊合作精神', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '學生領導力培訓');

INSERT INTO events (name, type, date, time, location, capacity, fee, description, active) 
SELECT '藝術創作工作坊', 'art-workshop', '2024-03-05', '14:00-17:00', '美術教室', 25, 300, '透過藝術創作表達自我，培養創意思維', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '藝術創作工作坊');

-- 建立檢視表
CREATE OR REPLACE VIEW active_events AS
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
CREATE OR REPLACE VIEW registration_stats AS
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
