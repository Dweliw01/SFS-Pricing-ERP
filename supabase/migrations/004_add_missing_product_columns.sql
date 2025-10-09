-- Add missing columns to products table
-- This migration adds all the columns that the application expects

ALTER TABLE products
ADD COLUMN IF NOT EXISTS case_length_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS case_width_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS case_height_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS case_cube_ft DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS case_weight_lbs DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS ti INTEGER,
ADD COLUMN IF NOT EXISTS hi INTEGER,
ADD COLUMN IF NOT EXISTS cases_per_pallet INTEGER,
ADD COLUMN IF NOT EXISTS pallet_weight_lbs DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_length_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_width_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_height_in DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_weight_oz DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS pallets_per_20ft INTEGER,
ADD COLUMN IF NOT EXISTS cases_per_20ft INTEGER,
ADD COLUMN IF NOT EXISTS pallets_per_40ft INTEGER,
ADD COLUMN IF NOT EXISTS cases_per_40ft INTEGER,
ADD COLUMN IF NOT EXISTS pallets_per_40hc INTEGER,
ADD COLUMN IF NOT EXISTS cases_per_40hc INTEGER,
ADD COLUMN IF NOT EXISTS stackable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS moq INTEGER,
ADD COLUMN IF NOT EXISTS units_per_case DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS pack_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS product_of_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS hs_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS review_status VARCHAR(200),
ADD COLUMN IF NOT EXISTS needs_update BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_needs_update ON products(needs_update);
CREATE INDEX IF NOT EXISTS idx_products_product_of_country ON products(product_of_country);
