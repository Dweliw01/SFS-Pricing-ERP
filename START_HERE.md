# Master Price Report - START HERE

## 🚀 Quick Setup (5 Minutes)

Your reporting feature is **100% complete**! Just follow these 4 simple steps:

---

### Step 1: Install Dependencies (1 minute)
```bash
npm install
```

---

### Step 2: Run Database Migration (30 seconds)

1. Open **Supabase SQL Editor**
2. Copy the entire contents of: **`supabase/migrations/005_create_report_tables.sql`**
3. Click **"Run"**
4. ✅ Verify you see success messages

This creates:
- `report_templates` table
- `v_master_price_report` view with 190+ fields
- 4 default report templates

---

### Step 3: Add Customer Pricing Data (10 seconds)

1. Open **Supabase SQL Editor** (new query or same window)
2. Copy the entire contents of: **`ADD_MISSING_CUSTOMER_PRICING.sql`**
3. Click **"Run"**
4. ✅ Verify you see: "Created 40 customer pricing records"

This adds pricing for all your existing products and customers:
- 8 Products × 5 Customers = 40 pricing records
- Realistic prices based on your existing vendor costs
- All 8 pricing variants (EXW, FOB, DAP, DDP with/without rebates)

---

### Step 4: Start the App (15 seconds)

```bash
npm run dev
```

Then open: **http://localhost:3000/reports**

---

## ✅ What You'll See

### Reports Dashboard (`/reports`)
- Quick statistics
- List of available reports
- Link to Master Price Report builder

### Master Price Report Builder (`/reports/master-price`)
- **Filters**: Search, status, product type, category, brand, region
- **Column Selector**: 190+ fields organized in 19 categories
- **Presets**: Basic, Full, Margins, Costs
- **Preview**: Live data table with pagination
- **Export**: Download as Excel (.xlsx) or CSV

---

## 📊 Your Data After Setup

| Entity | Count |
|--------|-------|
| Products | 8 |
| Vendors | 4 |
| Customers | 5 |
| Vendor Costs | 7 |
| Customer Pricing | **40** (newly added) |
| Import Costs | 9 |
| **Report Rows** | **40** ✅ |

---

## 🎯 Try These First Reports

### 1. Basic Product Overview
- Select columns: Item Number, Brand, Description, Vendor, Customer
- Export to Excel
- ✅ See all 40 product-customer combinations

### 2. FOB Margin Analysis
- Select columns: Item Number, Vendor, Customer, FOB Cost, FOB Price, FOB Margin $, FOB Margin %
- Filter by specific customer or product
- Export to Excel
- ✅ Analyze profitability

### 3. Full Pricing Matrix
- Click "Full Report" preset
- All 190+ columns
- Export to Excel
- ✅ See every detail

---

## 🐛 Troubleshooting

**SQL Error in Step 2 or 3?**
- Make sure previous migrations (001, 002, 003, 004) were run
- Check that tables exist: products, vendors, customers, product_vendor_costs, product_customer_pricing

**No data in reports?**
- Run: `VERIFY_REPORTING_SETUP.sql` to check setup status
- Verify Step 3 completed successfully

**Can't access /reports page?**
- Restart dev server: `npm run dev`
- Clear browser cache
- Check browser console for errors

---

## 📚 Documentation

- **QUICK_START_CHECKLIST.md** - Step-by-step checklist
- **REPORTING_SETUP_GUIDE.md** - Detailed documentation
- **REPORTING_FEATURE_PLAN.md** - Complete technical specification
- **VERIFY_REPORTING_SETUP.sql** - Verification script

---

## 🎉 You're Ready!

Once you complete the 4 steps above, navigate to:

### **http://localhost:3000/reports**

Generate your first Master Price Report and export it to Excel!

---

## 💡 Next Steps After First Report

1. Try different column combinations
2. Apply filters to narrow down data
3. Compare margins across different customers
4. Analyze container profitability
5. Share reports with your team

Enjoy your new reporting system! 🚀
