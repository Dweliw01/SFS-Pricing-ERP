# Master Price Report - Quick Start Checklist

## ⚡ Execute These Steps in Order

### ☐ Step 1: Install Dependencies
```bash
npm install
```
**Time**: ~1 minute

---

### ☐ Step 2: Run Database Migration
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of: `supabase/migrations/005_create_report_tables.sql`
3. Click "Run"
4. ✅ Verify you see success messages for:
   - `report_templates` table created
   - `v_master_price_report` view created
   - 4 templates inserted

**Time**: ~30 seconds

---

### ☐ Step 3: Add Customer Pricing Data
1. Open Supabase SQL Editor (same window or new query)
2. Copy and paste the entire contents of: `ADD_MISSING_CUSTOMER_PRICING.sql`
3. Click "Run"
4. ✅ Verify you see:
   - "Created 40 customer pricing records"
   - "SUCCESS! All product-customer combinations have pricing"

**Time**: ~10 seconds

---

### ☐ Step 4: Start Development Server
```bash
npm run dev
```
**Time**: ~15 seconds

---

### ☐ Step 5: Test the Feature
1. Open browser: **http://localhost:3000/reports**
2. Click "Master Price Report"
3. Click "Generate Report" or select some filters
4. ✅ Verify you see 40 rows of data
5. Try exporting to Excel
6. ✅ Verify Excel file downloads and opens correctly

**Time**: ~2 minutes

---

## 🎉 Total Time: ~5 minutes

---

## 📊 Expected Results

After completing all steps:

| Metric | Expected Value |
|--------|---------------|
| Products | 8 |
| Vendors | 4 |
| Customers | 5 |
| Vendor Costs | 7 |
| Customer Pricing | 40 (newly added) |
| Import Costs | 9 |
| Report Rows | 40 |

---

## 🐛 If Something Goes Wrong

**Problem**: Can't install dependencies
- **Fix**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: SQL script errors
- **Fix**: Check that previous migrations (001, 002, 003, 004) have been run
- **Fix**: Verify tables exist: products, vendors, customers, product_vendor_costs, product_customer_pricing, import_costs

**Problem**: No data in reports
- **Fix**: Re-run `ADD_MISSING_CUSTOMER_PRICING.sql`
- **Fix**: Check Supabase logs for errors

**Problem**: Can't access /reports page
- **Fix**: Restart dev server
- **Fix**: Clear browser cache
- **Fix**: Check console for errors

---

## 📞 Need Help?

Refer to `REPORTING_SETUP_GUIDE.md` for detailed documentation.
