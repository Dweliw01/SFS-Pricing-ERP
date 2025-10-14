-- ============================================================================
-- VERIFY REPORTING SETUP
-- Run this script to verify all reporting components are properly configured
-- ============================================================================

-- ============================================================================
-- COMPREHENSIVE VERIFICATION
-- ============================================================================

DO $$
DECLARE
    products_count INTEGER;
    vendors_count INTEGER;
    customers_count INTEGER;
    vendor_costs_count INTEGER;
    customer_pricing_count INTEGER;
    import_costs_count INTEGER;
    report_rows_count INTEGER;
    template_count INTEGER;
    expected_pricing INTEGER;
    missing_count INTEGER;
    table_exists BOOLEAN;
    view_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REPORTING SETUP VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- ========================================================================
    -- PART 1: Check Database Objects
    -- ========================================================================
    RAISE NOTICE '1. CHECKING DATABASE OBJECTS';
    RAISE NOTICE '----------------------------';

    -- Check report_templates table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'report_templates'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ Table report_templates EXISTS';
    ELSE
        RAISE NOTICE '❌ Table report_templates MISSING';
        RAISE NOTICE '   → Run: supabase/migrations/005_create_report_tables.sql';
    END IF;

    -- Check v_master_price_report view
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'v_master_price_report'
    ) INTO view_exists;

    IF view_exists THEN
        RAISE NOTICE '✅ View v_master_price_report EXISTS';
    ELSE
        RAISE NOTICE '❌ View v_master_price_report MISSING';
        RAISE NOTICE '   → Run: supabase/migrations/005_create_report_tables.sql';
    END IF;

    -- Count report templates
    IF table_exists THEN
        SELECT COUNT(*) INTO template_count FROM report_templates;
        RAISE NOTICE '📋 Report Templates: %', template_count;

        IF template_count >= 4 THEN
            RAISE NOTICE '✅ Default templates loaded';
        ELSE
            RAISE NOTICE '⚠️  Expected 4 templates, found %', template_count;
        END IF;
    END IF;

    RAISE NOTICE '';

    -- ========================================================================
    -- PART 2: Check Data Availability
    -- ========================================================================
    RAISE NOTICE '2. DATABASE SUMMARY';
    RAISE NOTICE '-------------------';

    SELECT COUNT(*) INTO products_count FROM products WHERE is_active = true;
    RAISE NOTICE '📦 Active Products: %', products_count;

    SELECT COUNT(*) INTO vendors_count FROM vendors WHERE is_active = true;
    RAISE NOTICE '🏭 Active Vendors: %', vendors_count;

    SELECT COUNT(*) INTO customers_count FROM customers WHERE is_active = true;
    RAISE NOTICE '👥 Active Customers: %', customers_count;

    SELECT COUNT(*) INTO vendor_costs_count FROM product_vendor_costs WHERE is_current = true;
    RAISE NOTICE '💵 Vendor Costs: %', vendor_costs_count;

    SELECT COUNT(*) INTO customer_pricing_count FROM product_customer_pricing WHERE is_current = true;
    RAISE NOTICE '💰 Customer Pricing: %', customer_pricing_count;

    SELECT COUNT(*) INTO import_costs_count FROM import_costs WHERE is_current = true;
    RAISE NOTICE '🚢 Import Costs: %', import_costs_count;

    IF view_exists THEN
        SELECT COUNT(*) INTO report_rows_count FROM v_master_price_report;
        RAISE NOTICE '📊 Report Rows: %', report_rows_count;
    ELSE
        report_rows_count := 0;
        RAISE NOTICE '📊 Report Rows: N/A (view missing)';
    END IF;

    RAISE NOTICE '';

    -- ========================================================================
    -- PART 3: Check for Missing Customer Pricing
    -- ========================================================================
    RAISE NOTICE '3. CUSTOMER PRICING COMPLETENESS';
    RAISE NOTICE '---------------------------------';

    expected_pricing := products_count * customers_count;

    WITH expected_combinations AS (
        SELECT
            p.id as product_id,
            c.id as customer_id
        FROM products p
        CROSS JOIN customers c
        WHERE p.is_active = true AND c.is_active = true
    ),
    existing_pricing AS (
        SELECT product_id, customer_id
        FROM product_customer_pricing
        WHERE is_current = true
    )
    SELECT COUNT(*) INTO missing_count
    FROM expected_combinations ec
    LEFT JOIN existing_pricing ep
        ON ec.product_id = ep.product_id
        AND ec.customer_id = ep.customer_id
    WHERE ep.product_id IS NULL;

    RAISE NOTICE 'Expected: % (% products × % customers)', expected_pricing, products_count, customers_count;
    RAISE NOTICE 'Found:    %', customer_pricing_count;
    RAISE NOTICE 'Missing:  %', missing_count;

    IF missing_count = 0 THEN
        RAISE NOTICE '✅ All product-customer combinations have pricing';
    ELSE
        RAISE NOTICE '⚠️  Missing % product-customer pricing combinations', missing_count;
        RAISE NOTICE '   → Run: ADD_MISSING_CUSTOMER_PRICING.sql';
    END IF;

    RAISE NOTICE '';

    -- ========================================================================
    -- PART 4: Overall Status
    -- ========================================================================
    RAISE NOTICE '========================================';
    RAISE NOTICE 'STATUS & NEXT STEPS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    IF NOT table_exists OR NOT view_exists THEN
        RAISE NOTICE '❌ STATUS: DATABASE NOT READY';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Next Steps:';
        RAISE NOTICE '   1. Run: supabase/migrations/005_create_report_tables.sql';
        RAISE NOTICE '   2. Run: ADD_MISSING_CUSTOMER_PRICING.sql';
        RAISE NOTICE '   3. Re-run this verification script';

    ELSIF products_count = 0 THEN
        RAISE NOTICE '❌ STATUS: NO PRODUCTS';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Next Steps:';
        RAISE NOTICE '   1. Add products to your database';
        RAISE NOTICE '   2. Run: ADD_MISSING_CUSTOMER_PRICING.sql';

    ELSIF missing_count > 0 THEN
        RAISE NOTICE '⚠️  STATUS: INCOMPLETE DATA';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Next Steps:';
        RAISE NOTICE '   1. Run: ADD_MISSING_CUSTOMER_PRICING.sql';
        RAISE NOTICE '   2. Re-run this verification script';
        RAISE NOTICE '   3. Start dev server: npm run dev';

    ELSIF report_rows_count > 0 THEN
        RAISE NOTICE '✅ STATUS: READY TO USE!';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Next Steps:';
        RAISE NOTICE '   1. Start dev server: npm run dev';
        RAISE NOTICE '   2. Navigate to: http://localhost:3000/reports';
        RAISE NOTICE '   3. Generate your first Master Price Report!';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 You have % rows of report data ready to export!', report_rows_count;

    ELSE
        RAISE NOTICE '⚠️  STATUS: READY BUT NO DATA';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Next Steps:';
        RAISE NOTICE '   1. Verify your products have vendor costs';
        RAISE NOTICE '   2. Run: ADD_MISSING_CUSTOMER_PRICING.sql';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- SAMPLE DATA PREVIEW
-- ============================================================================

-- Show sample report data (if view exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_master_price_report') THEN
        RAISE NOTICE '=== SAMPLE REPORT DATA (First 5 Rows) ===';
        RAISE NOTICE '';
    END IF;
END $$;

SELECT
    item_number,
    brand,
    vendor_name,
    customer_name,
    fob_cost_per_case,
    fob_price_per_case,
    ROUND(fob_margin_percent, 2) as margin_pct
FROM v_master_price_report
ORDER BY item_number, customer_name
LIMIT 5;

-- Show available report templates (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_templates') THEN
        RAISE NOTICE '';
        RAISE NOTICE '=== AVAILABLE REPORT TEMPLATES ===';
        RAISE NOTICE '';
    END IF;
END $$;

SELECT
    name,
    description,
    CASE WHEN is_default THEN '⭐ Default' ELSE '' END as status
FROM report_templates
ORDER BY is_default DESC, name;

-- Show missing combinations (if any)
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    WITH expected_combinations AS (
        SELECT p.id as product_id, c.id as customer_id
        FROM products p
        CROSS JOIN customers c
        WHERE p.is_active = true AND c.is_active = true
    ),
    existing_pricing AS (
        SELECT product_id, customer_id
        FROM product_customer_pricing
        WHERE is_current = true
    )
    SELECT COUNT(*) INTO missing_count
    FROM expected_combinations ec
    LEFT JOIN existing_pricing ep
        ON ec.product_id = ep.product_id
        AND ec.customer_id = ep.customer_id
    WHERE ep.product_id IS NULL;

    IF missing_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '=== MISSING PRODUCT-CUSTOMER COMBINATIONS (First 10) ===';
        RAISE NOTICE '';
    END IF;
END $$;

WITH expected_combinations AS (
    SELECT
        p.id as product_id,
        p.item_number,
        c.id as customer_id,
        c.customer_name
    FROM products p
    CROSS JOIN customers c
    WHERE p.is_active = true AND c.is_active = true
),
existing_pricing AS (
    SELECT product_id, customer_id
    FROM product_customer_pricing
    WHERE is_current = true
)
SELECT
    ec.item_number,
    ec.customer_name
FROM expected_combinations ec
LEFT JOIN existing_pricing ep
    ON ec.product_id = ep.product_id
    AND ec.customer_id = ep.customer_id
WHERE ep.product_id IS NULL
ORDER BY ec.item_number, ec.customer_name
LIMIT 10;
