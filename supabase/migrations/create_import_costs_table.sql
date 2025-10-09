-- Create import_costs table
-- Product-focused import cost tracking with both percentage and per-case values
CREATE TABLE IF NOT EXISTS import_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Import broker fees (can track both percentage and per-case amounts)
  import_broker_fee_percent NUMERIC,  -- As percentage
  import_broker_fee_per_case NUMERIC,  -- As dollar amount per case

  -- Duty rates (can track both percentage and per-case amounts)
  duty_rate_percent NUMERIC,  -- As percentage
  duty_per_case NUMERIC,  -- As dollar amount per case

  -- Previous tariff for comparison
  previous_tariff_percent NUMERIC,  -- As percentage

  -- GSP (Generalized System of Preferences) calculations
  gsp_margin_percent NUMERIC,  -- Profit margin as percentage
  gsp_profit_per_case NUMERIC,  -- Profit per case in dollars

  -- Dates and metadata
  effective_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_import_costs_product_id ON import_costs(product_id);
CREATE INDEX IF NOT EXISTS idx_import_costs_is_current ON import_costs(is_current);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_import_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_import_costs_updated_at_trigger
  BEFORE UPDATE ON import_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_costs_updated_at();

-- Add Row Level Security (RLS)
ALTER TABLE import_costs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all import costs
CREATE POLICY "Allow authenticated users to read import costs"
  ON import_costs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert import costs
CREATE POLICY "Allow authenticated users to insert import costs"
  ON import_costs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update import costs
CREATE POLICY "Allow authenticated users to update import costs"
  ON import_costs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete import costs
CREATE POLICY "Allow authenticated users to delete import costs"
  ON import_costs
  FOR DELETE
  TO authenticated
  USING (true);
