-- ============================================
-- MIGRATION V018: RLS POLICIES FOR TANKS TABLE
-- ============================================
-- Políticas de segurança para tabela tanks
-- ============================================

-- SELECT: Todos podem ver tanques
CREATE POLICY "tanks_select_authenticated"
  ON tanks FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar tanques
CREATE POLICY "tanks_insert_authenticated"
  ON tanks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar tanques
CREATE POLICY "tanks_update_authenticated"
  ON tanks FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Apenas admins podem deletar tanques
CREATE POLICY "tanks_delete_admin"
  ON tanks FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V018
-- ============================================
