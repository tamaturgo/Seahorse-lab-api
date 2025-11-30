-- ============================================
-- MIGRATION: Criar tabela feeding_schedules
-- ============================================
-- Permite configurar horários de alimentação por tanque
-- Cada tanque pode ter seu próprio intervalo de alimentação
-- ============================================

-- ============================================
-- TABELA: feeding_schedules
-- Programação de alimentação por tanque
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
  UNIQUE(tank_id) -- Cada tanque só pode ter uma programação ativa
);

-- Índices para feeding_schedules
CREATE INDEX IF NOT EXISTS idx_feeding_schedules_tank ON feeding_schedules(tank_id);
CREATE INDEX IF NOT EXISTS idx_feeding_schedules_active ON feeding_schedules(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_feeding_schedules_updated_at 
  BEFORE UPDATE ON feeding_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: default_feeding_settings
-- Configurações padrão de alimentação (para novos tanques)
-- ============================================
CREATE TABLE IF NOT EXISTS default_feeding_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interval_hours INTEGER NOT NULL DEFAULT 4,
  start_time TIME NOT NULL DEFAULT '08:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_default_feeding_settings_updated_at 
  BEFORE UPDATE ON default_feeding_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configuração padrão inicial
INSERT INTO default_feeding_settings (interval_hours, start_time) 
VALUES (4, '08:00:00')
ON CONFLICT DO NOTHING;

-- ============================================
-- HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_feeding_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para feeding_schedules
CREATE POLICY "Usuários autenticados podem ver feeding_schedules" ON feeding_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar feeding_schedules" ON feeding_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar feeding_schedules" ON feeding_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar feeding_schedules" ON feeding_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para default_feeding_settings
CREATE POLICY "Usuários autenticados podem ver default_feeding_settings" ON default_feeding_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar default_feeding_settings" ON default_feeding_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- FIM DA MIGRATION
-- ============================================
