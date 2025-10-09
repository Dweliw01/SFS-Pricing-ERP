-- Migration: Enable RLS and create policies for ALL tables
-- Description: Sets up Row Level Security policies to allow public read access to all tables
-- Warning: This gives public read access to ALL data. Adjust policies as needed for production.

-- Create a function to enable RLS and create policies for all tables
DO $$
DECLARE
    table_record RECORD;
    policy_name TEXT;
BEGIN
    -- Loop through all tables in the public schema
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
        AND tablename NOT LIKE 'schema_%'
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    LOOP
        -- Enable RLS on the table
        EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        
        -- Drop existing policies to avoid conflicts
        -- Read policy
        policy_name := 'Allow public read access on ' || table_record.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_record.tablename);
        
        -- Insert policy
        policy_name := 'Allow authenticated insert on ' || table_record.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_record.tablename);
        
        -- Update policy
        policy_name := 'Allow authenticated update on ' || table_record.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_record.tablename);
        
        -- Delete policy
        policy_name := 'Allow authenticated delete on ' || table_record.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_record.tablename);
        
        -- Create new policies
        -- Policy 1: Allow anyone to read (including anonymous users)
        policy_name := 'Allow public read access on ' || table_record.tablename;
        EXECUTE format('
            CREATE POLICY %I 
            ON %I 
            FOR SELECT 
            TO public 
            USING (true)',
            policy_name,
            table_record.tablename
        );
        
        -- Policy 2: Allow authenticated users to insert
        policy_name := 'Allow authenticated insert on ' || table_record.tablename;
        EXECUTE format('
            CREATE POLICY %I 
            ON %I 
            FOR INSERT 
            TO authenticated 
            WITH CHECK (true)',
            policy_name,
            table_record.tablename
        );
        
        -- Policy 3: Allow authenticated users to update
        policy_name := 'Allow authenticated update on ' || table_record.tablename;
        EXECUTE format('
            CREATE POLICY %I 
            ON %I 
            FOR UPDATE 
            TO authenticated 
            USING (true)
            WITH CHECK (true)',
            policy_name,
            table_record.tablename
        );
        
        -- Policy 4: Allow authenticated users to delete
        policy_name := 'Allow authenticated delete on ' || table_record.tablename;
        EXECUTE format('
            CREATE POLICY %I 
            ON %I 
            FOR DELETE 
            TO authenticated 
            USING (true)',
            policy_name,
            table_record.tablename
        );
        
        RAISE NOTICE 'Enabled RLS and created policies for table: %', table_record.tablename;
    END LOOP;
END $$;

-- Grant necessary permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create or replace function to check RLS status for all tables
CREATE OR REPLACE FUNCTION check_all_tables_rls_status()
RETURNS TABLE(
    table_name text,
    rls_enabled boolean,
    policy_count integer,
    policies text[]
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.relname::text as table_name,
        c.relrowsecurity as rls_enabled,
        COUNT(p.polname)::integer as policy_count,
        ARRAY_AGG(
            p.polname || ' (' || 
            CASE p.polcmd
                WHEN 'r' THEN 'SELECT'
                WHEN 'a' THEN 'INSERT'
                WHEN 'w' THEN 'UPDATE'
                WHEN 'd' THEN 'DELETE'
                ELSE 'ALL'
            END || ')'
            ORDER BY p.polcmd
        ) as policies
    FROM pg_class c
    LEFT JOIN pg_policy p ON c.oid = p.polrelid
    WHERE c.relnamespace = 'public'::regnamespace
    AND c.relkind = 'r'
    AND c.relname NOT LIKE 'pg_%'
    AND c.relname NOT LIKE '_prisma_%'
    AND c.relname NOT LIKE 'schema_%'
    AND c.relname NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    GROUP BY c.relname, c.relrowsecurity
    ORDER BY c.relname;
$$;

-- Display the RLS status for all tables
SELECT * FROM check_all_tables_rls_status();

-- Create a summary view
CREATE OR REPLACE VIEW rls_summary AS
SELECT 
    COUNT(*) FILTER (WHERE rls_enabled = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE rls_enabled = false OR rls_enabled IS NULL) as tables_without_rls,
    COUNT(*) as total_tables
FROM check_all_tables_rls_status();

-- Show summary
SELECT * FROM rls_summary;