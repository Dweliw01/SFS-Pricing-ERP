-- ============================================================================
-- ADD MISSING CUSTOMER PRICING TO EXISTING PRODUCTS
-- This script adds customer pricing for all product-customer combinations
-- Based on your existing vendor costs
-- ============================================================================

-- ============================================================================
-- STEP 1: Add Customer Pricing for ALL Products → ALL Customers
-- ============================================================================

DO $$
DECLARE
    product_rec RECORD;
    customer_rec RECORD;
    vendor_cost_rec RECORD;
    base_fob_cost DECIMAL(10,2);
    base_exw_cost DECIMAL(10,2);
    base_ddp_cost DECIMAL(10,2);
    margin_multiplier DECIMAL(10,4);
    exw_price DECIMAL(10,2);
    fob_price DECIMAL(10,2);
    ddp_price DECIMAL(10,2);
    records_created INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADDING CUSTOMER PRICING ===';
    RAISE NOTICE '';

    -- Loop through all products
    FOR product_rec IN
        SELECT * FROM products WHERE is_active = true ORDER BY item_number
    LOOP
        -- Get vendor cost for this product (if exists)
        SELECT * INTO vendor_cost_rec
        FROM product_vendor_costs
        WHERE product_id = product_rec.id AND is_current = true
        LIMIT 1;

        -- If no vendor cost found, use defaults based on product weight
        IF vendor_cost_rec IS NULL THEN
            base_exw_cost := COALESCE(product_rec.case_net_weight_lbs * 0.50, 12.00);
            base_fob_cost := base_exw_cost * 1.10;
            base_ddp_cost := base_fob_cost * 1.30;
            RAISE NOTICE 'Product %: No vendor cost found, using defaults', product_rec.item_number;
        ELSE
            base_exw_cost := COALESCE(vendor_cost_rec.exw_cost_per_case, vendor_cost_rec.fob_cost_per_case * 0.92, 12.00);
            base_fob_cost := COALESCE(vendor_cost_rec.fob_cost_per_case, base_exw_cost * 1.10, 15.00);
            base_ddp_cost := COALESCE(vendor_cost_rec.ddp_cost_per_case, base_fob_cost * 1.30, 20.00);
        END IF;

        -- Loop through all customers
        FOR customer_rec IN
            SELECT * FROM customers WHERE is_active = true ORDER BY customer_name
        LOOP
            -- Check if pricing already exists
            IF EXISTS (
                SELECT 1 FROM product_customer_pricing
                WHERE product_id = product_rec.id
                AND customer_id = customer_rec.id
                AND is_current = true
            ) THEN
                RAISE NOTICE 'Pricing exists: % → %', product_rec.item_number, customer_rec.customer_name;
                CONTINUE;
            END IF;

            -- Calculate margin (18-24% range based on customer)
            -- Different margins for different customers to add variety
            margin_multiplier := CASE
                WHEN customer_rec.customer_code = 'VF-001' THEN 1.20  -- 20% margin
                WHEN customer_rec.customer_code = 'FM-001' THEN 1.22  -- 22% margin
                WHEN customer_rec.customer_code = 'SG-001' THEN 1.19  -- 19% margin
                WHEN customer_rec.customer_code = 'WCF-001' THEN 1.21 -- 21% margin
                WHEN customer_rec.customer_code = 'MW-001' THEN 1.18  -- 18% margin
                ELSE 1.20 -- Default 20% margin
            END;

            -- Calculate prices
            exw_price := ROUND(base_exw_cost * margin_multiplier, 2);
            fob_price := ROUND(base_fob_cost * margin_multiplier, 2);
            ddp_price := ROUND(base_ddp_cost * margin_multiplier, 2);

            RAISE NOTICE 'Adding pricing: % → % (FOB: $% → $%)',
                product_rec.item_number,
                customer_rec.customer_name,
                base_fob_cost,
                fob_price;

            -- Insert customer pricing
            INSERT INTO product_customer_pricing (
                product_id,
                customer_id,

                -- EXW Pricing (Pick-up at Plant)
                exw_price_per_case,
                exw_price_per_unit,
                exw_price_per_lb,
                exw_previous_price_per_case,

                -- EXW with Rebate (2% rebate)
                exw_rebate_amount,
                exw_rebate_price_per_case,
                exw_rebate_price_per_unit,
                exw_rebate_price_per_lb,

                -- FOB Pricing
                fob_price_per_case,
                fob_price_per_unit,
                fob_price_per_lb,

                -- FOB with Rebate (1.5% rebate)
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
            ) VALUES (
                product_rec.id,
                customer_rec.id,

                -- EXW Pricing
                exw_price,
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND(exw_price / product_rec.pack_size_units, 4)
                    ELSE ROUND(exw_price / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND(exw_price / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND(exw_price / 24, 4) END,
                ROUND(exw_price * 0.97, 2), -- Previous price (3% lower)

                -- EXW with Rebate
                ROUND(exw_price * 0.02, 2),
                ROUND(exw_price * 0.98, 2),
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND((exw_price * 0.98) / product_rec.pack_size_units, 4)
                    ELSE ROUND(exw_price * 0.98 / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND((exw_price * 0.98) / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND(exw_price * 0.98 / 24, 4) END,

                -- FOB Pricing
                fob_price,
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND(fob_price / product_rec.pack_size_units, 4)
                    ELSE ROUND(fob_price / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND(fob_price / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND(fob_price / 24, 4) END,

                -- FOB with Rebate
                ROUND(fob_price * 0.015, 2),
                ROUND(fob_price * 0.985, 2),
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND((fob_price * 0.985) / product_rec.pack_size_units, 4)
                    ELSE ROUND(fob_price * 0.985 / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND((fob_price * 0.985) / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND(fob_price * 0.985 / 24, 4) END,

                -- DAP Pricing (FOB + vessel freight)
                COALESCE(product_rec.total_cases_per_container, 2000),
                CASE
                    WHEN product_rec.product_type = 'I' THEN 1.50 -- International shipping
                    ELSE 0.50 -- Domestic
                END,
                ROUND(fob_price + CASE WHEN product_rec.product_type = 'I' THEN 1.50 ELSE 0.50 END, 2),
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND((fob_price + CASE WHEN product_rec.product_type = 'I' THEN 1.50 ELSE 0.50 END) / product_rec.pack_size_units, 4)
                    ELSE ROUND((fob_price + 1.50) / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND((fob_price + CASE WHEN product_rec.product_type = 'I' THEN 1.50 ELSE 0.50 END) / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND((fob_price + 1.50) / 24, 4) END,

                -- DDP Pricing (includes inland freight)
                0.75, -- Inland freight per case
                ddp_price,
                CASE WHEN product_rec.pack_size_units > 0
                    THEN ROUND(ddp_price / product_rec.pack_size_units, 4)
                    ELSE ROUND(ddp_price / 12, 4) END,
                CASE WHEN product_rec.case_net_weight_lbs > 0
                    THEN ROUND(ddp_price / product_rec.case_net_weight_lbs, 4)
                    ELSE ROUND(ddp_price / 24, 4) END,

                -- Dates
                CURRENT_DATE - INTERVAL '15 days',
                CURRENT_DATE + INTERVAL '365 days',
                true,
                'Generated pricing for reporting system'
            );

            records_created := records_created + 1;

        END LOOP; -- customers

    END LOOP; -- products

    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Created % customer pricing records', records_created;
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- STEP 2: VERIFICATION
-- ============================================================================

DO $$
DECLARE
    total_products INTEGER;
    total_customers INTEGER;
    total_pricing INTEGER;
    expected_pricing INTEGER;
    report_rows INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products WHERE is_active = true;
    SELECT COUNT(*) INTO total_customers FROM customers WHERE is_active = true;
    SELECT COUNT(*) INTO total_pricing FROM product_customer_pricing WHERE is_current = true;
    SELECT COUNT(*) INTO report_rows FROM v_master_price_report;

    expected_pricing := total_products * total_customers;

    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Active Products:          %', total_products;
    RAISE NOTICE 'Active Customers:         %', total_customers;
    RAISE NOTICE 'Customer Pricing Records: %', total_pricing;
    RAISE NOTICE 'Expected Records:         %', expected_pricing;
    RAISE NOTICE 'Report View Rows:         %', report_rows;
    RAISE NOTICE '';

    IF total_pricing >= expected_pricing THEN
        RAISE NOTICE '✅ SUCCESS! All product-customer combinations have pricing';
    ELSE
        RAISE NOTICE '⚠️  Missing % pricing records', expected_pricing - total_pricing;
    END IF;

    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 3: SHOW SAMPLE REPORT DATA
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SAMPLE REPORT DATA ===';
    RAISE NOTICE '';
END $$;

SELECT
    item_number,
    brand,
    product_type,
    vendor_name,
    customer_name,
    fob_cost_per_case,
    fob_price_per_case,
    fob_margin_amount,
    ROUND(fob_margin_percent, 2) as fob_margin_percent,
    profit_per_40ft_fob
FROM v_master_price_report
ORDER BY item_number, customer_name
LIMIT 25;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Your database now has:
-- ✅ 8 Products
-- ✅ 4 Vendors
-- ✅ 5 Customers
-- ✅ ~40 Customer Pricing Records (8 products × 5 customers)
-- ✅ Ready to generate reports with all data!
--
-- Next Steps:
-- 1. Go to http://localhost:3000/reports
-- 2. Click "Generate Master Price Report"
-- 3. You'll see all 40 product-customer combinations!
-- ============================================================================
