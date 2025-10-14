# Master Price Report - Setup Guide

## Overview
Complete setup instructions for the Master Price Report feature. This feature generates comprehensive pricing reports with 190+ fields exported to Excel or CSV.

---

## ✅ Implementation Status

### Completed Files
- ✅ Database migration: `supabase/migrations/005_create_report_tables.sql`
- ✅ Test data script: `ADD_MISSING_CUSTOMER_PRICING.sql`
- ✅ TypeScript types: `lib/reports/reportTypes.ts`
- ✅ Column definitions: `lib/reports/reportColumns.ts`
- ✅ Database queries: `lib/reports/reportQueries.ts`
- ✅ Excel export: `lib/reports/exportExcel.ts`
- ✅ CSV export: `lib/reports/exportCSV.ts`
- ✅ API routes:
  - `app/api/reports/master-price/route.ts`
  - `app/api/reports/export/excel/route.ts`
  - `app/api/reports/export/csv/route.ts`
- ✅ UI pages:
  - `app/reports/page.tsx` (Dashboard)
  - `app/reports/master-price/page.tsx` (Report Builder)
- ✅ Navigation: Updated `components/Navigation.tsx`
- ✅ Dependencies: Added to `package.json`

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

This installs the new packages added:
- `xlsx` - Excel file generation
- `file-saver` - File download utility
- `date-fns` - Date formatting
- `@types/file-saver` - TypeScript types

---

### Step 2: Run Database Migration

Open your Supabase project SQL Editor and run:

```sql
-- File: supabase/migrations/005_create_report_tables.sql
```

This creates:
- `report_templates` table - Stores saved report configurations
- `v_master_price_report` view - Main reporting view with 190+ fields
- 4 default report templates

**Expected Result:**
```
✅ Created table: report_templates
✅ Created view: v_master_price_report
✅ Inserted 4 default templates
```

---

### Step 3: Add Customer Pricing Data

Your current database has:
- ✅ 8 Products (DS-SP-001, DS-GP-002, TH-YF-003, etc.)
- ✅ 4 Vendors (SAM-EC, PHF-001, TEI-001, GPC-001)
- ✅ 5 Customers (VF-001, FM-001, SG-001, WCF-001, MW-001)
- ✅ 7 Vendor costs
- ⚠️ Only 1 Customer pricing record

Run this script to add customer pricing for all product-customer combinations:

```sql
-- File: ADD_MISSING_CUSTOMER_PRICING.sql
```

**Expected Result:**
```
=== ADDING CUSTOMER PRICING ===
Created 40 customer pricing records

=== VERIFICATION ===
Active Products:          8
Active Customers:         5
Customer Pricing Records: 40
Expected Records:         40
Report View Rows:         40

✅ SUCCESS! All product-customer combinations have pricing
```

---

### Step 4: Start the Development Server

```bash
npm run dev
```

Navigate to: **http://localhost:3000/reports**

---

## 📊 Using the Reports Feature

### Reports Dashboard
- **Location**: `/reports`
- **Features**:
  - Quick statistics (products, customers, pricing records)
  - Available reports list
  - Link to Master Price Report builder

### Master Price Report Builder
- **Location**: `/reports/master-price`
- **Features**:
  - Search by item number or description
  - Filter by:
    - Product status (New/Current/Temporary)
    - Product type (International/Domestic)
    - Category
    - Brand
    - Region
  - Column selector with 19 categories:
    - Product Information (12 columns)
    - Physical Properties (12 columns)
    - Packaging (9 columns)
    - Container Logistics (12 columns)
    - Vendor Information (10 columns)
    - Vendor Costs - EXW (5 columns)
    - Vendor Costs - FOB (5 columns)
    - Vendor Costs - Pickup at Plant (5 columns)
    - Vendor Costs - Pickup at Port US (5 columns)
    - Vendor Costs - DDP (5 columns)
    - Vendor Fees (2 columns)
    - Customer Information (10 columns)
    - Customer Pricing - EXW (4 columns)
    - Customer Pricing - EXW Rebate (4 columns)
    - Customer Pricing - FOB (3 columns)
    - Customer Pricing - FOB Rebate (4 columns)
    - Customer Pricing - DAP (5 columns)
    - Customer Pricing - DDP (4 columns)
    - Import Costs (8 columns)
  - Preset column selections (Basic, Full, Margins, Costs)
  - Live preview table with pagination
  - Export to Excel (.xlsx) or CSV

### Export Features

**Excel Export:**
- Professional formatting (bold headers, colored background)
- Auto-sized columns
- Number formatting (currency, percentages)
- Two sheets:
  - "Master Price Report" - Full data
  - "Summary" - Statistics and metadata

**CSV Export:**
- Standard comma-separated format
- Proper escaping for special characters
- Compatible with Excel, Google Sheets, etc.

---

## 🗂️ Report Data Structure

### The v_master_price_report View

This view combines data from 6 tables:
```
products
  ↓
product_vendor_costs → vendors
  ↓
product_customer_pricing → customers
  ↓
import_costs
```

### Sample Report Row

Each row represents one product-customer combination with:
- **Product details**: Item number, brand, description, specs
- **Vendor details**: Vendor name, country, contact info
- **Vendor costs**: All 5 cost tiers (EXW, FOB, Pickup Plant, Pickup Port, DDP)
- **Customer details**: Customer name, region, contact info
- **Customer pricing**: All 8 pricing variants (with/without rebates)
- **Import costs**: Duty rates, broker fees, tariffs
- **Calculated fields**: Margins, profit per container, landed costs

---

## 📈 Sample Data Overview

After running the setup scripts, you'll have:

| Entity | Count | Details |
|--------|-------|---------|
| Products | 8 | DS-SP-001, DS-GP-002, TH-YF-003, PHF-AP-004, GPC-BB-005, SFS-TFM-006, TEI-CT-007, PHF-PF-008 |
| Vendors | 4 | SAM-EC (Ecuador), PHF-001 (Philippines), TEI-001 (Thailand), GPC-001 (India) |
| Customers | 5 | VF-001, FM-001, SG-001, WCF-001, MW-001 |
| Vendor Costs | 7 | Product-vendor cost relationships |
| Customer Pricing | 40 | All product-customer combinations (8 × 5) |
| Import Costs | 9 | Duty and broker fees |
| Report Rows | 40 | One per product-customer pricing record |

---

## 🎯 Report Examples

### Example 1: Basic Product List
**Columns**: Item Number, Brand, Description, Vendor, Customer
**Use Case**: Quick overview of all product relationships

### Example 2: FOB Margin Analysis
**Columns**: Item Number, Vendor, Customer, FOB Cost, FOB Price, FOB Margin $, FOB Margin %
**Use Case**: Analyze profitability by product

### Example 3: Full Pricing Comparison
**Columns**: All vendor cost tiers + All customer price tiers
**Use Case**: Compare pricing across all incoterms

### Example 4: Container Profitability
**Columns**: Item Number, Cases per 40ft, FOB Margin per Case, Profit per 40ft Container
**Use Case**: Determine most profitable products for container orders

---

## 🔧 Troubleshooting

### Issue: "No data available"
**Solution**: Run `ADD_MISSING_CUSTOMER_PRICING.sql` to populate customer pricing

### Issue: "View not found: v_master_price_report"
**Solution**: Run `005_create_report_tables.sql` migration

### Issue: Export button not working
**Check**:
1. API routes are accessible at `/api/reports/export/excel` and `/api/reports/export/csv`
2. Browser console for errors
3. Network tab shows request completing

### Issue: Some columns show null/empty values
**Expected**: Not all products have all cost tiers or pricing variants. This is normal.

---

## 📝 Next Steps

1. ✅ Run Step 2 (Database migration)
2. ✅ Run Step 3 (Customer pricing data)
3. ✅ Start development server
4. ✅ Navigate to `/reports`
5. ✅ Generate your first Master Price Report!
6. 📤 Export to Excel and review the data
7. 🎨 Customize columns and filters as needed
8. 💾 (Future) Save report templates for reuse

---

## 🚀 Future Enhancements

Potential additions:
- [ ] Schedule reports to run automatically
- [ ] Email report exports
- [ ] More chart visualizations
- [ ] Margin trend analysis over time
- [ ] Product comparison tools
- [ ] Bulk pricing updates from uploaded Excel files
- [ ] Report sharing with customers/vendors
- [ ] Custom calculated fields

---

## 📚 Technical Reference

### Key Files to Reference

**Types and Interfaces:**
- `lib/types.ts` - Core data types (Product, Vendor, Customer, etc.)
- `lib/reports/reportTypes.ts` - Report-specific types

**Calculation Logic:**
- `lib/calculations.ts` - Margin, profit, and cost waterfall calculations

**Database Queries:**
- `lib/reports/reportQueries.ts` - All report data fetching logic

**Export Logic:**
- `lib/reports/exportExcel.ts` - Excel generation
- `lib/reports/exportCSV.ts` - CSV generation

---

## ✨ Success!

Your reporting feature is now ready to use! You can generate comprehensive Master Price Reports with:
- ✅ 190+ fields from 6 database tables
- ✅ Flexible filtering and column selection
- ✅ Professional Excel exports with formatting
- ✅ CSV exports for external analysis
- ✅ Real-time preview with pagination
- ✅ Works with your existing test data

Navigate to **http://localhost:3000/reports** and start generating reports!
