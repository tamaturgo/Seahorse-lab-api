-- ============================================
-- MIGRATION V032: ADD PARENT AND WEEKDAY FLAGS TO CHECKLIST_TASKS
-- ============================================
-- Adds parent relationship (one level) and day-of-week recurrence flags
-- ============================================

ALTER TABLE checklist_tasks
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES checklist_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS monday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tuesday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS wednesday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS thursday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS friday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS saturday BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sunday BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_checklist_tasks_parent ON checklist_tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_weekdays ON checklist_tasks(monday, tuesday, wednesday, thursday, friday, saturday, sunday);

-- ============================================
-- FIM DA MIGRATION V032
-- ============================================
