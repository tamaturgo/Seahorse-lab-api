-- ============================================
-- MIGRATION V030: RLS POLICIES FOR DIETS AND DIET_ITEMS
-- ============================================
-- Políticas de segurança para tabelas de dietas
-- ============================================

-- DIETS
CREATE POLICY "diets_select_authenticated"
  ON diets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "diets_insert_authenticated"
  ON diets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "diets_update_authenticated"
  ON diets FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "diets_delete_admin"
  ON diets FOR DELETE
  TO authenticated
  USING (is_admin());

-- DIET_ITEMS
CREATE POLICY "diet_items_select_authenticated"
  ON diet_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "diet_items_insert_authenticated"
  ON diet_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "diet_items_update_authenticated"
  ON diet_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "diet_items_delete_admin"
  ON diet_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V030
-- ============================================
