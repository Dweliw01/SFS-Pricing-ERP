-- ALTERNATIVE: Disable RLS on all tables (Quick Development Solution)
-- Warning: This removes all security. Use only for development/testing!

-- Disable RLS on all tables in public schema
DO $$
DECLARE
    table_record RECORD;
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
        -- Disable RLS on the table
        EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', table_record.tablename);
        
        -- Drop all policies on the table (cleanup)
        FOR policy_record IN 
            SELECT pol.polname 
            FROM pg_policy pol
            JOIN pg_class cls ON pol.polrelid = cls.oid
            WHERE cls.relname = table_record.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.polname, table_record.tablename);
        END LOOP;
        
        RAISE NOTICE 'Disabled RLS and removed policies for table: %', table_record.tablename;
    END LOOP;
END $$;

-- Grant full permissions (since RLS is disabled, be careful!)
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Check status
SELECT 
    c.relname::text as table_name,
    c.relrowsecurity as rls_enabled,
    COUNT(p.polname)::integer as policy_count
FROM pg_class c
LEFT JOIN pg_policy p ON c.oid = p.polrelid
WHERE c.relnamespace = 'public'::regnamespace
AND c.relkind = 'r'
AND c.relname NOT LIKE 'pg_%'
AND c.relname NOT LIKE '_prisma_%'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;