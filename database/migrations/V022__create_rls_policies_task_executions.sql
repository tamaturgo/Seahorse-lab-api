-- ============================================
-- MIGRATION V022: RLS POLICIES FOR TASK_EXECUTIONS TABLE
-- ============================================
-- Políticas de segurança para tabela daily_checklist_task_executions
-- ============================================

-- SELECT: Todos podem ver execuções de tarefas
CREATE POLICY "task_executions_select_authenticated"
  ON daily_checklist_task_executions FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar execuções de tarefas
CREATE POLICY "task_executions_insert_authenticated"
  ON daily_checklist_task_executions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar execuções de tarefas
CREATE POLICY "task_executions_update_authenticated"
  ON daily_checklist_task_executions FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Todos podem deletar execuções de tarefas
CREATE POLICY "task_executions_delete_authenticated"
  ON daily_checklist_task_executions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- FIM DA MIGRATION V022
-- ============================================
