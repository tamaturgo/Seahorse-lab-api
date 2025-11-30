-- ============================================
-- MIGRATION V026: RLS POLICIES FOR DEFAULT_FEEDING_SETTINGS TABLE
-- ============================================
-- Políticas de segurança para tabela default_feeding_settings
-- ============================================

-- SELECT: Todos podem ver configurações padrão
CREATE POLICY "default_feeding_settings_select_authenticated"
  ON default_feeding_settings FOR SELECT
  TO authenticated
  USING (true);

-- UPDATE: Todos podem atualizar configurações padrão
CREATE POLICY "default_feeding_settings_update_authenticated"
  ON default_feeding_settings FOR UPDATE
  TO authenticated
  USING (true);

-- INSERT: Apenas admins podem criar novas configurações
CREATE POLICY "default_feeding_settings_insert_admin"
  ON default_feeding_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- DELETE: Apenas admins podem deletar configurações
CREATE POLICY "default_feeding_settings_delete_admin"
  ON default_feeding_settings FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V026
-- ============================================
