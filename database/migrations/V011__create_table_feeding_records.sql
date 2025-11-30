-- ============================================
-- MIGRATION V011: CREATE TABLE FEEDING_RECORDS
-- ============================================
-- Histórico geral de alimentação
-- Depende de: tanks (V005), users (V003)
-- ============================================

CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  food TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feeding_records_tank ON feeding_records(tank_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_records_user_id ON feeding_records(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_feeding_records_updated_at 
  BEFORE UPDATE ON feeding_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V011
-- ============================================
