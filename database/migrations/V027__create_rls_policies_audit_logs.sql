-- ============================================
-- MIGRATION V027: RLS POLICIES FOR AUDIT_LOGS TABLE
-- ============================================
-- Políticas de segurança para tabela audit_logs
-- ============================================

-- SELECT: Apenas admins podem ver logs de auditoria
CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT: Sistema pode inserir logs (service role)
CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Ninguém pode atualizar logs (imutável)
-- Não criar policy de UPDATE

-- DELETE: Apenas admins podem deletar logs (para limpeza)
CREATE POLICY "audit_logs_delete_admin"
  ON audit_logs FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V027
-- ============================================
