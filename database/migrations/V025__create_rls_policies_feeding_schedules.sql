-- ============================================
-- MIGRATION V025: RLS POLICIES FOR FEEDING_SCHEDULES TABLE
-- ============================================
-- Políticas de segurança para tabela feeding_schedules
-- ============================================

-- SELECT: Todos podem ver programações de alimentação
CREATE POLICY "feeding_schedules_select_authenticated"
  ON feeding_schedules FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar programações de alimentação
CREATE POLICY "feeding_schedules_insert_authenticated"
  ON feeding_schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar programações de alimentação
CREATE POLICY "feeding_schedules_update_authenticated"
  ON feeding_schedules FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Todos podem deletar programações de alimentação
CREATE POLICY "feeding_schedules_delete_authenticated"
  ON feeding_schedules FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- FIM DA MIGRATION V025
-- ============================================
