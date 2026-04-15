-- 修復 ID 約束問題腳本
-- 解決 gen_random_uuid() 函數問題

-- 首先檢查現有的 events 表結構
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 檢查 registrations 表結構
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;

-- 修復 events 表的 id 欄位
DO $$ 
BEGIN
    -- 如果 id 欄位存在但沒有預設值，添加預設值
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'id') THEN
        -- 先刪除現有的約束
        ALTER TABLE events ALTER COLUMN id DROP NOT NULL;
        
        -- 更新現有的空值記錄
        UPDATE events SET id = gen_random_uuid() WHERE id IS NULL;
        
        -- 重新設定約束和預設值
        ALTER TABLE events ALTER COLUMN id SET NOT NULL;
        ALTER TABLE events ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        -- 添加主鍵約束（如果不存在）
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE table_name = 'events' AND constraint_type = 'PRIMARY KEY') THEN
            ALTER TABLE events ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- 修復 registrations 表的 id 欄位
DO $$ 
BEGIN
    -- 如果 id 欄位存在但沒有預設值，添加預設值
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'id') THEN
        -- 先刪除現有的約束
        ALTER TABLE registrations ALTER COLUMN id DROP NOT NULL;
        
        -- 更新現有的空值記錄
        UPDATE registrations SET id = gen_random_uuid() WHERE id IS NULL;
        
        -- 重新設定約束和預設值
        ALTER TABLE registrations ALTER COLUMN id SET NOT NULL;
        ALTER TABLE registrations ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        -- 添加主鍵約束（如果不存在）
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE table_name = 'registrations' AND constraint_type = 'PRIMARY KEY') THEN
            ALTER TABLE registrations ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- 確保 gen_random_uuid() 函數可用
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 重新建立 events 表（如果結構有問題）
DO $$ 
BEGIN
    -- 檢查是否有問題的記錄
    IF EXISTS (SELECT 1 FROM events WHERE id IS NULL) THEN
        -- 刪除有問題的記錄
        DELETE FROM events WHERE id IS NULL;
    END IF;
END $$;

-- 重新建立 registrations 表（如果結構有問題）
DO $$ 
BEGIN
    -- 檢查是否有問題的記錄
    IF EXISTS (SELECT 1 FROM registrations WHERE id IS NULL) THEN
        -- 刪除有問題的記錄
        DELETE FROM registrations WHERE id IS NULL;
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

-- 插入範例活動資料（使用明確的 ID）
INSERT INTO events (id, name, type, date, time, location, capacity, fee, description, active) 
SELECT gen_random_uuid(), '團體輔導活動', 'group-counseling', '2024-02-15', '14:00-16:00', '活動中心', 20, 0, '透過團體互動提升自我認知，幫助學生建立良好的人際關係', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '團體輔導活動');

INSERT INTO events (id, name, type, date, time, location, capacity, fee, description, active) 
SELECT gen_random_uuid(), '志工成長班', 'volunteer-growth', '2024-02-20', '09:00-12:00', '會議室A', 15, 0, '培養志工服務技能，提升服務品質', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '志工成長班');

INSERT INTO events (id, name, type, date, time, location, capacity, fee, description, active) 
SELECT gen_random_uuid(), '親職教育講座', 'parent-education', '2024-02-25', '19:00-21:00', '大禮堂', 100, 0, '提升親職教育能力，建立良好的親子關係', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '親職教育講座');

INSERT INTO events (id, name, type, date, time, location, capacity, fee, description, active) 
SELECT gen_random_uuid(), '學生領導力培訓', 'leadership', '2024-03-01', '10:00-16:00', '多功能教室', 30, 500, '培養學生領導能力，提升團隊合作精神', true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = '學生領導力培訓');

INSERT INTO events (id, name, type, date, time, location, capacity, fee, description, active) 
SELECT gen_random_uuid(), '藝術創作工作坊', 'art-workshop', '2024-03-05', '14:00-17:00', '美術教室', 25, 300, '透過藝術創作表達自我，培養創意思維', true
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






