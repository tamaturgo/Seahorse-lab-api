-- ============================================
-- MIGRATION V016: RLS POLICIES FOR USERS TABLE
-- ============================================
-- Políticas de segurança para tabela users
-- ============================================

-- Função auxiliar para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = auth.uid()::text
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Todos usuários autenticados podem ver todos os usuários
CREATE POLICY "users_select_authenticated"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Apenas admins podem criar usuários
CREATE POLICY "users_insert_admin"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: Usuários podem atualizar seus dados ou admins podem atualizar qualquer um
CREATE POLICY "users_update_self_or_admin"
  ON users FOR UPDATE
  TO authenticated
  USING (id::text = auth.uid()::text OR is_admin());

-- DELETE: Apenas admins podem deletar usuários
CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FIM DA MIGRATION V016
-- ============================================
