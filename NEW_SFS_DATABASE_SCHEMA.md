# 🗄️ SFS ERP Portal - Database Schema Design

## Overview
This schema supports the complete end-to-end tracking of products from vendor purchase to customer sales, including all cost calculations, pricing tiers, and historical tracking.

---

## 📊 DATABASE TABLES (Normalized Structure)

### **1. products** (Core product master)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    master_list_number INTEGER UNIQUE NOT NULL,  -- 1 out of 450
    item_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Type & Status
    product_type CHAR(1) CHECK (product_type IN ('I', 'D')),  -- I=International, D=Domestic
    status CHAR(1) CHECK (status IN ('N', 'C', 'T')),  -- N=New, C=Current, T=Temporary
    category VARCHAR(100),  -- Vegetables, Fruits, etc.
    
    -- Basic Info
    brand VARCHAR(100),
    item_description TEXT,
    pack_size_units INTEGER,
    pack_size_weight DECIMAL(10, 2),
    pack_size_display VARCHAR(50),  -- "4/6lb"
    
    -- Physical Specifications
    case_net_weight_lbs DECIMAL(10, 3),
    case_gross_weight_lbs DECIMAL(10, 3),
    case_length_inches DECIMAL(10, 2),
    case_width_inches DECIMAL(10, 2),
    case_height_inches DECIMAL(10, 2),
    
    -- Container & Pallet
    cases_per_pallet INTEGER,
    pallet_ti INTEGER,  -- Cases across
    pallet_hi INTEGER,  -- Cases high
    total_cases_per_container INTEGER,
    container_type VARCHAR(50),  -- '40ft HQ', '20ft', etc.
    
    -- Container Weight Constraints
    allowed_container_weight_lbs INTEGER,  -- 52000
    allowed_overweight_lbs INTEGER,  -- 53000
    total_container_gross_weight DECIMAL(10, 2),
    total_container_net_weight DECIMAL(10, 2),
    available_weight_difference DECIMAL(10, 2),
    
    -- Metadata
    last_infosheet_update DATE,
    review_status VARCHAR(100),  -- "YEARLY CONTRACT - OUT OF STOCK", etc.
    needs_update BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);
```

---

### **2. vendors** (Supplier information)
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Vendor Identity
    vendor_name VARCHAR(200) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE,
    
    -- Location
    country_origin VARCHAR(100),
    facility_name VARCHAR(200),
    facility_address TEXT,
    facility_zip_code VARCHAR(20),
    
    -- Terms
    payment_terms VARCHAR(100),  -- "Net 30", "Net 60", etc.
    
    -- Contact Info
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_country ON vendors(country_origin);
CREATE INDEX idx_vendors_active ON vendors(is_active);
```

---

### **3. product_vendor_costs** (Product-Vendor relationship with costs)
```sql
CREATE TABLE product_vendor_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Shipping Terms
    incoterm VARCHAR(10) CHECK (incoterm IN ('EXW', 'FOB', 'DAP', 'DDP')),
    shipment_size VARCHAR(50),  -- 'LTL', 'FTL'
    loading_option VARCHAR(50),  -- 'Palletized', 'Floor Loaded'
    
    -- EXW COSTS (Cost at Plant)
    exw_cost_per_case DECIMAL(10, 4),
    exw_cost_per_unit DECIMAL(10, 4),
    exw_cost_per_lb DECIMAL(10, 4),
    exw_previous_cost_per_case DECIMAL(10, 4),
    exw_previous_cost_per_lb DECIMAL(10, 4),
    
    -- FOB COSTS (Cost FOB Port Origin)
    fob_cost_per_case DECIMAL(10, 4),
    fob_cost_per_unit DECIMAL(10, 4),
    fob_cost_per_lb DECIMAL(10, 4),
    fob_previous_cost_per_case DECIMAL(10, 4),
    fob_previous_cost_per_lb DECIMAL(10, 4),
    
    -- PICKUP AT PLANT COSTS
    pickup_plant_cost_per_case DECIMAL(10, 4),
    pickup_plant_cost_per_unit DECIMAL(10, 4),
    pickup_plant_cost_per_lb DECIMAL(10, 4),
    pickup_plant_previous_cost_per_case DECIMAL(10, 4),
    pickup_plant_previous_cost_per_lb DECIMAL(10, 4),
    
    -- PICKUP AT PORT US COSTS
    pickup_port_us_cost_per_case DECIMAL(10, 4),
    pickup_port_us_cost_per_unit DECIMAL(10, 4),
    pickup_port_us_cost_per_lb DECIMAL(10, 4),
    pickup_port_us_previous_cost_per_case DECIMAL(10, 4),
    pickup_port_us_previous_cost_per_lb DECIMAL(10, 4),
    
    -- DDP COSTS (Delivery Duty Paid)
    ddp_cost_per_case DECIMAL(10, 4),
    ddp_cost_per_unit DECIMAL(10, 4),
    ddp_cost_per_lb DECIMAL(10, 4),
    ddp_previous_cost_per_case DECIMAL(10, 4),
    ddp_previous_cost_per_lb DECIMAL(10, 4),
    
    -- Factory Fees
    factory_fee_percent DECIMAL(5, 4),
    factory_fee_per_case DECIMAL(10, 4),
    
    -- Effective dates
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    cost_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(product_id, vendor_id, effective_date)
);

CREATE INDEX idx_pvc_product ON product_vendor_costs(product_id);
CREATE INDEX idx_pvc_vendor ON product_vendor_costs(vendor_id);
CREATE INDEX idx_pvc_current ON product_vendor_costs(is_current);
CREATE INDEX idx_pvc_effective ON product_vendor_costs(effective_date);
```

---

### **4. customers** (Buyer information)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Customer Identity
    customer_name VARCHAR(200) NOT NULL,
    customer_code VARCHAR(50) UNIQUE,
    
    -- Location & Classification
    region VARCHAR(50),  -- 'SE', 'NE', 'MW', etc.
    warehouse_zip_code VARCHAR(20),
    delivery_state VARCHAR(50),
    delivery_state_zip VARCHAR(20),
    
    -- Terms
    payment_terms VARCHAR(100),  -- "Net 30", "COD", etc.
    
    -- Sales Broker Assignment
    sales_broker_name VARCHAR(100),  -- "KATGO", etc.
    
    -- Contact Info
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_region ON customers(region);
CREATE INDEX idx_customers_broker ON customers(sales_broker_name);
CREATE INDEX idx_customers_active ON customers(is_active);
```

---

### **5. product_customer_pricing** (Product-Customer relationship with pricing)
```sql
CREATE TABLE product_customer_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- EXW PRICING (Pick-up at Plant - Domestic)
    exw_price_per_case DECIMAL(10, 4),
    exw_price_per_unit DECIMAL(10, 4),
    exw_price_per_lb DECIMAL(10, 4),
    exw_previous_price_per_case DECIMAL(10, 4),
    
    -- EXW WITH REBATE
    exw_rebate_amount DECIMAL(10, 4),
    exw_rebate_price_per_case DECIMAL(10, 4),
    exw_rebate_price_per_unit DECIMAL(10, 4),
    exw_rebate_price_per_lb DECIMAL(10, 4),
    
    -- FOB PRICING (Free on Board)
    fob_price_per_case DECIMAL(10, 4),
    fob_price_per_unit DECIMAL(10, 4),
    fob_price_per_lb DECIMAL(10, 4),
    
    -- FOB WITH REBATE
    fob_rebate_amount DECIMAL(10, 4),
    fob_rebate_price_per_case DECIMAL(10, 4),
    fob_rebate_price_per_unit DECIMAL(10, 4),
    fob_rebate_price_per_lb DECIMAL(10, 4),
    
    -- DAP PRICING (Delivered at Place - Port USA)
    dap_cases_per_container INTEGER,
    dap_vessel_freight_per_case DECIMAL(10, 4),
    dap_price_per_case DECIMAL(10, 4),
    dap_price_per_unit DECIMAL(10, 4),
    dap_price_per_lb DECIMAL(10, 4),
    
    -- DDP PRICING (Delivered Duty Paid - Client Crossdock)
    ddp_inland_freight_per_case DECIMAL(10, 4),
    ddp_price_per_case DECIMAL(10, 4),
    ddp_price_per_unit DECIMAL(10, 4),
    ddp_price_per_lb DECIMAL(10, 4),
    
    -- Effective dates
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    pricing_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(product_id, customer_id, effective_date)
);

CREATE INDEX idx_pcp_product ON product_customer_pricing(product_id);
CREATE INDEX idx_pcp_customer ON product_customer_pricing(customer_id);
CREATE INDEX idx_pcp_current ON product_customer_pricing(is_current);
CREATE INDEX idx_pcp_effective ON product_customer_pricing(effective_date);
```

---

### **6. sales_brokers** (Broker commission tracking)
```sql
CREATE TABLE sales_brokers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    broker_name VARCHAR(100) NOT NULL,
    broker_code VARCHAR(50) UNIQUE,
    
    -- Default Commission Rates
    default_broker_percent DECIMAL(5, 4),
    
    -- Contact Info
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **7. product_sales_broker_fees** (Product-specific broker fees)
```sql
CREATE TABLE product_sales_broker_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    sales_broker_id UUID REFERENCES sales_brokers(id) ON DELETE CASCADE,
    
    -- Broker A fees
    broker_a_percent DECIMAL(5, 4),
    broker_a_fee_per_case DECIMAL(10, 4),
    
    -- Broker B fees
    broker_b_percent DECIMAL(5, 4),
    broker_b_fee_per_case DECIMAL(10, 4),
    
    -- Broker C fees
    broker_c_percent DECIMAL(5, 4),
    broker_c_fee_per_case DECIMAL(10, 4),
    
    effective_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_psbf_product ON product_sales_broker_fees(product_id);
CREATE INDEX idx_psbf_customer ON product_sales_broker_fees(customer_id);
```

---

### **8. import_costs** (Import broker fees, tariffs, GSP)
```sql
CREATE TABLE import_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Import Broker Fees
    import_broker_fee_percent DECIMAL(5, 4),
    import_broker_fee_per_case DECIMAL(10, 4),
    
    -- Tariffs
    duty_rate_percent DECIMAL(5, 4),
    duty_per_case DECIMAL(10, 4),
    previous_tariff_percent DECIMAL(5, 4),
    
    -- GSP (Generalized System of Preferences)
    gsp_margin_percent DECIMAL(5, 4),
    gsp_profit_per_case DECIMAL(10, 4),
    
    effective_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ic_product ON import_costs(product_id);
CREATE INDEX idx_ic_current ON import_costs(is_current);
```

---

### **9. sfs_margins** (SFS profit margins)
```sql
CREATE TABLE sfs_margins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- SFS Gross Margin
    sfs_margin_percent DECIMAL(5, 4),
    sfs_profit_per_case DECIMAL(10, 4),
    sfs_profit_per_pallet DECIMAL(10, 4),
    sfs_profit_per_container DECIMAL(10, 4),
    
    -- Historical tracking
    previous_sfs_percent DECIMAL(5, 4),
    previous_sfs_margin_per_case DECIMAL(10, 4),
    
    effective_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sm_product ON sfs_margins(product_id);
CREATE INDEX idx_sm_customer ON sfs_margins(customer_id);
CREATE INDEX idx_sm_current ON sfs_margins(is_current);
```

---

### **10. price_history** (Complete price change audit trail)
```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Link to entity
    entity_type VARCHAR(50) NOT NULL,  -- 'vendor_cost', 'customer_price', 'margin'
    entity_id UUID NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Change details
    field_name VARCHAR(100) NOT NULL,
    old_value DECIMAL(10, 4),
    new_value DECIMAL(10, 4),
    change_date DATE NOT NULL,
    change_reason TEXT,
    
    -- AI tracking
    change_source VARCHAR(50),  -- 'manual', 'ai_suggestion', 'bulk_import'
    
    changed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ph_product ON price_history(product_id);
CREATE INDEX idx_ph_entity ON price_history(entity_type, entity_id);
CREATE INDEX idx_ph_date ON price_history(change_date);
```

---

### **11. product_reviews** (Review and update tracking)
```sql
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    review_status VARCHAR(200),  -- "YEARLY CONTRACT - OUT OF STOCK"
    review_type VARCHAR(50),  -- "OUT_OF_STOCK", "NEEDS_UPDATE", "LONG_TIME_NO_SALE"
    review_notes TEXT,
    
    last_review_date DATE,
    next_review_date DATE,
    priority VARCHAR(20),  -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    
    reviewed_by VARCHAR(100),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pr_product ON product_reviews(product_id);
CREATE INDEX idx_pr_resolved ON product_reviews(resolved);
CREATE INDEX idx_pr_priority ON product_reviews(priority);
```

---

### **12. ai_suggestions** (AI-generated recommendations)
```sql
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    suggestion_type VARCHAR(50),  -- 'pricing', 'margin', 'dimension', 'container_optimization'
    suggestion_field VARCHAR(100),
    current_value TEXT,
    suggested_value TEXT,
    confidence_score DECIMAL(3, 2),  -- 0.00 to 1.00
    
    reasoning TEXT,
    
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected'
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_product ON ai_suggestions(product_id);
CREATE INDEX idx_ai_status ON ai_suggestions(status);
CREATE INDEX idx_ai_type ON ai_suggestions(suggestion_type);
```

---

### **13. audit_log** (System-wide audit trail)
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
    
    old_data JSONB,
    new_data JSONB,
    
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_date ON audit_log(changed_at);
```

---

## 📈 DATABASE VIEWS (For calculated fields)

### **v_product_master_list** (Complete product view with all calculations)
```sql
CREATE VIEW v_product_master_list AS
SELECT 
    p.id,
    p.master_list_number,
    p.item_number,
    p.product_type,
    p.status,
    p.category,
    p.brand,
    p.item_description,
    p.pack_size_display,
    
    -- Latest vendor costs
    pvc.exw_cost_per_case,
    pvc.fob_cost_per_case,
    pvc.ddp_cost_per_case,
    
    -- Latest customer pricing (aggregated)
    AVG(pcp.exw_price_per_case) as avg_exw_price,
    AVG(pcp.fob_price_per_case) as avg_fob_price,
    AVG(pcp.ddp_price_per_case) as avg_ddp_price,
    
    -- Margin calculation
    sm.sfs_margin_percent,
    sm.sfs_profit_per_case,
    sm.sfs_profit_per_container,
    
    -- Container info
    p.total_cases_per_container,
    p.container_type,
    
    -- Status info
    p.review_status,
    p.needs_update,
    p.last_infosheet_update,
    
    -- Customer count
    COUNT(DISTINCT pcp.customer_id) as customer_count
    
FROM products p
LEFT JOIN product_vendor_costs pvc ON p.id = pvc.product_id AND pvc.is_current = TRUE
LEFT JOIN product_customer_pricing pcp ON p.id = pcp.product_id AND pcp.is_current = TRUE
LEFT JOIN sfs_margins sm ON p.id = sm.product_id AND sm.is_current = TRUE
WHERE p.is_active = TRUE
GROUP BY p.id, pvc.id, sm.id;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables

-- Example policy: Users can only see active products
CREATE POLICY "Users can view active products" 
ON products FOR SELECT 
USING (is_active = TRUE);

-- Admins can see everything
CREATE POLICY "Admins can view all products"
ON products FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📊 KEY RELATIONSHIPS

```
products (1) ←→ (many) product_vendor_costs ←→ (many) vendors
products (1) ←→ (many) product_customer_pricing ←→ (many) customers
products (1) ←→ (many) import_costs
products (1) ←→ (many) sfs_margins ←→ (many) customers
products (1) ←→ (many) product_sales_broker_fees ←→ (many) customers
products (1) ←→ (many) product_reviews
products (1) ←→ (many) price_history
products (1) ←→ (many) ai_suggestions
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

1. **Indexes** on all foreign keys
2. **Partial indexes** on is_current, is_active flags
3. **Materialized views** for complex aggregations
4. **Query optimization** with EXPLAIN ANALYZE
5. **Connection pooling** for high concurrency
6. **Caching layer** (Redis) for frequently accessed data

---

## ✅ NEXT STEPS

1. **Create migration scripts** for all tables
2. **Set up database triggers** for automatic audit logging
3. **Create stored procedures** for complex calculations
4. **Build database functions** for price calculations
5. **Implement RLS policies** for security
6. **Create test data** for development
7. **Set up database backups** and disaster recovery

---

This schema provides:
✅ Complete vendor-to-customer tracking
✅ Multi-tier pricing (EXW, FOB, DAP, DDP)
✅ Historical price tracking
✅ Margin analysis at all levels
✅ Container optimization data
✅ AI integration readiness
✅ Complete audit trail
✅ Scalability to 450+ products
✅ Support for 190+ fields per product
