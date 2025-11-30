-- Tabela de logs de auditoria para rastreamento de ações dos usuários
-- Retenção recomendada: 1 ano (365 dias)
-- Executar limpeza periódica via job ou endpoint admin

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações do usuário (denormalizadas para histórico)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  
  -- Detalhes da ação
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN')),
  entity_type TEXT, -- 'system', 'tank', 'user', 'feeding_record', etc.
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

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Índice composto para filtros comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_filters ON audit_logs(created_at DESC, action, entity_type);

-- Comentário sobre política de retenção
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de ações dos usuários. Política de retenção: 1 ano. Executar DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL ''1 year'' periodicamente.';
