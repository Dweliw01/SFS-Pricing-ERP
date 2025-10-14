-- ============================================================================
-- MIGRATION: Create Reporting Tables and Views
-- Description: Add support for Master Price Report and report templates
-- Created: 2025-10-13
-- ============================================================================

-- ============================================================================
-- 1. CREATE REPORT TEMPLATES TABLE
-- ============================================================================
-- Stores saved report configurations for reuse
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) DEFAULT 'master_price' CHECK (report_type IN ('master_price', 'custom')),

    -- Configuration (stored as JSON)
    filters JSONB DEFAULT '{}',          -- { productIds: [], customerIds: [], vendorIds: [], dateRange: {}, status: [] }
    columns JSONB DEFAULT '[]',          -- ['item_number', 'brand', 'fob_cost_per_case', ...]
    sort_config JSONB DEFAULT '{}',      -- { field: 'item_number', direction: 'asc' }

    -- Sharing & Permissions
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),

    -- Usage Tracking
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
CREATE INDEX idx_report_templates_public ON report_templates(is_public);
CREATE INDEX idx_report_templates_last_used ON report_templates(last_used_at DESC);

-- ============================================================================
-- 2. CREATE MASTER PRICE REPORT VIEW
-- ============================================================================
-- Comprehensive view joining all relevant data for the master price report
CREATE OR REPLACE VIEW v_master_price_report AS
SELECT
    -- =================================
    -- PRODUCT INFORMATION
    -- =================================
    p.id as product_id,
    p.master_list_number,
    p.item_number,
    p.product_type,
    p.status,
    p.category,
    p.brand,
    p.item_description,
    p.pack_size,
    p.units_per_case,
    p.product_of_country,
    p.hs_code,
    p.notes,

    -- =================================
    -- PHYSICAL SPECIFICATIONS
    -- =================================
    p.case_length_in,
    p.case_width_in,
    p.case_height_in,
    p.case_cube_ft,
    p.case_weight_lbs,
    p.unit_length_in,
    p.unit_width_in,
    p.unit_height_in,
    p.unit_weight_oz,

    -- =================================
    -- PALLET CONFIGURATION
    -- =================================
    p.ti,
    p.hi,
    p.cases_per_pallet,
    p.pallet_weight_lbs,

    -- =================================
    -- CONTAINER LOGISTICS
    -- =================================
    p.pallets_per_20ft,
    p.cases_per_20ft,
    p.pallets_per_40ft,
    p.cases_per_40ft,
    p.pallets_per_40hc,
    p.cases_per_40hc,

    -- =================================
    -- SHIPPING INFORMATION
    -- =================================
    p.stackable,
    p.lead_time_days,
    p.moq,

    -- =================================
    -- STATUS & REVIEW
    -- =================================
    p.review_status,
    p.needs_update,
    p.is_active,

    -- =================================
    -- VENDOR INFORMATION
    -- =================================
    v.id as vendor_id,
    v.vendor_name,
    v.vendor_code,
    v.country_origin,
    v.facility_name,
    v.facility_address,
    v.payment_terms as vendor_payment_terms,
    v.contact_person as vendor_contact_person,
    v.contact_email as vendor_contact_email,
    v.contact_phone as vendor_contact_phone,

    -- =================================
    -- VENDOR COSTS (5 TIERS)
    -- =================================
    pvc.id as vendor_cost_id,
    pvc.incoterm,
    pvc.shipment_size,
    pvc.loading_option,

    -- EXW Costs
    pvc.exw_cost_per_case,
    pvc.exw_cost_per_unit,
    pvc.exw_cost_per_lb,
    pvc.exw_previous_cost_per_case,
    pvc.exw_previous_cost_per_lb,

    -- FOB Costs
    pvc.fob_cost_per_case,
    pvc.fob_cost_per_unit,
    pvc.fob_cost_per_lb,
    pvc.fob_previous_cost_per_case,
    pvc.fob_previous_cost_per_lb,

    -- Pickup at Plant Costs
    pvc.pickup_plant_cost_per_case,
    pvc.pickup_plant_cost_per_unit,
    pvc.pickup_plant_cost_per_lb,
    pvc.pickup_plant_previous_cost_per_case,
    pvc.pickup_plant_previous_cost_per_lb,

    -- Pickup at Port US Costs
    pvc.pickup_port_us_cost_per_case,
    pvc.pickup_port_us_cost_per_unit,
    pvc.pickup_port_us_cost_per_lb,
    pvc.pickup_port_us_previous_cost_per_case,
    pvc.pickup_port_us_previous_cost_per_lb,

    -- DDP Costs
    pvc.ddp_cost_per_case,
    pvc.ddp_cost_per_unit,
    pvc.ddp_cost_per_lb,
    pvc.ddp_previous_cost_per_case,
    pvc.ddp_previous_cost_per_lb,

    -- Factory Fees
    pvc.factory_fee_percent,
    pvc.factory_fee_per_case,

    pvc.effective_date as vendor_cost_effective_date,
    pvc.expiry_date as vendor_cost_expiry_date,
    pvc.cost_notes,

    -- =================================
    -- CUSTOMER INFORMATION
    -- =================================
    c.id as customer_id,
    c.customer_name,
    c.customer_code,
    c.region,
    c.warehouse_zip_code,
    c.sales_broker_name,
    c.payment_terms as customer_payment_terms,
    c.contact_person as customer_contact_person,
    c.contact_email as customer_contact_email,
    c.contact_phone as customer_contact_phone,
    c.annual_volume_cases,
    c.monthly_volume_cases,

    -- =================================
    -- CUSTOMER PRICING (8 VARIANTS)
    -- =================================
    pcp.id as customer_pricing_id,

    -- EXW Pricing (without rebate)
    pcp.exw_price_per_case,
    pcp.exw_price_per_unit,
    pcp.exw_price_per_lb,
    pcp.exw_previous_price_per_case,

    -- EXW Pricing (with rebate)
    pcp.exw_rebate_amount,
    pcp.exw_rebate_price_per_case,
    pcp.exw_rebate_price_per_unit,
    pcp.exw_rebate_price_per_lb,

    -- FOB Pricing (without rebate)
    pcp.fob_price_per_case,
    pcp.fob_price_per_unit,
    pcp.fob_price_per_lb,

    -- FOB Pricing (with rebate)
    pcp.fob_rebate_amount,
    pcp.fob_rebate_price_per_case,
    pcp.fob_rebate_price_per_unit,
    pcp.fob_rebate_price_per_lb,

    -- DAP Pricing
    pcp.dap_cases_per_container,
    pcp.dap_vessel_freight_per_case,
    pcp.dap_price_per_case,
    pcp.dap_price_per_unit,
    pcp.dap_price_per_lb,

    -- DDP Pricing
    pcp.ddp_inland_freight_per_case,
    pcp.ddp_price_per_case,
    pcp.ddp_price_per_unit,
    pcp.ddp_price_per_lb,

    pcp.effective_date as customer_pricing_effective_date,
    pcp.expiry_date as customer_pricing_expiry_date,
    pcp.pricing_notes,

    -- =================================
    -- IMPORT COSTS
    -- =================================
    ic.id as import_cost_id,
    ic.import_broker_fee_percent,
    ic.import_broker_fee_per_case,
    ic.duty_rate_percent,
    ic.duty_per_case,
    ic.previous_tariff_percent,
    ic.gsp_margin_percent,
    ic.gsp_profit_per_case,
    ic.effective_date as import_cost_effective_date,
    ic.notes as import_cost_notes,

    -- =================================
    -- CALCULATED FIELDS - MARGINS
    -- =================================

    -- EXW Margin (without rebate)
    CASE
        WHEN pvc.exw_cost_per_case IS NOT NULL AND pcp.exw_price_per_case IS NOT NULL
        THEN pcp.exw_price_per_case - pvc.exw_cost_per_case
        ELSE NULL
    END as exw_margin_amount,

    CASE
        WHEN pvc.exw_cost_per_case IS NOT NULL AND pvc.exw_cost_per_case > 0 AND pcp.exw_price_per_case IS NOT NULL
        THEN ((pcp.exw_price_per_case - pvc.exw_cost_per_case) / pvc.exw_cost_per_case * 100)
        ELSE NULL
    END as exw_margin_percent,

    -- FOB Margin (without rebate)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL AND pcp.fob_price_per_case IS NOT NULL
        THEN pcp.fob_price_per_case - pvc.fob_cost_per_case
        ELSE NULL
    END as fob_margin_amount,

    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL AND pvc.fob_cost_per_case > 0 AND pcp.fob_price_per_case IS NOT NULL
        THEN ((pcp.fob_price_per_case - pvc.fob_cost_per_case) / pvc.fob_cost_per_case * 100)
        ELSE NULL
    END as fob_margin_percent,

    -- DDP Margin
    CASE
        WHEN pvc.ddp_cost_per_case IS NOT NULL AND pcp.ddp_price_per_case IS NOT NULL
        THEN pcp.ddp_price_per_case - pvc.ddp_cost_per_case
        ELSE NULL
    END as ddp_margin_amount,

    CASE
        WHEN pvc.ddp_cost_per_case IS NOT NULL AND pvc.ddp_cost_per_case > 0 AND pcp.ddp_price_per_case IS NOT NULL
        THEN ((pcp.ddp_price_per_case - pvc.ddp_cost_per_case) / pvc.ddp_cost_per_case * 100)
        ELSE NULL
    END as ddp_margin_percent,

    -- =================================
    -- CALCULATED FIELDS - LANDED COST
    -- =================================

    -- Landed Cost (FOB + Import Costs)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
        THEN pvc.fob_cost_per_case +
             COALESCE(ic.import_broker_fee_per_case, 0) +
             COALESCE(ic.duty_per_case, 0)
        ELSE NULL
    END as landed_cost_per_case,

    -- Total Import Costs
    COALESCE(ic.import_broker_fee_per_case, 0) + COALESCE(ic.duty_per_case, 0) as total_import_costs_per_case,

    -- =================================
    -- CALCULATED FIELDS - PROFITABILITY
    -- =================================

    -- Profit per Pallet (based on FOB margin)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
            AND pcp.fob_price_per_case IS NOT NULL
            AND p.cases_per_pallet IS NOT NULL
        THEN (pcp.fob_price_per_case - pvc.fob_cost_per_case) * p.cases_per_pallet
        ELSE NULL
    END as profit_per_pallet_fob,

    -- Profit per 20ft Container (based on FOB margin)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
            AND pcp.fob_price_per_case IS NOT NULL
            AND p.cases_per_20ft IS NOT NULL
        THEN (pcp.fob_price_per_case - pvc.fob_cost_per_case) * p.cases_per_20ft
        ELSE NULL
    END as profit_per_20ft_fob,

    -- Profit per 40ft Container (based on FOB margin)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
            AND pcp.fob_price_per_case IS NOT NULL
            AND p.cases_per_40ft IS NOT NULL
        THEN (pcp.fob_price_per_case - pvc.fob_cost_per_case) * p.cases_per_40ft
        ELSE NULL
    END as profit_per_40ft_fob,

    -- Profit per 40ft HC Container (based on FOB margin)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
            AND pcp.fob_price_per_case IS NOT NULL
            AND p.cases_per_40hc IS NOT NULL
        THEN (pcp.fob_price_per_case - pvc.fob_cost_per_case) * p.cases_per_40hc
        ELSE NULL
    END as profit_per_40hc_fob,

    -- =================================
    -- CALCULATED FIELDS - COST CHANGES
    -- =================================

    -- FOB Cost Change (dollar amount)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL AND pvc.fob_previous_cost_per_case IS NOT NULL
        THEN pvc.fob_cost_per_case - pvc.fob_previous_cost_per_case
        ELSE NULL
    END as fob_cost_change_amount,

    -- FOB Cost Change (percentage)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
            AND pvc.fob_previous_cost_per_case IS NOT NULL
            AND pvc.fob_previous_cost_per_case > 0
        THEN ((pvc.fob_cost_per_case - pvc.fob_previous_cost_per_case) / pvc.fob_previous_cost_per_case * 100)
        ELSE NULL
    END as fob_cost_change_percent,

    -- =================================
    -- TIMESTAMPS
    -- =================================
    p.created_at as product_created_at,
    p.updated_at as product_updated_at

FROM products p
LEFT JOIN product_vendor_costs pvc ON p.id = pvc.product_id AND pvc.is_current = TRUE
LEFT JOIN vendors v ON pvc.vendor_id = v.id
LEFT JOIN product_customer_pricing pcp ON p.id = pcp.product_id AND pcp.is_current = TRUE
LEFT JOIN customers c ON pcp.customer_id = c.id
LEFT JOIN import_costs ic ON p.id = ic.product_id AND ic.is_current = TRUE
WHERE p.is_active = TRUE
ORDER BY p.master_list_number, c.customer_name;

-- ============================================================================
-- 3. CREATE HELPER FUNCTION FOR REPORT GENERATION
-- ============================================================================
-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE report_templates
    SET use_count = use_count + 1,
        last_used_at = NOW()
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_report_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_template_timestamp
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_report_template_timestamp();

-- ============================================================================
-- 5. GRANT PERMISSIONS (if using RLS)
-- ============================================================================
-- Note: Adjust permissions based on your auth setup
-- For now, we'll keep it simple and allow authenticated users to access

-- Grant select on view
-- GRANT SELECT ON v_master_price_report TO authenticated;

-- Grant CRUD on report_templates
-- GRANT ALL ON report_templates TO authenticated;

-- ============================================================================
-- 6. INSERT DEFAULT REPORT TEMPLATES
-- ============================================================================
-- Create some default report templates for common use cases

INSERT INTO report_templates (name, description, report_type, filters, columns, is_public, created_by)
VALUES
(
    'Complete Master Price Report',
    'Full report with all 190+ fields for all products, customers, and vendors',
    'master_price',
    '{"productIds": [], "customerIds": [], "vendorIds": [], "status": ["C", "N", "T"]}',
    '["master_list_number", "item_number", "brand", "item_description", "vendor_name", "customer_name", "fob_cost_per_case", "fob_price_per_case", "fob_margin_amount", "fob_margin_percent"]',
    true,
    'system'
),
(
    'Basic Product Pricing',
    'Simple report with product info, costs, and prices',
    'master_price',
    '{"status": ["C"]}',
    '["item_number", "brand", "vendor_name", "customer_name", "fob_cost_per_case", "fob_price_per_case", "fob_margin_percent"]',
    true,
    'system'
),
(
    'Margin Analysis Report',
    'Focus on margins and profitability across all pricing tiers',
    'master_price',
    '{"status": ["C"]}',
    '["item_number", "brand", "customer_name", "exw_margin_percent", "fob_margin_percent", "ddp_margin_percent", "profit_per_40ft_fob"]',
    true,
    'system'
),
(
    'Vendor Cost Comparison',
    'Compare costs across all vendor tiers with historical data',
    'master_price',
    '{"status": ["C"]}',
    '["item_number", "brand", "vendor_name", "exw_cost_per_case", "fob_cost_per_case", "ddp_cost_per_case", "fob_previous_cost_per_case", "fob_cost_change_percent"]',
    true,
    'system'
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- - Created report_templates table for saving report configurations
-- - Created v_master_price_report view with 190+ fields
-- - Added calculated fields for margins, profitability, and cost changes
-- - Created helper function for template usage tracking
-- - Added auto-update trigger for timestamps
-- - Inserted default report templates
-- ============================================================================
