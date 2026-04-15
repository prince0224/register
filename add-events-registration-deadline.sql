-- 在 Supabase SQL Editor 執行一次：為 events 新增「報名截止日期」
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline date;

COMMENT ON COLUMN events.registration_deadline IS '報名截止日期（含當日仍可報名）；NULL 表示未另設截止日';
