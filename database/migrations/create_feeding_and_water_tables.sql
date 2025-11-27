-- Tabela de registros de alimentação
CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  food VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feeding_records_tank_id ON feeding_records(tank_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_records_user_id ON feeding_records(user_id);

-- Tabela de parâmetros da água
CREATE TABLE IF NOT EXISTS water_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id UUID REFERENCES tanks(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  ph DECIMAL(4, 2) NOT NULL CHECK (ph >= 0 AND ph <= 14),
  temperature DECIMAL(5, 2) NOT NULL,
  ammonia DECIMAL(10, 4) NOT NULL,
  nitrite DECIMAL(10, 4) NOT NULL,
  nitrate DECIMAL(10, 4) NOT NULL,
  salinity DECIMAL(5, 2),
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_water_parameters_system_id ON water_parameters(system_id);
CREATE INDEX IF NOT EXISTS idx_water_parameters_tank_id ON water_parameters(tank_id);
CREATE INDEX IF NOT EXISTS idx_water_parameters_measured_at ON water_parameters(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_parameters_user_id ON water_parameters(user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feeding_records_updated_at BEFORE UPDATE ON feeding_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_parameters_updated_at BEFORE UPDATE ON water_parameters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_parameters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para feeding_records
CREATE POLICY "Usuários podem visualizar todos os registros de alimentação"
  ON feeding_records FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar registros de alimentação"
  ON feeding_records FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Políticas RLS para water_parameters
CREATE POLICY "Usuários podem visualizar todos os parâmetros"
  ON water_parameters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar registros de parâmetros"
  ON water_parameters FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
