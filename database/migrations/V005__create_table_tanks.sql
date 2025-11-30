-- ============================================
-- MIGRATION V005: CREATE TABLE TANKS
-- ============================================
-- Tanques/Aquários dentro de cada sistema
-- Depende de: systems (V004)
-- ============================================

CREATE TABLE IF NOT EXISTS tanks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 0,
  animals INTEGER NOT NULL DEFAULT 0,
  species TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tanks_system_id ON tanks(system_id);
CREATE INDEX IF NOT EXISTS idx_tanks_status ON tanks(status);

-- Trigger para updated_at
CREATE TRIGGER update_tanks_updated_at 
  BEFORE UPDATE ON tanks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V005
-- ============================================
