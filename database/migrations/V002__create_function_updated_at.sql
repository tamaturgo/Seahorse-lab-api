-- ============================================
-- MIGRATION V002: CREATE FUNCTION UPDATE_UPDATED_AT
-- ============================================
-- Função para atualizar automaticamente o campo updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIM DA MIGRATION V002
-- ============================================
