-- ============================================
-- MIGRATION V023: RLS POLICIES FOR WATER_PARAMETERS TABLE
-- ============================================
-- Políticas de segurança para tabela water_parameters
-- ============================================

-- SELECT: Todos podem ver parâmetros da água
CREATE POLICY "water_parameters_select_authenticated"
  ON water_parameters FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos podem criar parâmetros da água
CREATE POLICY "water_parameters_insert_authenticated"
  ON water_parameters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Todos podem atualizar parâmetros da água
CREATE POLICY "water_parameters_update_authenticated"
  ON water_parameters FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE: Apenas admins podem deletar parâmetros da água
CREATE POLICY "water_parameters_delete_admin"
  ON water_parameters FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V023
-- ============================================
