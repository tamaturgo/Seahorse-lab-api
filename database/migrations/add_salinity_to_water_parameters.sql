-- Migration: Adicionar coluna salinity na tabela water_parameters
-- Execute este script no SQL Editor do Supabase

ALTER TABLE water_parameters
ADD COLUMN IF NOT EXISTS salinity NUMERIC;

-- Comentário para documentação
COMMENT ON COLUMN water_parameters.salinity IS 'Salinidade em ppt (parts per thousand)';
