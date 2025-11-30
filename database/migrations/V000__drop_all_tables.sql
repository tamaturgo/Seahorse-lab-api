-- ============================================
-- MIGRATION V000: DROP ALL TABLES
-- ============================================
-- Esta migration limpa completamente o banco de dados
-- Use apenas para reset completo do ambiente
-- ============================================

-- Desabilitar verificações de foreign key temporariamente
SET session_replication_role = 'replica';

-- Drop todas as policies RLS primeiro
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_systems_updated_at ON systems;
DROP TRIGGER IF EXISTS update_tanks_updated_at ON tanks;
DROP TRIGGER IF EXISTS update_checklist_tasks_updated_at ON checklist_tasks;
DROP TRIGGER IF EXISTS update_food_types_updated_at ON food_types;
DROP TRIGGER IF EXISTS update_daily_checklists_updated_at ON daily_checklists;
DROP TRIGGER IF EXISTS update_task_executions_updated_at ON daily_checklist_task_executions;
DROP TRIGGER IF EXISTS update_water_parameters_updated_at ON water_parameters;
DROP TRIGGER IF EXISTS update_feeding_records_updated_at ON feeding_records;
DROP TRIGGER IF EXISTS update_feeding_schedules_updated_at ON feeding_schedules;
DROP TRIGGER IF EXISTS update_default_feeding_settings_updated_at ON default_feeding_settings;
DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON audit_logs;

-- Drop function de update_updated_at
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop function auxiliar is_admin
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Drop todas as tabelas na ordem correta (respeitando dependências)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS feeding_schedules CASCADE;
DROP TABLE IF EXISTS default_feeding_settings CASCADE;
DROP TABLE IF EXISTS feeding_records CASCADE;
DROP TABLE IF EXISTS water_parameters CASCADE;
DROP TABLE IF EXISTS daily_checklist_task_executions CASCADE;
DROP TABLE IF EXISTS daily_checklists CASCADE;
DROP TABLE IF EXISTS daily_checklist_feeding_records CASCADE;
DROP TABLE IF EXISTS daily_checklist_parameter_readings CASCADE;
DROP TABLE IF EXISTS checklist_parameters CASCADE;
DROP TABLE IF EXISTS checklist_tasks CASCADE;
DROP TABLE IF EXISTS food_types CASCADE;
DROP TABLE IF EXISTS tanks CASCADE;
DROP TABLE IF EXISTS systems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Reabilitar verificações de foreign key
SET session_replication_role = 'origin';

-- ============================================
-- FIM DA MIGRATION V000
-- ============================================
