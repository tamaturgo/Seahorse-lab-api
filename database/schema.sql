-- ============================================
-- SEAHORSE HABITAT HUB - DATABASE SCHEMA
-- ============================================
-- Script para criar tabelas no Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Habilitar extensão UUID (caso não esteja habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- Gerenciamento de usuários do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- TABELA: systems
-- Sistemas de criação (ex: Sistema Juvenil, Adulto, Reprodução)
-- ============================================
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tanks
-- Tanques/Aquários dentro de cada sistema
-- ============================================
CREATE TABLE IF NOT EXISTS tanks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 0,
  animals INTEGER NOT NULL DEFAULT 0,
  species TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tanks
CREATE INDEX IF NOT EXISTS idx_tanks_system_id ON tanks(system_id);
CREATE INDEX IF NOT EXISTS idx_tanks_status ON tanks(status);

-- ============================================
-- TABELA: checklist_tasks
-- Tarefas configuráveis do checklist diário
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para checklist_tasks
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_order ON checklist_tasks("order");
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_active ON checklist_tasks(is_active);

-- ============================================
-- TABELA: food_types
-- Tipos de alimento disponíveis
-- ============================================
CREATE TABLE IF NOT EXISTS food_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'ml',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para food_types
CREATE INDEX IF NOT EXISTS idx_food_types_code ON food_types(code);
CREATE INDEX IF NOT EXISTS idx_food_types_active ON food_types(is_active);

-- ============================================
-- TABELA: daily_checklists
-- Registro de checklists diários
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para daily_checklists
CREATE INDEX IF NOT EXISTS idx_daily_checklists_date ON daily_checklists(date);

-- ============================================
-- TABELA: daily_checklist_task_executions
-- Execução de tarefas do checklist diário
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checklist_task_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_checklist_id UUID NOT NULL REFERENCES daily_checklists(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES checklist_tasks(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(daily_checklist_id, task_id)
);

-- Índices para daily_checklist_task_executions
CREATE INDEX IF NOT EXISTS idx_task_executions_checklist ON daily_checklist_task_executions(daily_checklist_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_task ON daily_checklist_task_executions(task_id);

-- ============================================
-- TABELA: water_parameters
-- Histórico de parâmetros da água
-- ============================================
CREATE TABLE IF NOT EXISTS water_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  ph NUMERIC,
  temperature NUMERIC,
  ammonia NUMERIC,
  nitrite NUMERIC,
  nitrate NUMERIC,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para water_parameters
CREATE INDEX IF NOT EXISTS idx_water_parameters_tank ON water_parameters(tank_id);
CREATE INDEX IF NOT EXISTS idx_water_parameters_date ON water_parameters(date);

-- ============================================
-- TABELA: feeding_records
-- Histórico geral de alimentação
-- ============================================
CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  food TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para feeding_records
CREATE INDEX IF NOT EXISTS idx_feeding_records_tank ON feeding_records(tank_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(date);

-- ============================================
-- TRIGGERS: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON systems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON tanks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_tasks_updated_at BEFORE UPDATE ON checklist_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_parameters_updated_at BEFORE UPDATE ON checklist_parameters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_types_updated_at BEFORE UPDATE ON food_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_checklists_updated_at BEFORE UPDATE ON daily_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_executions_updated_at BEFORE UPDATE ON daily_checklist_task_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parameter_readings_updated_at BEFORE UPDATE ON daily_checklist_parameter_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_water_parameters_updated_at BEFORE UPDATE ON water_parameters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feeding_records_updated_at BEFORE UPDATE ON feeding_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Sistemas padrão
INSERT INTO systems (name) VALUES
  ('Sistema Juvenil'),
  ('Sistema Adulto'),
  ('Sistema Reprodução')
ON CONFLICT DO NOTHING;

-- Tarefas do checklist (baseado no frontend)
INSERT INTO checklist_tasks (name, "order", is_active) VALUES
  ('Limpar filtros', 0, true),
  ('Aplicar medicação', 1, true),
  ('Verificar equipamentos', 2, true)
ON CONFLICT DO NOTHING;

-- Parâmetros de aferição (baseado no frontend)
INSERT INTO checklist_parameters (name, unit, "order", is_active) VALUES
  ('pH', 'pH', 0, true),
  ('Temperatura', '°C', 1, true),
  ('Amônia', 'ppm', 2, true),
  ('Nitrito', 'ppm', 3, true),
  ('Nitrato', 'ppm', 4, true)
ON CONFLICT DO NOTHING;

-- Tipos de alimento (baseado no frontend)
INSERT INTO food_types (name, code, unit, is_active) VALUES
  ('Artêmia Viva', 'artemia-viva', 'ml', true),
  ('Artêmia Congelada', 'artemia-congelada', 'ml', true),
  ('Rotíferos', 'rotiferos', 'ml', true),
  ('Mysidáceos', 'mysidaceos', 'ml', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Todas as tabelas, índices e dados iniciais serão criados
-- ============================================