-- ============================================
-- MIGRATION V004: CREATE TABLE SYSTEMS
-- ============================================
-- Sistemas de criação (ex: Sistema Juvenil, Adulto, Reprodução)
-- ============================================

CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_systems_updated_at 
  BEFORE UPDATE ON systems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V004
-- ============================================
