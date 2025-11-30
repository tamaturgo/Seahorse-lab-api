-- ============================================
-- MIGRATION V012: CREATE TABLE FEEDING_SCHEDULES
-- ============================================
-- Programação de alimentação por tanque
-- Depende de: tanks (V005)
-- ============================================

CREATE TABLE IF NOT EXISTS feeding_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  interval_hours INTEGER NOT NULL DEFAULT 4,
  start_time TIME NOT NULL DEFAULT '08:00:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tank_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feeding_schedules_tank ON feeding_schedules(tank_id);
CREATE INDEX IF NOT EXISTS idx_feeding_schedules_active ON feeding_schedules(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_feeding_schedules_updated_at 
  BEFORE UPDATE ON feeding_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V012
-- ============================================
