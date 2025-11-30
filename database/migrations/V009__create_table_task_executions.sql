-- ============================================
-- MIGRATION V009: CREATE TABLE DAILY_CHECKLIST_TASK_EXECUTIONS
-- ============================================
-- Execução de tarefas do checklist diário
-- Depende de: daily_checklists (V008), checklist_tasks (V006), users (V003)
-- ============================================

CREATE TABLE IF NOT EXISTS daily_checklist_task_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_checklist_id UUID REFERENCES daily_checklists(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES checklist_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_executions_checklist ON daily_checklist_task_executions(daily_checklist_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_task ON daily_checklist_task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_date ON daily_checklist_task_executions(date);
CREATE INDEX IF NOT EXISTS idx_task_executions_user ON daily_checklist_task_executions(user_id);

-- Constraint única para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_executions_unique 
  ON daily_checklist_task_executions(task_id, user_id, date);

-- Trigger para updated_at
CREATE TRIGGER update_task_executions_updated_at 
  BEFORE UPDATE ON daily_checklist_task_executions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION V009
-- ============================================
