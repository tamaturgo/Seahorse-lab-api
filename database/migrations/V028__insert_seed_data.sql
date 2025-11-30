-- ============================================
-- MIGRATION V028: INSERT SEED DATA
-- ============================================
-- Dados iniciais para o sistema funcionar
-- ============================================

-- Sistemas padrão
INSERT INTO systems (name) VALUES
  ('Sistema Juvenil'),
  ('Sistema Adulto'),
  ('Sistema Reprodução')
ON CONFLICT DO NOTHING;

-- Tarefas do checklist
INSERT INTO checklist_tasks (name, "order", is_active) VALUES
  ('Limpar filtros', 0, true),
  ('Aplicar medicação', 1, true),
  ('Verificar equipamentos', 2, true)
ON CONFLICT DO NOTHING;

-- Tipos de alimento
INSERT INTO food_types (name, code, unit, is_active) VALUES
  ('Artêmia Viva', 'artemia-viva', 'ml', true),
  ('Artêmia Congelada', 'artemia-congelada', 'ml', true),
  ('Rotíferos', 'rotiferos', 'ml', true),
  ('Mysidáceos', 'mysidaceos', 'ml', true)
ON CONFLICT DO NOTHING;

-- Configuração padrão de alimentação
INSERT INTO default_feeding_settings (interval_hours, start_time) 
VALUES (4, '08:00:00')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DA MIGRATION V028
-- ============================================
