-- ============================================
-- MIGRATION V017: RLS POLICIES FOR SYSTEMS TABLE
-- ============================================
-- Políticas de segurança para tabela systems
-- ============================================

-- SELECT: Todos podem ver sistemas
CREATE POLICY "systems_select_authenticated"
  ON systems FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Apenas admins podem criar sistemas
CREATE POLICY "systems_insert_admin"
  ON systems FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: Apenas admins podem atualizar sistemas
CREATE POLICY "systems_update_admin"
  ON systems FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: Apenas admins podem deletar sistemas
CREATE POLICY "systems_delete_admin"
  ON systems FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V017
-- ============================================
