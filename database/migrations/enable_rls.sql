-- ============================================
-- SEAHORSE HABITAT HUB - ROW LEVEL SECURITY
-- ============================================
-- Script para configurar políticas de segurança RLS no Supabase
-- Execute este script APÓS executar o schema.sql
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklist_task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklist_feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA: users
-- ============================================

-- Permitir que usuários autenticados vejam todos os usuários
CREATE POLICY "Usuários autenticados podem ver todos os usuários"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Permitir que admins criem usuários
CREATE POLICY "Admins podem criar usuários"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Permitir que usuários atualizem seus próprios dados ou admins atualizem qualquer um
CREATE POLICY "Usuários podem atualizar seus dados ou admins podem atualizar qualquer um"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Permitir que admins deletem usuários
CREATE POLICY "Admins podem deletar usuários"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: systems
-- ============================================

-- Todos podem ver sistemas
CREATE POLICY "Usuários autenticados podem ver sistemas"
  ON systems FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar/modificar/deletar sistemas
CREATE POLICY "Admins podem criar sistemas"
  ON systems FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar sistemas"
  ON systems FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar sistemas"
  ON systems FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: tanks
-- ============================================

-- Todos podem ver tanques
CREATE POLICY "Usuários autenticados podem ver tanques"
  ON tanks FOR SELECT
  TO authenticated
  USING (true);

-- Todos podem criar/atualizar tanques
CREATE POLICY "Usuários autenticados podem criar tanques"
  ON tanks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar tanques"
  ON tanks FOR UPDATE
  TO authenticated
  USING (true);

-- Apenas admins podem deletar tanques
CREATE POLICY "Admins podem deletar tanques"
  ON tanks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: checklist_tasks
-- ============================================

CREATE POLICY "Usuários autenticados podem ver tarefas"
  ON checklist_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem criar tarefas"
  ON checklist_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar tarefas"
  ON checklist_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar tarefas"
  ON checklist_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: food_types
-- ============================================

CREATE POLICY "Usuários autenticados podem ver tipos de alimento"
  ON food_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem criar tipos de alimento"
  ON food_types FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar tipos de alimento"
  ON food_types FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar tipos de alimento"
  ON food_types FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: daily_checklists
-- ============================================

CREATE POLICY "Usuários autenticados podem ver checklists"
  ON daily_checklists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar checklists"
  ON daily_checklists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar checklists"
  ON daily_checklists FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar checklists"
  ON daily_checklists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: daily_checklist_task_executions
-- ============================================

CREATE POLICY "Usuários autenticados podem ver execuções de tarefas"
  ON daily_checklist_task_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar execuções de tarefas"
  ON daily_checklist_task_executions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar execuções de tarefas"
  ON daily_checklist_task_executions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar execuções de tarefas"
  ON daily_checklist_task_executions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS PARA: daily_checklist_feeding_records
-- ============================================

CREATE POLICY "Usuários autenticados podem ver registros de alimentação"
  ON daily_checklist_feeding_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar registros de alimentação"
  ON daily_checklist_feeding_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar registros de alimentação"
  ON daily_checklist_feeding_records FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar registros de alimentação"
  ON daily_checklist_feeding_records FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS PARA: water_parameters
-- ============================================

CREATE POLICY "Usuários autenticados podem ver parâmetros da água"
  ON water_parameters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar parâmetros da água"
  ON water_parameters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar parâmetros da água"
  ON water_parameters FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar parâmetros da água"
  ON water_parameters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA: feeding_records
-- ============================================

CREATE POLICY "Usuários autenticados podem ver registros de alimentação gerais"
  ON feeding_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar registros de alimentação gerais"
  ON feeding_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar registros de alimentação gerais"
  ON feeding_records FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar registros de alimentação gerais"
  ON feeding_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- ============================================
-- FUNÇÃO AUXILIAR: Verificar se o usuário é admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIM DO SCRIPT RLS
-- ============================================
-- Todas as políticas de segurança foram configuradas
-- As tabelas agora estão protegidas com Row Level Security
-- ============================================
