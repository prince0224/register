-- 修復 registrations 表結構以符合新的表單設計
-- 移除不需要的欄位，添加新的欄位

-- 首先備份現有資料（如果需要）
-- CREATE TABLE registrations_backup AS SELECT * FROM registrations;

-- 刪除舊的 registrations 表
DROP TABLE IF EXISTS registrations CASCADE;

-- 重新建立 registrations 表
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- 基本資訊（更新後的結構）
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL DEFAULT '一年級',
    class VARCHAR(50) NOT NULL,
    seat_number INTEGER NOT NULL,
    
    -- 報名資訊
    registration_date DATE NOT NULL,
    notes TEXT,
    
    -- 系統資訊
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 重新建立索引
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_submitted_at ON registrations(submitted_at);
CREATE INDEX idx_registrations_name ON registrations(name);
CREATE INDEX idx_registrations_class ON registrations(class);
CREATE INDEX idx_registrations_seat_number ON registrations(seat_number);

-- 重新建立更新時間觸發器
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 重新啟用 Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 重新建立安全政策
CREATE POLICY "任何人都可以新增報名" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "任何人都可以讀取報名資料" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "任何人都可以更新報名資料" ON registrations
    FOR UPDATE USING (true);

CREATE POLICY "任何人都可以刪除報名資料" ON registrations
    FOR DELETE USING (true);

-- 重新建立報名統計檢視表
DROP VIEW IF EXISTS registration_stats;
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
