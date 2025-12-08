-- ============================================
-- MIGRATION V033: REFACTOR DIETS AS TEMPLATES
-- ============================================
-- Transforma dietas em templates reutilizáveis
-- Cria tabela tank_diets para vincular tanques a dietas
-- ============================================

-- 1. Tornar tank_id opcional em diets (para templates)
ALTER TABLE diets 
  ALTER COLUMN tank_id DROP NOT NULL;

-- 2. Remover índice único de dieta ativa por tanque (não faz mais sentido)
DROP INDEX IF EXISTS idx_diets_active_per_tank;

-- 3. Criar tabela de vínculo entre tanques e dietas
CREATE TABLE IF NOT EXISTS tank_diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  diet_id UUID NOT NULL REFERENCES diets(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  birth_date DATE, -- Data de nascimento dos animais para cálculo de dias de vida
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apenas uma dieta ativa por tanque
CREATE UNIQUE INDEX IF NOT EXISTS idx_tank_diets_active_per_tank
  ON tank_diets(tank_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_tank_diets_tank_id ON tank_diets(tank_id);
CREATE INDEX IF NOT EXISTS idx_tank_diets_diet_id ON tank_diets(diet_id);
CREATE INDEX IF NOT EXISTS idx_tank_diets_is_active ON tank_diets(is_active);

-- 4. Atualizar trigger para tank_diets
CREATE TRIGGER update_tank_diets_updated_at
  BEFORE UPDATE ON tank_diets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Comentários
COMMENT ON TABLE tank_diets IS 'Vínculo entre tanques e dietas com histórico de ativação';
COMMENT ON COLUMN tank_diets.birth_date IS 'Data de nascimento dos animais para calcular dias de vida e aplicar itens da dieta';
COMMENT ON COLUMN diets.tank_id IS 'NULL para templates reutilizáveis, preenchido apenas para dietas específicas (legado)';

-- 6. Adicionar campos de período de dias aos itens da dieta
ALTER TABLE diet_items
  ADD COLUMN IF NOT EXISTS day_range_start INTEGER,
  ADD COLUMN IF NOT EXISTS day_range_end INTEGER;

-- 7. Remover campos antigos não mais necessários (dias da semana, horário, unidade)
ALTER TABLE diet_items
  DROP COLUMN IF EXISTS monday,
  DROP COLUMN IF EXISTS tuesday,
  DROP COLUMN IF EXISTS wednesday,
  DROP COLUMN IF EXISTS thursday,
  DROP COLUMN IF EXISTS friday,
  DROP COLUMN IF EXISTS saturday,
  DROP COLUMN IF EXISTS sunday,
  DROP COLUMN IF EXISTS time_of_day,
  DROP COLUMN IF EXISTS unit;

COMMENT ON COLUMN diet_items.day_range_start IS 'Início do período em dias de vida (ex: 1)';
COMMENT ON COLUMN diet_items.day_range_end IS 'Fim do período em dias de vida (ex: 7)';
