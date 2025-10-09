-- Migration: Enable RLS and create policies for products tables
-- Description: Sets up Row Level Security policies to allow public read access to product data

-- Enable RLS on all product-related tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated update" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete" ON products;

-- Create policies for the products table
-- Policy 1: Allow anyone to read products (including anonymous users)
CREATE POLICY "Allow public read access" 
ON products 
FOR SELECT 
TO public 
USING (true);

-- Policy 2: Allow authenticated users to insert new products
CREATE POLICY "Allow authenticated insert" 
ON products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 3: Allow authenticated users to update products
CREATE POLICY "Allow authenticated update" 
ON products 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete products
CREATE POLICY "Allow authenticated delete" 
ON products 
FOR DELETE 
TO authenticated 
USING (true);

-- If 'product' table exists and is different from 'products'
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product') THEN
        DROP POLICY IF EXISTS "Allow public read access" ON product;
        CREATE POLICY "Allow public read access" 
        ON product 
        FOR SELECT 
        TO public 
        USING (true);
    END IF;
END $$;

-- If 'items' table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'items') THEN
        DROP POLICY IF EXISTS "Allow public read access" ON items;
        CREATE POLICY "Allow public read access" 
        ON items 
        FOR SELECT 
        TO public 
        USING (true);
    END IF;
END $$;

-- If 'inventory' table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
        DROP POLICY IF EXISTS "Allow public read access" ON inventory;
        CREATE POLICY "Allow public read access" 
        ON inventory 
        FOR SELECT 
        TO public 
        USING (true);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- For authenticated users (if you have authentication set up)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create a function to check if RLS is working
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(
    table_name text,
    rls_enabled boolean,
    policy_count integer
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.relname::text as table_name,
        c.relrowsecurity as rls_enabled,
        COUNT(p.polname)::integer as policy_count
    FROM pg_class c
    LEFT JOIN pg_policy p ON c.oid = p.polrelid
    WHERE c.relnamespace = 'public'::regnamespace
    AND c.relkind = 'r'
    AND c.relname IN ('products', 'product', 'items', 'inventory')
    GROUP BY c.relname, c.relrowsecurity
    ORDER BY c.relname;
$$;

-- Output the RLS status
SELECT * FROM check_rls_status();