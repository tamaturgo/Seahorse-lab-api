-- ============================================
-- MIGRATION V020: RLS POLICIES FOR FOOD_TYPES TABLE
-- ============================================
-- Políticas de segurança para tabela food_types
-- ============================================

-- SELECT: Todos podem ver tipos de alimento
CREATE POLICY "food_types_select_authenticated"
  ON food_types FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Apenas admins podem criar tipos de alimento
CREATE POLICY "food_types_insert_admin"
  ON food_types FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: Apenas admins podem atualizar tipos de alimento
CREATE POLICY "food_types_update_admin"
  ON food_types FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: Apenas admins podem deletar tipos de alimento
CREATE POLICY "food_types_delete_admin"
  ON food_types FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V020
-- ============================================
