-- ============================================
-- MIGRATION V014: CREATE TABLE AUDIT_LOGS
-- ============================================
-- Logs de auditoria para rastreamento de ações
-- Depende de: users (V003)
-- Retenção recomendada: 1 ano (365 dias)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações do usuário (denormalizadas para histórico)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  
  -- Detalhes da ação
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN')),
  entity_type TEXT,
  entity_id UUID,
  
  -- Dados antes e depois (para UPDATE e DELETE)
  old_values JSONB,
  new_values JSONB,
  
  -- Metadados da requisição
  route TEXT,
  method TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_filters ON audit_logs(created_at DESC, action, entity_type);

-- Comentário sobre política de retenção
COMMENT ON TABLE audit_logs IS 'Logs de auditoria. Política de retenção: 1 ano. Execute DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL ''1 year'' periodicamente.';

-- ============================================
-- FIM DA MIGRATION V014
-- ============================================
