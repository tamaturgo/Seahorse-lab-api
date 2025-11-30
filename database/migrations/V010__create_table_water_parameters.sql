-- ============================================
-- MIGRATION V010: CREATE TABLE WATER_PARAMETERS
-- ============================================
-- Histórico de parâmetros da água
-- Depende de: tanks (V005), systems (V004), users (V003)
-- ============================================

CREATE TABLE IF NOT EXISTS water_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID REFERENCES tanks(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  ph NUMERIC(4, 2) CHECK (ph >= 0 AND ph <= 14),
  temperature NUMERIC(5, 2),
  ammonia NUMERIC(10, 4),
  nitrite NUMERIC(10, 4),
  nitrate NUMERIC(10, 4),
  salinity NUMERIC(5, 2),
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_water_parameters_tank ON water_parameters(tank_id);
CREATE INDEX IF NOT EXISTS idx_water_parameters_system_id ON water_parameters(system_id);
CREATE INDEX IF NOT EXISTS idx_water_parameters_measured_at ON water_parameters(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_parameters_user_id ON water_parameters(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_water_parameters_updated_at 
  BEFORE UPDATE ON water_parameters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V010
-- ============================================
