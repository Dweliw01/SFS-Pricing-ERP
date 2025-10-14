# 📊 Master Price Report Feature - Implementation Plan

## 🎯 Project Overview

**Goal**: Build a comprehensive reporting system that generates Master Price Reports consolidating all product, vendor, customer, cost, and pricing data from the ERP system into exportable formats (Excel, CSV).

**Timeline**: 6 weeks
**Status**: 🚧 In Progress
**Priority**: High

---

## 📋 Report Structure

The Master Price Report consolidates **190+ fields across 17 categories** from your ERP template:

### Report Categories & Fields

#### 1. Product General Information (10+ fields)
- Master List Number (1 out of 450)
- Item Number
- Product Type (International/Domestic)
- Status (New/Current/Temporary)
- Category
- Brand
- Item Description
- Pack Size
- Units per Case
- Product of Country
- HS Code

#### 2. Vendor Information (8+ fields)
- Vendor Name
- Vendor Code
- Country of Origin
- Facility Name
- Facility Address
- Payment Terms
- INCOTERM (EXW/FOB/DAP/DDP)
- Shipment Size (LTL/FTL)
- Loading Options (Palletized/Floor Loaded)

#### 3. Product Physical Specifications (15+ fields)
- Case Net Weight (lbs)
- Case Gross Weight (lbs)
- Case Length (inches)
- Case Width (inches)
- Case Height (inches)
- Case Cube (cubic feet)
- Unit Weight (oz)
- Unit Dimensions
- Stackable (Yes/No)
- Lead Time (days)
- MOQ (Minimum Order Quantity)

#### 4. Container & Logistics (15+ fields)
- TI (cases per layer)
- HI (layers high)
- Cases per Pallet
- Pallet Weight (lbs)
- Pallets per 20ft Container
- Cases per 20ft Container
- Pallets per 40ft Container
- Cases per 40ft Container
- Pallets per 40ft HC Container
- Cases per 40ft HC Container
- Container Type
- Allowed Container Weight (52,000-53,000 lbs)
- Total Container Gross Weight
- Total Container Net Weight
- Available Weight Difference

#### 5. Customer Information (6+ fields)
- Customer Name
- Customer Code
- Region (SE, NE, MW, etc.)
- Warehouse ZIP Code
- Sales Broker Name
- Payment Terms

#### 6. Vendor Costs - 5 Tiers (25+ fields)
**A. EXW (Ex Works - Cost at Plant)**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**B. FOB (Free on Board - Port Origin)**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**C. Pickup at Plant**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**D. Pickup at Port US**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**E. DDP (Delivered Duty Paid)**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

#### 7. Factory Fees (2 fields)
- Factory Fee Percentage
- Factory Fee per Case

#### 8. Sales Broker Commissions (6 fields)
- Broker A: Percentage, Fee per Case
- Broker B: Percentage, Fee per Case
- Broker C: Percentage, Fee per Case

#### 9. Import Costs (7 fields)
- Import Broker Fee Percentage
- Import Broker Fee per Case
- Duty Rate Percentage
- Duty per Case
- Previous Tariff Percentage
- GSP Margin Percentage
- GSP Profit per Case

#### 10. SFS Margins (6 fields)
- SFS Gross Margin Percentage
- SFS Profit per Case
- SFS Profit per Pallet
- SFS Profit per Container
- Previous SFS Percentage
- Previous SFS Margin per Case

#### 11. Customer Pricing - EXW (Pick-up at Plant) (8 fields)
**Without Rebate:**
- Price per case
- Price per unit
- Price per lb
- Previous price per case

**With Rebate:**
- Rebate amount
- Price per case (with rebate)
- Price per unit (with rebate)
- Price per lb (with rebate)

#### 12. Customer Pricing - FOB (Free on Board) (8 fields)
**Standard FOB:**
- Price per case
- Price per unit
- Price per lb

**FOB with Rebate:**
- Rebate amount
- Price per case (with rebate)
- Price per unit (with rebate)
- Price per lb (with rebate)

#### 13. Customer Pricing - DAP (Delivered at Place - Port USA) (5 fields)
- Cases per Container
- Vessel Freight per Case
- Price per case
- Price per unit
- Price per lb

#### 14. Customer Pricing - DDP (Delivered Duty Paid) (4 fields)
- Inland Freight per Case
- Price per case
- Price per unit
- Price per lb

#### 15. Historical Tracking (5+ fields)
- Last Updated Date
- Effective Date
- Expiry Date
- Change Reason
- Change Source (manual/AI/bulk import)

#### 16. Review Status (6 fields)
- Review Status Text
- Review Type (OUT_OF_STOCK, NEEDS_UPDATE, etc.)
- Last Review Date
- Next Review Date
- Priority (Low/Medium/High/Urgent)
- Resolved (Yes/No)

#### 17. Calculated Fields (10+ fields)
- Margin Amount (Price - Cost)
- Margin Percentage
- Markup Percentage
- Landed Cost (Vendor Cost + Import Costs)
- Total Import Costs
- Profit per Pallet (Calculated)
- Profit per 20ft Container
- Profit per 40ft Container
- Profit per 40ft HC Container
- Container Utilization Percentage

**Total Fields**: 190+ fields per product

---

## 🏗️ Technical Architecture

### File Structure
```
SFS-Pricing-ERP/
├── app/
│   ├── reports/
│   │   ├── page.tsx                    # Main reports dashboard
│   │   ├── master-price/
│   │   │   └── page.tsx                # Master price report builder
│   │   └── templates/
│   │       └── page.tsx                # Saved report templates
│   │
│   └── api/
│       └── reports/
│           ├── master-price/
│           │   └── route.ts            # Generate master price report data
│           ├── export/
│           │   ├── excel/
│           │   │   └── route.ts        # Excel export
│           │   └── csv/
│           │       └── route.ts        # CSV export
│           └── templates/
│               └── route.ts            # CRUD for report templates
│
├── components/
│   └── reports/
│       ├── ReportBuilder.tsx           # Report configuration interface
│       ├── ReportFilters.tsx           # Filter controls
│       ├── ReportPreview.tsx           # Data preview table
│       ├── ExportOptions.tsx           # Export format selector
│       ├── ColumnSelector.tsx          # Column chooser
│       ├── SavedReports.tsx            # Saved templates list
│       └── ReportStats.tsx             # Quick statistics
│
├── lib/
│   ├── reports/
│   │   ├── masterPriceReport.ts        # Core report generation logic
│   │   ├── reportQueries.ts            # Database queries
│   │   ├── exportExcel.ts              # Excel export utilities
│   │   ├── exportCSV.ts                # CSV export utilities
│   │   ├── reportFormatters.ts         # Data formatting
│   │   └── reportTypes.ts              # TypeScript types
│   │
│   └── types.ts                        # Add report-related types
│
└── supabase/
    └── migrations/
        └── 005_create_report_tables.sql # Report templates table
```

### Database Schema

#### New Table: `report_templates`
```sql
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) DEFAULT 'master_price',

    -- Configuration stored as JSON
    filters JSONB DEFAULT '{}',          -- { productIds: [], customerIds: [], dateRange: {} }
    columns JSONB DEFAULT '[]',          -- ['item_number', 'brand', 'fob_cost', ...]
    sort_config JSONB DEFAULT '{}',      -- { field: 'item_number', direction: 'asc' }

    -- Sharing & permissions
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);

CREATE INDEX idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
```

#### New View: `v_master_price_report`
```sql
CREATE VIEW v_master_price_report AS
SELECT
    -- Product Info
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

    -- Physical Specs
    p.case_length_in,
    p.case_width_in,
    p.case_height_in,
    p.case_cube_ft,
    p.case_weight_lbs,
    p.unit_length_in,
    p.unit_width_in,
    p.unit_height_in,
    p.unit_weight_oz,

    -- Pallet Config
    p.ti,
    p.hi,
    p.cases_per_pallet,
    p.pallet_weight_lbs,

    -- Container Logistics
    p.pallets_per_20ft,
    p.cases_per_20ft,
    p.pallets_per_40ft,
    p.cases_per_40ft,
    p.pallets_per_40hc,
    p.cases_per_40hc,

    -- Shipping
    p.stackable,
    p.lead_time_days,
    p.moq,
    p.review_status,
    p.needs_update,
    p.is_active,

    -- Vendor Info
    v.id as vendor_id,
    v.vendor_name,
    v.vendor_code,
    v.country_origin,
    v.facility_name,
    v.facility_address,
    v.payment_terms as vendor_payment_terms,

    -- Vendor Costs (all 5 tiers)
    pvc.id as vendor_cost_id,
    pvc.incoterm,
    pvc.shipment_size,
    pvc.loading_option,
    pvc.exw_cost_per_case,
    pvc.exw_cost_per_unit,
    pvc.exw_cost_per_lb,
    pvc.exw_previous_cost_per_case,
    pvc.exw_previous_cost_per_lb,
    pvc.fob_cost_per_case,
    pvc.fob_cost_per_unit,
    pvc.fob_cost_per_lb,
    pvc.fob_previous_cost_per_case,
    pvc.fob_previous_cost_per_lb,
    pvc.pickup_plant_cost_per_case,
    pvc.pickup_plant_cost_per_unit,
    pvc.pickup_plant_cost_per_lb,
    pvc.pickup_plant_previous_cost_per_case,
    pvc.pickup_plant_previous_cost_per_lb,
    pvc.pickup_port_us_cost_per_case,
    pvc.pickup_port_us_cost_per_unit,
    pvc.pickup_port_us_cost_per_lb,
    pvc.pickup_port_us_previous_cost_per_case,
    pvc.pickup_port_us_previous_cost_per_lb,
    pvc.ddp_cost_per_case,
    pvc.ddp_cost_per_unit,
    pvc.ddp_cost_per_lb,
    pvc.ddp_previous_cost_per_case,
    pvc.ddp_previous_cost_per_lb,
    pvc.factory_fee_percent,
    pvc.factory_fee_per_case,
    pvc.effective_date as vendor_cost_effective_date,

    -- Customer Info
    c.id as customer_id,
    c.customer_name,
    c.customer_code,
    c.region,
    c.warehouse_zip_code,
    c.sales_broker_name,
    c.payment_terms as customer_payment_terms,

    -- Customer Pricing (all 8 variants)
    pcp.id as customer_pricing_id,
    pcp.exw_price_per_case,
    pcp.exw_price_per_unit,
    pcp.exw_price_per_lb,
    pcp.exw_previous_price_per_case,
    pcp.exw_rebate_amount,
    pcp.exw_rebate_price_per_case,
    pcp.exw_rebate_price_per_unit,
    pcp.exw_rebate_price_per_lb,
    pcp.fob_price_per_case,
    pcp.fob_price_per_unit,
    pcp.fob_price_per_lb,
    pcp.fob_rebate_amount,
    pcp.fob_rebate_price_per_case,
    pcp.fob_rebate_price_per_unit,
    pcp.fob_rebate_price_per_lb,
    pcp.dap_cases_per_container,
    pcp.dap_vessel_freight_per_case,
    pcp.dap_price_per_case,
    pcp.dap_price_per_unit,
    pcp.dap_price_per_lb,
    pcp.ddp_inland_freight_per_case,
    pcp.ddp_price_per_case,
    pcp.ddp_price_per_unit,
    pcp.ddp_price_per_lb,
    pcp.effective_date as customer_pricing_effective_date,
    pcp.pricing_notes,

    -- Import Costs
    ic.id as import_cost_id,
    ic.import_broker_fee_percent,
    ic.import_broker_fee_per_case,
    ic.duty_rate_percent,
    ic.duty_per_case,
    ic.previous_tariff_percent,
    ic.gsp_margin_percent,
    ic.gsp_profit_per_case,

    -- Calculated Margins (FOB basis example)
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL AND pcp.fob_price_per_case IS NOT NULL
        THEN pcp.fob_price_per_case - pvc.fob_cost_per_case
        ELSE NULL
    END as fob_margin_amount,

    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL AND pcp.fob_price_per_case IS NOT NULL AND pvc.fob_cost_per_case > 0
        THEN ((pcp.fob_price_per_case - pvc.fob_cost_per_case) / pvc.fob_cost_per_case * 100)
        ELSE NULL
    END as fob_margin_percent,

    -- Landed Cost Calculation
    CASE
        WHEN pvc.fob_cost_per_case IS NOT NULL
        THEN pvc.fob_cost_per_case + COALESCE(ic.import_broker_fee_per_case, 0) + COALESCE(ic.duty_per_case, 0)
        ELSE NULL
    END as landed_cost_per_case,

    -- Timestamps
    p.created_at,
    p.updated_at

FROM products p
LEFT JOIN product_vendor_costs pvc ON p.id = pvc.product_id AND pvc.is_current = TRUE
LEFT JOIN vendors v ON pvc.vendor_id = v.id
LEFT JOIN product_customer_pricing pcp ON p.id = pcp.product_id AND pcp.is_current = TRUE
LEFT JOIN customers c ON pcp.customer_id = c.id
LEFT JOIN import_costs ic ON p.id = ic.product_id AND ic.is_current = TRUE
WHERE p.is_active = TRUE
ORDER BY p.master_list_number;
```

---

## 📦 Required NPM Packages

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",           // Excel generation (.xlsx files)
    "file-saver": "^2.0.5",      // Browser file downloads
    "date-fns": "^3.0.0"         // Date formatting
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"
  }
}
```

---

## 🎨 User Interface Design

### Reports Dashboard (`/reports`)
- Quick stats cards (Total Products, Active Customers, Recent Reports)
- Saved report templates grid
- Quick action buttons (New Report, Export All, etc.)

### Master Price Report Builder (`/reports/master-price`)
```
┌─────────────────────────────────────────────────────────────┐
│  Master Price Report Builder                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Filters                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Products:  [Select All ▼] [Search...]                │  │
│  │  Customers: [Select All ▼] [Victory Foods, RD...]     │  │
│  │  Vendors:   [Select All ▼] [ABC Supplier...]          │  │
│  │  Date Range: [2024-01-01] to [2024-12-31]             │  │
│  │  Status:    [☑ Active] [☐ New] [☐ Temporary]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  Columns (Select up to 50 columns)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ☑ Product Info (10)  ☑ Vendor Costs (25)             │  │
│  │  ☑ Vendor Info (8)    ☑ Customer Pricing (30)         │  │
│  │  ☑ Physical Specs (15)☐ Import Costs (7)              │  │
│  │  ☑ Container (15)     ☑ Margins (10)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  [Preview Report]  [Export Excel]  [Export CSV]              │
│  [Save as Template...]                                       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Preview (Showing 450 products)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Item #  | Brand   | FOB Cost | Customer | FOB Price  │  │
│  │─────────|──────────|──────────|──────────|──────────│  │
│  │ ABC-123 | BrandA  | $12.50   | Victory  | $15.00    │  │
│  │ DEF-456 | BrandB  | $8.75    | RD       | $11.20    │  │
│  │ ...                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  [◄ Previous] Page 1 of 45 [Next ►]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Implementation Phases

### ✅ Phase 1: Foundation (Week 1)
**Database Layer**
- [ ] Create migration script `005_create_report_tables.sql`
- [ ] Create `report_templates` table
- [ ] Create `v_master_price_report` view
- [ ] Add indexes for performance
- [ ] Test queries with sample data

**Backend Setup**
- [ ] Install npm packages (`xlsx`, `file-saver`, `date-fns`)
- [ ] Create `lib/reports/` directory structure
- [ ] Create TypeScript types for reports
- [ ] Set up basic error handling

### ✅ Phase 2: Data Aggregation (Week 1-2)
**Report Query Logic**
- [ ] Create `lib/reports/reportQueries.ts`
  - [ ] `fetchMasterPriceReportData()` - main query
  - [ ] `fetchReportWithFilters()` - filtered query
  - [ ] `fetchReportStats()` - summary statistics
- [ ] Create `lib/reports/reportFormatters.ts`
  - [ ] Format currency values
  - [ ] Format percentages
  - [ ] Format dates
  - [ ] Handle null values
- [ ] Create `lib/reports/reportTypes.ts`
  - [ ] `MasterPriceReportRow` interface
  - [ ] `ReportFilters` interface
  - [ ] `ReportTemplate` interface

**API Routes**
- [ ] Create `app/api/reports/master-price/route.ts`
  - [ ] GET: Fetch report data with filters
  - [ ] Support pagination
  - [ ] Support sorting
  - [ ] Return JSON or stream for large datasets

### ✅ Phase 3: Export Functionality (Week 2-3)
**Excel Export**
- [ ] Create `lib/reports/exportExcel.ts`
  - [ ] Generate workbook from data
  - [ ] Format headers (bold, colors, borders)
  - [ ] Apply number formatting ($, %, decimals)
  - [ ] Auto-size columns
  - [ ] Add multiple sheets if needed
  - [ ] Add summary sheet with stats
- [ ] Create `app/api/reports/export/excel/route.ts`
  - [ ] Generate Excel file
  - [ ] Set proper MIME type
  - [ ] Stream response for large files

**CSV Export**
- [ ] Create `lib/reports/exportCSV.ts`
  - [ ] Convert data to CSV format
  - [ ] Handle special characters
  - [ ] Escape quotes
  - [ ] UTF-8 encoding
- [ ] Create `app/api/reports/export/csv/route.ts`
  - [ ] Generate CSV file
  - [ ] Set proper headers

### ✅ Phase 4: Frontend UI (Week 3-4)
**Reports Dashboard**
- [ ] Create `app/reports/page.tsx`
  - [ ] Quick stats cards
  - [ ] Saved templates list
  - [ ] Recent reports
  - [ ] Quick action buttons

**Master Price Report Builder**
- [ ] Create `app/reports/master-price/page.tsx`
- [ ] Create `components/reports/ReportFilters.tsx`
  - [ ] Product multi-select
  - [ ] Customer multi-select
  - [ ] Vendor multi-select
  - [ ] Date range picker
  - [ ] Status checkboxes
- [ ] Create `components/reports/ColumnSelector.tsx`
  - [ ] Grouped checkboxes (by category)
  - [ ] Select/Deselect all
  - [ ] Search columns
- [ ] Create `components/reports/ReportPreview.tsx`
  - [ ] Responsive table
  - [ ] Pagination
  - [ ] Horizontal scroll for many columns
  - [ ] Loading states
- [ ] Create `components/reports/ExportOptions.tsx`
  - [ ] Format selector (Excel, CSV)
  - [ ] Export button with loading state
  - [ ] Download progress indicator

**Template Management**
- [ ] Create `components/reports/SavedReports.tsx`
  - [ ] List saved templates
  - [ ] Load template
  - [ ] Delete template
  - [ ] Edit template name
- [ ] Create `app/api/reports/templates/route.ts`
  - [ ] CRUD operations for templates

### ✅ Phase 5: Advanced Features (Week 4-5)
**Calculated Fields**
- [ ] Add real-time margin calculations
- [ ] Add profit per container calculations
- [ ] Add landed cost calculations
- [ ] Add percentage change calculations

**Report Customization**
- [ ] Save report configurations
- [ ] Load saved configurations
- [ ] Set default columns
- [ ] Custom column order

**Performance Optimization**
- [ ] Implement data streaming for large reports
- [ ] Add report generation progress indicators
- [ ] Cache frequently accessed data
- [ ] Optimize database queries

### ✅ Phase 6: Testing & Polish (Week 5-6)
**Testing**
- [ ] Test with 1 product
- [ ] Test with 50 products
- [ ] Test with 450 products (full dataset)
- [ ] Test Excel export with all 190 fields
- [ ] Test CSV export
- [ ] Test filtering combinations
- [ ] Test with different browsers
- [ ] Test download on different devices

**Polish**
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Add error messages
- [ ] Add success notifications
- [ ] Improve responsive design
- [ ] Add keyboard shortcuts
- [ ] Add tooltips for complex fields

---

## 🔄 User Workflow

### Scenario 1: Generate Complete Master Price Report
1. Navigate to **Reports → Master Price Report**
2. Leave all filters on default (Select All)
3. Select desired columns or use "Select All"
4. Click **"Preview Report"** to see data
5. Click **"Export Excel"**
6. Excel file downloads with all 450 products and 190+ fields
7. Open in Excel to review/analyze

### Scenario 2: Customer-Specific Pricing Report
1. Navigate to **Reports → Master Price Report**
2. Filter by customer: Select "Victory Foods"
3. Select columns: Product Info, FOB Costs, FOB Pricing, Margins
4. Click **"Preview Report"**
5. Review margins for Victory Foods products
6. Click **"Export Excel"**
7. Share with sales team

### Scenario 3: Vendor Cost Analysis
1. Navigate to **Reports → Master Price Report**
2. Filter by vendor: Select specific vendor
3. Select columns: Product Info, All Vendor Cost Tiers, Historical Costs
4. Click **"Preview Report"**
5. Analyze cost changes over time
6. Click **"Export CSV"** for further analysis in other tools

### Scenario 4: Save Report Template
1. Configure filters and columns as needed
2. Click **"Save as Template"**
3. Enter template name: "Monthly Pricing Review"
4. Template saved to dashboard
5. Next month: Load template from dashboard
6. Generate updated report with same configuration

---

## 📈 Success Metrics

### Performance Targets
- [ ] Full report (450 products) generates in <10 seconds
- [ ] Excel export completes in <5 seconds
- [ ] CSV export completes in <3 seconds
- [ ] Page load time <2 seconds
- [ ] Preview table renders <1 second

### Accuracy Targets
- [ ] All 190+ fields export correctly
- [ ] Calculated fields match expected values
- [ ] Margin calculations accurate to 2 decimals
- [ ] No data loss during export
- [ ] Excel formatting matches template

### User Experience Targets
- [ ] Intuitive filter interface
- [ ] Clear column selection
- [ ] Helpful loading indicators
- [ ] Descriptive error messages
- [ ] Mobile-responsive design

---

## 🚨 Potential Challenges & Solutions

### Challenge 1: Large Dataset Performance
**Problem**: 450 products × 190 fields × multiple customers = huge dataset
**Solution**:
- Use database views for efficient joins
- Implement pagination for preview
- Stream Excel generation for memory efficiency
- Add indexes on commonly filtered columns

### Challenge 2: Excel File Size
**Problem**: Full report may be 5-10 MB or larger
**Solution**:
- Use streaming Excel generation
- Compress workbook if possible
- Offer filtered exports
- Consider splitting into multiple sheets

### Challenge 3: Complex Calculations
**Problem**: Margin calculations depend on multiple tables
**Solution**:
- Pre-calculate common metrics in database view
- Use PostgreSQL functions for complex calculations
- Cache calculation results where appropriate

### Challenge 4: Column Selection Complexity
**Problem**: 190+ columns is overwhelming for users
**Solution**:
- Group columns by category (Product, Vendor, Customer, etc.)
- Provide preset column selections (Basic, Full, Custom)
- Add search functionality in column selector
- Show column count in each category

---

## 🔐 Security Considerations

- [ ] Authenticate all API requests
- [ ] Validate user permissions for sensitive data
- [ ] Sanitize export filenames
- [ ] Rate limit report generation
- [ ] Log export activities for audit
- [ ] Validate filter inputs to prevent SQL injection

---

## 📚 Documentation Needs

- [ ] User guide: How to generate reports
- [ ] User guide: How to use filters
- [ ] User guide: How to save templates
- [ ] Admin guide: Database view maintenance
- [ ] Developer guide: Adding new report fields
- [ ] API documentation: Report endpoints

---

## 🎯 Future Enhancements (Post-MVP)

- [ ] PDF export with custom formatting
- [ ] Scheduled reports (email weekly/monthly)
- [ ] Comparative reports (period over period)
- [ ] Chart visualizations in Excel export
- [ ] Custom formula columns
- [ ] Report sharing with external users
- [ ] Data refresh from external sources
- [ ] Multi-language support
- [ ] Report access permissions
- [ ] Report generation history

---

## 📞 Stakeholder Sign-off

- [ ] Database schema approved
- [ ] UI mockups approved
- [ ] Export format approved
- [ ] Column list approved (190+ fields)
- [ ] Performance targets agreed
- [ ] Timeline approved

---

## 📝 Notes

- This feature is critical for the ERP system
- Must match existing Excel template format
- Performance is key with 450+ products
- Excel export is the most important format
- Users are familiar with current Excel workflow
- Gradual adoption expected (start with power users)

---

**Last Updated**: October 13, 2025
**Version**: 1.0
**Status**: Ready for Implementation
**Approved By**: [To be filled]
