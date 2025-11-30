-- ============================================
-- MIGRATION V007: CREATE TABLE FOOD_TYPES
-- ============================================
-- Tipos de alimento disponíveis
-- ============================================

CREATE TABLE IF NOT EXISTS food_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'ml',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_food_types_code ON food_types(code);
CREATE INDEX IF NOT EXISTS idx_food_types_active ON food_types(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_food_types_updated_at 
  BEFORE UPDATE ON food_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V007
-- ============================================
