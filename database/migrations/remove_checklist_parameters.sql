-- Migration: Remove checklist_parameters feature
-- Descrição: Remove a tabela de parâmetros do checklist e suas referências

-- 1. Remove tabela de leituras de parâmetros do checklist diário
DROP TABLE IF EXISTS daily_checklist_parameter_readings CASCADE;

-- 2. Remove tabela de parâmetros configuráveis do checklist
DROP TABLE IF EXISTS checklist_parameters CASCADE;

-- Observação: A tabela water_parameters permanece, pois é usada para 
-- armazenar as leituras de parâmetros da água dos sistemas (pH, temperatura, etc.)
-- e não é relacionada à configuração do checklist.
