-- ============================================
-- MIGRATION V008: CREATE TABLE DAILY_CHECKLISTS
-- ============================================
-- Registro de checklists diários
-- Depende de: users (V003)
-- ============================================

CREATE TABLE IF NOT EXISTS daily_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_daily_checklists_date ON daily_checklists(date);

-- Trigger para updated_at
CREATE TRIGGER update_daily_checklists_updated_at 
  BEFORE UPDATE ON daily_checklists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V008
-- ============================================
