-- Adicionar user_id e date diretamente em daily_checklist_task_executions
-- para simplificar a lógica de salvamento

ALTER TABLE daily_checklist_task_executions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Tornar daily_checklist_id opcional (pode ser NULL)
ALTER TABLE daily_checklist_task_executions
ALTER COLUMN daily_checklist_id DROP NOT NULL;

-- Adicionar índice para date e user_id
CREATE INDEX IF NOT EXISTS idx_task_executions_date ON daily_checklist_task_executions(date);
CREATE INDEX IF NOT EXISTS idx_task_executions_user ON daily_checklist_task_executions(user_id);

-- Remover constraint antiga e adicionar nova constraint única para task_id, user_id, date
ALTER TABLE daily_checklist_task_executions
DROP CONSTRAINT IF EXISTS daily_checklist_task_executions_daily_checklist_id_task_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_executions_unique 
ON daily_checklist_task_executions(task_id, user_id, date);
