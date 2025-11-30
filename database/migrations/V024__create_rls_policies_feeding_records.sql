-- ============================================
-- MIGRATION V024: RLS POLICIES FOR FEEDING_RECORDS TABLE
-- ============================================
-- Políticas de segurança para tabela feeding_records
-- ============================================

-- SELECT: Todos podem ver registros de alimentação
CREATE POLICY "feeding_records_select_authenticated"
  ON feeding_records FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar registros de alimentação
CREATE POLICY "feeding_records_insert_authenticated"
  ON feeding_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar registros de alimentação
CREATE POLICY "feeding_records_update_authenticated"
  ON feeding_records FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Apenas admins podem deletar registros de alimentação
CREATE POLICY "feeding_records_delete_admin"
  ON feeding_records FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V024
-- ============================================
