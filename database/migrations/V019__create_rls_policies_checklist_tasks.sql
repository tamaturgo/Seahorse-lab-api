-- ============================================
-- MIGRATION V019: RLS POLICIES FOR CHECKLIST_TASKS TABLE
-- ============================================
-- Políticas de segurança para tabela checklist_tasks
-- ============================================

-- SELECT: Todos podem ver tarefas
CREATE POLICY "checklist_tasks_select_authenticated"
  ON checklist_tasks FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Apenas admins podem criar tarefas
CREATE POLICY "checklist_tasks_insert_admin"
  ON checklist_tasks FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: Apenas admins podem atualizar tarefas
CREATE POLICY "checklist_tasks_update_admin"
  ON checklist_tasks FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: Apenas admins podem deletar tarefas
CREATE POLICY "checklist_tasks_delete_admin"
  ON checklist_tasks FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V019
-- ============================================
