-- ============================================
-- MIGRATION V006: CREATE TABLE CHECKLIST_TASKS
-- ============================================
-- Tarefas configuráveis do checklist diário
-- ============================================

CREATE TABLE IF NOT EXISTS checklist_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_order ON checklist_tasks("order");
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_active ON checklist_tasks(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_checklist_tasks_updated_at 
  BEFORE UPDATE ON checklist_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V006
-- ============================================
