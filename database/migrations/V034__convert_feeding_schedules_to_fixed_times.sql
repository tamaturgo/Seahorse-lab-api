-- ============================================
-- MIGRATION V034: CONVERT FEEDING SCHEDULES TO FIXED TIMES
-- ============================================
-- Converte o sistema de intervalos (interval_hours + start_time)
-- para horários fixos (feeding_times array)
-- ============================================

-- 1. Adicionar nova coluna feeding_times
ALTER TABLE feeding_schedules
ADD COLUMN feeding_times TEXT[] DEFAULT ARRAY['08:00', '12:00', '16:00', '20:00'];

-- 2. Migrar dados existentes: calcular horários fixos baseados nos intervalos
-- Para cada registro, gerar array de horários baseado no intervalo
UPDATE feeding_schedules
SET feeding_times = (
  SELECT ARRAY_AGG(
    TO_CHAR((start_time::TIME + (seq * INTERVAL '1 hour' * interval_hours)), 'HH24:MI')
  )
  FROM generate_series(
    0, 
    GREATEST(0, (24 / NULLIF(interval_hours, 0)) - 1)
  ) AS seq
  WHERE (start_time::TIME + (seq * INTERVAL '1 hour' * interval_hours)) < '24:00:00'::TIME
)
WHERE interval_hours > 0;

-- 3. Para registros sem intervalo válido, usar padrão
UPDATE feeding_schedules
SET feeding_times = ARRAY['08:00', '12:00', '16:00', '20:00']
WHERE feeding_times IS NULL OR array_length(feeding_times, 1) IS NULL;

-- 4. Tornar feeding_times obrigatório
ALTER TABLE feeding_schedules
ALTER COLUMN feeding_times SET NOT NULL;

-- 5. Remover colunas antigas
ALTER TABLE feeding_schedules
DROP COLUMN interval_hours,
DROP COLUMN start_time;

-- 6. Fazer o mesmo para default_feeding_settings
ALTER TABLE default_feeding_settings
ADD COLUMN feeding_times TEXT[] DEFAULT ARRAY['08:00', '12:00', '16:00', '20:00'];

UPDATE default_feeding_settings
SET feeding_times = (
  SELECT ARRAY_AGG(
    TO_CHAR((start_time::TIME + (seq * INTERVAL '1 hour' * interval_hours)), 'HH24:MI')
  )
  FROM generate_series(
    0, 
    GREATEST(0, (24 / NULLIF(interval_hours, 0)) - 1)
  ) AS seq
  WHERE (start_time::TIME + (seq * INTERVAL '1 hour' * interval_hours)) < '24:00:00'::TIME
)
WHERE interval_hours > 0;

UPDATE default_feeding_settings
SET feeding_times = ARRAY['08:00', '12:00', '16:00', '20:00']
WHERE feeding_times IS NULL OR array_length(feeding_times, 1) IS NULL;

ALTER TABLE default_feeding_settings
ALTER COLUMN feeding_times SET NOT NULL;

ALTER TABLE default_feeding_settings
DROP COLUMN interval_hours,
DROP COLUMN start_time;

-- ============================================
-- FIM DA MIGRATION V034
-- ============================================
