-- ============================================
-- MIGRATION V031: ALTER FEEDING_RECORDS TO ADD UNIT AND FOOD_TYPE
-- ============================================
-- Adds unit (ml/g/und) and optional food_type_id to feeding_records
-- ============================================

ALTER TABLE feeding_records
  ADD COLUMN IF NOT EXISTS food_type_id UUID REFERENCES food_types(id),
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'ml' CHECK (unit IN ('ml', 'g', 'und'));

CREATE INDEX IF NOT EXISTS idx_feeding_records_food_type ON feeding_records(food_type_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_unit ON feeding_records(unit);

-- ============================================
-- FIM DA MIGRATION V031
-- ============================================
