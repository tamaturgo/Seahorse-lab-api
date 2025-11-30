-- ============================================
-- MIGRATION V021: RLS POLICIES FOR DAILY_CHECKLISTS TABLE
-- ============================================
-- Políticas de segurança para tabela daily_checklists
-- ============================================

-- SELECT: Todos podem ver checklists
CREATE POLICY "daily_checklists_select_authenticated"
  ON daily_checklists FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar checklists
CREATE POLICY "daily_checklists_insert_authenticated"
  ON daily_checklists FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar checklists
CREATE POLICY "daily_checklists_update_authenticated"
  ON daily_checklists FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Apenas admins podem deletar checklists
CREATE POLICY "daily_checklists_delete_admin"
  ON daily_checklists FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V021
-- ============================================
