-- Query to check all your tables and their current RLS status
-- Run this BEFORE migration to see what tables you have

-- List all tables with their current RLS status
SELECT 
    schemaname,
    tablename,
    tableowner,
    CASE 
        WHEN c.relrowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status,
    COUNT(p.polname) as policy_count
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%'
AND tablename NOT LIKE 'schema_%'
AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
GROUP BY schemaname, tablename, tableowner, c.relrowsecurity
ORDER BY tablename;

-- Count records in each table
DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Table Record Counts:';
    RAISE NOTICE '-------------------';
    
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
        ORDER BY tablename
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tablename) INTO row_count;
        RAISE NOTICE '% : % records', RPAD(table_record.tablename, 30), row_count;
    END LOOP;
END $$;