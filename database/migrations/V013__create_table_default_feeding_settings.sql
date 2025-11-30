-- ============================================
-- MIGRATION V013: CREATE TABLE DEFAULT_FEEDING_SETTINGS
-- ============================================
-- Configurações padrão de alimentação (para novos tanques)
-- ============================================

CREATE TABLE IF NOT EXISTS default_feeding_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interval_hours INTEGER NOT NULL DEFAULT 4,
  start_time TIME NOT NULL DEFAULT '08:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_default_feeding_settings_updated_at 
  BEFORE UPDATE ON default_feeding_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V013
-- ============================================
