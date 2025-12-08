-- ============================================
-- MIGRATION V029: CREATE TABLE DIETS AND DIET_ITEMS
-- ============================================
-- Dietas por tanque com itens (alimento, quantidade, unidade, horários, dias da semana)
-- Depende de: tanks (V005), food_types (V007)
-- ============================================

CREATE TABLE IF NOT EXISTS diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('juvenil', 'jovem', 'adulto')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apenas uma dieta ativa por tanque
CREATE UNIQUE INDEX IF NOT EXISTS idx_diets_active_per_tank
  ON diets(tank_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_diets_tank_id ON diets(tank_id);
CREATE INDEX IF NOT EXISTS idx_diets_is_active ON diets(is_active);

CREATE TABLE IF NOT EXISTS diet_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diet_id UUID NOT NULL REFERENCES diets(id) ON DELETE CASCADE,
  food_type_id UUID NOT NULL REFERENCES food_types(id),
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ml' CHECK (unit IN ('ml', 'g', 'und')),
  time_of_day TIME NOT NULL DEFAULT '08:00:00',
  monday BOOLEAN NOT NULL DEFAULT true,
  tuesday BOOLEAN NOT NULL DEFAULT true,
  wednesday BOOLEAN NOT NULL DEFAULT true,
  thursday BOOLEAN NOT NULL DEFAULT true,
  friday BOOLEAN NOT NULL DEFAULT true,
  saturday BOOLEAN NOT NULL DEFAULT true,
  sunday BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_items_diet_id ON diet_items(diet_id);
CREATE INDEX IF NOT EXISTS idx_diet_items_time_of_day ON diet_items(time_of_day);
CREATE INDEX IF NOT EXISTS idx_diet_items_sort_order ON diet_items(diet_id, sort_order);

-- Triggers para updated_at
CREATE TRIGGER update_diets_updated_at 
  BEFORE UPDATE ON diets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_items_updated_at 
  BEFORE UPDATE ON diet_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FIM DA MIGRATION V029
-- ============================================
