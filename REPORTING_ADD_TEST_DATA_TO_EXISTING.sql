-- ============================================================================
-- ADD REPORTING TEST DATA TO EXISTING PRODUCTS
-- Description: Adds vendor costs, customer pricing, and import costs to your
--              existing products, vendors, and customers (no new entities created)
-- ============================================================================

-- This script will:
-- 1. Use your EXISTING products
-- 2. Use your EXISTING vendors
-- 3. Use your EXISTING customers
-- 4. Create vendor costs linking products to vendors
-- 5. Create customer pricing linking products to customers
-- 6. Create import costs for international products

-- ============================================================================
-- STEP 1: ADD VENDOR COSTS FOR ALL EXISTING PRODUCTS
-- ============================================================================

DO $$
DECLARE
    product_record RECORD;
    vendor_record RECORD;
    vendor_count INTEGER;
    vendor_index INTEGER := 0;
    base_cost DECIMAL(10,2);
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADDING VENDOR COSTS TO EXISTING PRODUCTS ===';
    RAISE NOTICE '';

    -- Count vendors
    SELECT COUNT(*) INTO vendor_count FROM vendors WHERE is_active = true;

    IF vendor_count = 0 THEN
        RAISE NOTICE 'ERROR: No active vendors found. Please create vendors first.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found % active vendors', vendor_count;
    RAISE NOTICE '';

    -- Loop through all active products
    FOR product_record IN
        SELECT * FROM products WHERE is_active = true ORDER BY item_number
    LOOP
        -- Get a vendor (cycle through vendors)
        SELECT * INTO vendor_record FROM vendors WHERE is_active = true
        ORDER BY vendor_name LIMIT 1 OFFSET (vendor_index % vendor_count);

        vendor_index := vendor_index + 1;

        -- Calculate base cost based on product weight or use default
        base_cost := COALESCE(product_record.case_weight_lbs * 0.40, 10.00);

        RAISE NOTICE 'Adding costs for product: % (Vendor: %)',
            product_record.item_number, vendor_record.vendor_name;

        -- Insert vendor costs
        INSERT INTO product_vendor_costs (
            product_id,
            vendor_id,
            incoterm,
            shipment_size,
            loading_option,

            -- EXW Costs (Ex Works)
            exw_cost_per_case,
            exw_cost_per_unit,
            exw_cost_per_lb,
            exw_previous_cost_per_case,
            exw_previous_cost_per_lb,

            -- FOB Costs (Free on Board)
            fob_cost_per_case,
            fob_cost_per_unit,
            fob_cost_per_lb,
            fob_previous_cost_per_case,
            fob_previous_cost_per_lb,

            -- Pickup at Plant Costs
            pickup_plant_cost_per_case,
            pickup_plant_cost_per_unit,
            pickup_plant_cost_per_lb,
            pickup_plant_previous_cost_per_case,
            pickup_plant_previous_cost_per_lb,

            -- Pickup at Port US Costs
            pickup_port_us_cost_per_case,
            pickup_port_us_cost_per_unit,
            pickup_port_us_cost_per_lb,
            pickup_port_us_previous_cost_per_case,
            pickup_port_us_previous_cost_per_lb,

            -- DDP Costs (Delivered Duty Paid)
            ddp_cost_per_case,
            ddp_cost_per_unit,
            ddp_cost_per_lb,
            ddp_previous_cost_per_case,
            ddp_previous_cost_per_lb,

            -- Factory Fees
            factory_fee_percent,
            factory_fee_per_case,

            -- Dates
            effective_date,
            expiry_date,
            is_current,
            cost_notes
        )
        VALUES (
            product_record.id,
            vendor_record.id,
            'FOB',
            'FCL',
            'Palletized',

            -- EXW Costs (base cost)
            base_cost,
            CASE WHEN product_record.units_per_case > 0
                THEN ROUND(base_cost / product_record.units_per_case, 4)
                ELSE ROUND(base_cost / 12, 4) END,
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND(base_cost / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost / 25, 4) END,
            ROUND(base_cost * 0.95, 2), -- Previous cost (5% lower)
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 0.95) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost / 26.3, 4) END,

            -- FOB Costs (EXW + 7%)
            ROUND(base_cost * 1.07, 2),
            CASE WHEN product_record.units_per_case > 0
                THEN ROUND((base_cost * 1.07) / product_record.units_per_case, 4)
                ELSE ROUND(base_cost * 1.07 / 12, 4) END,
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.07) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.07 / 25, 4) END,
            ROUND(base_cost * 1.07 * 0.95, 2), -- Previous FOB
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.07 * 0.95) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.07 * 0.95 / 25, 4) END,

            -- Pickup at Plant Costs (EXW + 3%)
            ROUND(base_cost * 1.03, 2),
            CASE WHEN product_record.units_per_case > 0
                THEN ROUND((base_cost * 1.03) / product_record.units_per_case, 4)
                ELSE ROUND(base_cost * 1.03 / 12, 4) END,
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.03) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.03 / 25, 4) END,
            ROUND(base_cost * 1.03 * 0.95, 2),
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.03 * 0.95) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.03 * 0.95 / 25, 4) END,

            -- Pickup at Port US Costs (FOB + port handling)
            ROUND(base_cost * 1.12, 2),
            CASE WHEN product_record.units_per_case > 0
                THEN ROUND((base_cost * 1.12) / product_record.units_per_case, 4)
                ELSE ROUND(base_cost * 1.12 / 12, 4) END,
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.12) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.12 / 25, 4) END,
            ROUND(base_cost * 1.12 * 0.95, 2),
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.12 * 0.95) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.12 * 0.95 / 25, 4) END,

            -- DDP Costs (Delivered Duty Paid - FOB + shipping + duties)
            ROUND(base_cost * 1.30, 2),
            CASE WHEN product_record.units_per_case > 0
                THEN ROUND((base_cost * 1.30) / product_record.units_per_case, 4)
                ELSE ROUND(base_cost * 1.30 / 12, 4) END,
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.30) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.30 / 25, 4) END,
            ROUND(base_cost * 1.30 * 0.95, 2),
            CASE WHEN product_record.case_weight_lbs > 0
                THEN ROUND((base_cost * 1.30 * 0.95) / product_record.case_weight_lbs, 4)
                ELSE ROUND(base_cost * 1.30 * 0.95 / 25, 4) END,

            -- Factory Fees (4%)
            0.04,
            ROUND(base_cost * 0.04, 2),

            -- Dates
            CURRENT_DATE - INTERVAL '30 days',
            CURRENT_DATE + INTERVAL '180 days',
            true,
            'Test data generated for reporting'
        )
        ON CONFLICT (product_id, vendor_id, effective_date) DO NOTHING;

    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Vendor costs added successfully!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: ADD CUSTOMER PRICING FOR ALL EXISTING PRODUCTS
-- ============================================================================

DO $$
DECLARE
    product_record RECORD;
    customer_record RECORD;
    customer_count INTEGER;
    customer_index INTEGER := 0;
    base_cost DECIMAL(10,2);
    fob_cost DECIMAL(10,2);
    sell_price DECIMAL(10,2);
    margin_percent DECIMAL(5,2);
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADDING CUSTOMER PRICING TO EXISTING PRODUCTS ===';
    RAISE NOTICE '';

    -- Count customers
    SELECT COUNT(*) INTO customer_count FROM customers WHERE is_active = true;

    IF customer_count = 0 THEN
        RAISE NOTICE 'ERROR: No active customers found. Please create customers first.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found % active customers', customer_count;
    RAISE NOTICE '';

    -- Loop through all active products
    FOR product_record IN
        SELECT * FROM products WHERE is_active = true ORDER BY item_number
    LOOP
        -- Calculate costs
        base_cost := COALESCE(product_record.case_weight_lbs * 0.40, 10.00);
        fob_cost := ROUND(base_cost * 1.07, 2);

        -- Apply margin (18-22% range for variation)
        margin_percent := 0.18 + (RANDOM() * 0.04); -- Random between 18% and 22%
        sell_price := ROUND(fob_cost * (1 + margin_percent), 2);

        -- Add pricing for 2 customers (cycling through available customers)
        FOR i IN 0..LEAST(1, customer_count - 1) LOOP
            SELECT * INTO customer_record FROM customers WHERE is_active = true
            ORDER BY customer_name LIMIT 1 OFFSET ((customer_index + i) % customer_count);

            RAISE NOTICE 'Adding pricing for product: % (Customer: %)',
                product_record.item_number, customer_record.customer_name;

            INSERT INTO product_customer_pricing (
                product_id,
                customer_id,

                -- EXW Pricing (Pick-up at Plant)
                exw_price_per_case,
                exw_price_per_unit,
                exw_price_per_lb,
                exw_previous_price_per_case,

                -- EXW with Rebate
                exw_rebate_amount,
                exw_rebate_price_per_case,
                exw_rebate_price_per_unit,
                exw_rebate_price_per_lb,

                -- FOB Pricing
                fob_price_per_case,
                fob_price_per_unit,
                fob_price_per_lb,

                -- FOB with Rebate
                fob_rebate_amount,
                fob_rebate_price_per_case,
                fob_rebate_price_per_unit,
                fob_rebate_price_per_lb,

                -- DAP Pricing (Delivered at Place - Port USA)
                dap_cases_per_container,
                dap_vessel_freight_per_case,
                dap_price_per_case,
                dap_price_per_unit,
                dap_price_per_lb,

                -- DDP Pricing (Delivered Duty Paid)
                ddp_inland_freight_per_case,
                ddp_price_per_case,
                ddp_price_per_unit,
                ddp_price_per_lb,

                -- Dates
                effective_date,
                expiry_date,
                is_current,
                pricing_notes
            )
            VALUES (
                product_record.id,
                customer_record.id,

                -- EXW Pricing (base price)
                ROUND(sell_price * 0.93, 2), -- Slightly lower than FOB
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND((sell_price * 0.93) / product_record.units_per_case, 4)
                    ELSE ROUND(sell_price * 0.93 / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND((sell_price * 0.93) / product_record.case_weight_lbs, 4)
                    ELSE ROUND(sell_price * 0.93 / 25, 4) END,
                ROUND(sell_price * 0.93 * 0.95, 2), -- Previous price

                -- EXW with Rebate (2% rebate)
                ROUND(sell_price * 0.93 * 0.02, 2),
                ROUND(sell_price * 0.93 * 0.98, 2),
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND((sell_price * 0.93 * 0.98) / product_record.units_per_case, 4)
                    ELSE ROUND(sell_price * 0.93 * 0.98 / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND((sell_price * 0.93 * 0.98) / product_record.case_weight_lbs, 4)
                    ELSE ROUND(sell_price * 0.93 * 0.98 / 25, 4) END,

                -- FOB Pricing
                sell_price,
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND(sell_price / product_record.units_per_case, 4)
                    ELSE ROUND(sell_price / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND(sell_price / product_record.case_weight_lbs, 4)
                    ELSE ROUND(sell_price / 25, 4) END,

                -- FOB with Rebate (1.5% rebate)
                ROUND(sell_price * 0.015, 2),
                ROUND(sell_price * 0.985, 2),
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND((sell_price * 0.985) / product_record.units_per_case, 4)
                    ELSE ROUND(sell_price * 0.985 / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND((sell_price * 0.985) / product_record.case_weight_lbs, 4)
                    ELSE ROUND(sell_price * 0.985 / 25, 4) END,

                -- DAP Pricing (includes freight)
                COALESCE(product_record.cases_per_40ft, 800),
                1.50, -- Vessel freight per case
                ROUND(sell_price + 1.50, 2),
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND((sell_price + 1.50) / product_record.units_per_case, 4)
                    ELSE ROUND((sell_price + 1.50) / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND((sell_price + 1.50) / product_record.case_weight_lbs, 4)
                    ELSE ROUND((sell_price + 1.50) / 25, 4) END,

                -- DDP Pricing (includes inland freight)
                0.85, -- Inland freight per case
                ROUND(sell_price + 1.50 + 0.85, 2),
                CASE WHEN product_record.units_per_case > 0
                    THEN ROUND((sell_price + 1.50 + 0.85) / product_record.units_per_case, 4)
                    ELSE ROUND((sell_price + 1.50 + 0.85) / 12, 4) END,
                CASE WHEN product_record.case_weight_lbs > 0
                    THEN ROUND((sell_price + 1.50 + 0.85) / product_record.case_weight_lbs, 4)
                    ELSE ROUND((sell_price + 1.50 + 0.85) / 25, 4) END,

                -- Dates
                CURRENT_DATE - INTERVAL '30 days',
                CURRENT_DATE + INTERVAL '180 days',
                true,
                'Test pricing data for reporting'
            )
            ON CONFLICT (product_id, customer_id, effective_date) DO NOTHING;

        END LOOP;

        customer_index := customer_index + 2;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Customer pricing added successfully!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 3: ADD IMPORT COSTS FOR INTERNATIONAL PRODUCTS
-- ============================================================================

DO $$
DECLARE
    product_record RECORD;
    base_cost DECIMAL(10,2);
    fob_cost DECIMAL(10,2);
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADDING IMPORT COSTS FOR INTERNATIONAL PRODUCTS ===';
    RAISE NOTICE '';

    -- Loop through international products only
    FOR product_record IN
        SELECT * FROM products
        WHERE is_active = true
        AND product_type = 'I'
        ORDER BY item_number
    LOOP
        base_cost := COALESCE(product_record.case_weight_lbs * 0.40, 10.00);
        fob_cost := ROUND(base_cost * 1.07, 2);

        RAISE NOTICE 'Adding import costs for product: %', product_record.item_number;

        INSERT INTO import_costs (
            product_id,

            -- Import Broker Fees
            import_broker_fee_percent,
            import_broker_fee_per_case,

            -- Duty/Tariff
            duty_rate_percent,
            duty_per_case,
            previous_tariff_percent,

            -- GSP (Generalized System of Preferences)
            gsp_margin_percent,
            gsp_profit_per_case,

            -- Dates
            effective_date,
            is_current,
            notes
        )
        VALUES (
            product_record.id,

            -- Import Broker (1.5% of FOB)
            0.015,
            ROUND(fob_cost * 0.015, 2),

            -- Duty (6% of FOB)
            0.06,
            ROUND(fob_cost * 0.06, 2),
            0.04, -- Previous tariff was 4%

            -- GSP (12% margin)
            0.12,
            ROUND(fob_cost * 0.12, 2),

            -- Dates
            CURRENT_DATE - INTERVAL '30 days',
            true,
            'Test import cost data for reporting'
        )
        ON CONFLICT DO NOTHING;

    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Import costs added successfully!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION - Check What Was Created
-- ============================================================================

DO $$
DECLARE
    product_count INTEGER;
    vendor_count INTEGER;
    customer_count INTEGER;
    cost_count INTEGER;
    pricing_count INTEGER;
    import_count INTEGER;
    report_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION SUMMARY ===';
    RAISE NOTICE '';

    SELECT COUNT(*) INTO product_count FROM products WHERE is_active = true;
    SELECT COUNT(*) INTO vendor_count FROM vendors WHERE is_active = true;
    SELECT COUNT(*) INTO customer_count FROM customers WHERE is_active = true;
    SELECT COUNT(*) INTO cost_count FROM product_vendor_costs WHERE is_current = true;
    SELECT COUNT(*) INTO pricing_count FROM product_customer_pricing WHERE is_current = true;
    SELECT COUNT(*) INTO import_count FROM import_costs WHERE is_current = true;
    SELECT COUNT(*) INTO report_count FROM v_master_price_report;

    RAISE NOTICE 'Active Products:           %', product_count;
    RAISE NOTICE 'Active Vendors:            %', vendor_count;
    RAISE NOTICE 'Active Customers:          %', customer_count;
    RAISE NOTICE 'Vendor Cost Records:       %', cost_count;
    RAISE NOTICE 'Customer Pricing Records:  %', pricing_count;
    RAISE NOTICE 'Import Cost Records:       %', import_count;
    RAISE NOTICE 'Report View Rows:          %', report_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Expected Report Rows: ~%', product_count * LEAST(customer_count, 2);
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 5: SAMPLE REPORT DATA
-- ============================================================================

-- Show sample data from the report view
SELECT
    item_number,
    brand,
    product_type,
    status,
    vendor_name,
    customer_name,
    fob_cost_per_case,
    fob_price_per_case,
    fob_margin_amount,
    fob_margin_percent,
    landed_cost_per_case,
    profit_per_40ft_fob
FROM v_master_price_report
ORDER BY item_number, customer_name
LIMIT 20;

-- ============================================================================
-- CLEANUP SCRIPT (Run this when you want to remove test data)
-- ============================================================================

/*
-- IMPORTANT: This will remove ALL vendor costs, customer pricing, and import costs
-- Only run this if you want to start over

-- Remove customer pricing
DELETE FROM product_customer_pricing WHERE pricing_notes LIKE '%Test%' OR pricing_notes LIKE '%test%';

-- Remove vendor costs
DELETE FROM product_vendor_costs WHERE cost_notes LIKE '%Test%' OR cost_notes LIKE '%test%';

-- Remove import costs
DELETE FROM import_costs WHERE notes LIKE '%Test%' OR notes LIKE '%test%';

-- Verify cleanup
SELECT
    'Vendor Costs' as table_name,
    COUNT(*) as remaining_records
FROM product_vendor_costs
UNION ALL
SELECT
    'Customer Pricing',
    COUNT(*)
FROM product_customer_pricing
UNION ALL
SELECT
    'Import Costs',
    COUNT(*)
FROM import_costs;
*/

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Your existing products now have:
-- ✅ Vendor costs (all 5 tiers)
-- ✅ Customer pricing (all 8 variants)
-- ✅ Import costs (for international products)
-- ✅ Ready to generate reports!
--
-- Next Steps:
-- 1. Go to http://localhost:3000/reports
-- 2. Click "Generate Master Price Report"
-- 3. Preview or export to Excel/CSV
-- ============================================================================
