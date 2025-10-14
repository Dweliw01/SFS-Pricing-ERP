# 🚀 Master Price Report - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### **Step 1: Run the Database Migration** (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `supabase/migrations/005_create_report_tables.sql`
4. Copy all contents
5. Paste into Supabase SQL Editor
6. Click **"Run"**

You should see:
```
✓ Created table: report_templates
✓ Created view: v_master_price_report
✓ Created function: increment_template_use_count
✓ Inserted 4 default templates
```

---

### **Step 2: Start Your Development Server** (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### **Step 3: Navigate to Reports** (30 seconds)

1. Click **"Reports"** in the navigation bar
2. You'll see the Reports Dashboard with quick stats
3. Click **"Generate Master Price Report"**

---

### **Step 4: Generate Your First Report** (1 minute)

On the Master Price Report Builder page:

1. **Apply Filters** (optional)
   - Leave defaults or customize
   - Status: Current (already selected)
   - Search: Leave blank for all products

2. **Select Columns** (optional)
   - Default columns are already selected
   - Click "Full" preset for all 190+ columns
   - Or click "Basic" for essential columns only

3. **Preview Report**
   - Click **"Preview Report"** button
   - You'll see a table with your data
   - Scroll horizontally to see all columns

4. **Export Report**
   - Click **"Export Excel"** to download .xlsx file
   - Or click **"Export CSV"** for CSV format

---

## 📊 Sample Workflows

### **Workflow 1: Quick Product Pricing Report**
```
1. Go to Reports → Master Price Report
2. Click "Basic" preset (7 essential columns)
3. Click "Preview Report"
4. Click "Export Excel"
```
**Result**: Simple pricing report with item #, brand, vendor, customer, costs, prices, margins

---

### **Workflow 2: Complete Master Price List**
```
1. Go to Reports → Master Price Report
2. Click "Full" preset (all 190+ columns)
3. Filter: Status = Current only
4. Click "Export Excel"
```
**Result**: Complete Excel file with all product data matching your original template

---

### **Workflow 3: Margin Analysis**
```
1. Go to Reports → Master Price Report
2. Click "Margins" preset
3. Filter: Products with FOB pricing
4. Click "Preview Report"
5. Review margins in the table
6. Click "Export Excel"
```
**Result**: Report focused on profitability metrics

---

## 🎯 Understanding the Report

### **Column Categories**
Your report can include any combination of these 19 categories:

1. **Product Info** - Item #, brand, description, category
2. **Vendor Info** - Vendor name, country, facility, terms
3. **Physical Specs** - Case dimensions, weights, unit specs
4. **Container Logistics** - TI×HI, cases/pallet, cases/container
5. **Customer Info** - Customer name, region, broker, volume
6. **Vendor Costs (5 tiers)** - EXW, FOB, Pickup Plant, Pickup Port, DDP
7. **Factory Fees** - Percentage and per-case fees
8. **Import Costs** - Broker fees, duties, tariffs, GSP
9. **Customer Pricing (8 variants)** - EXW, FOB, DAP, DDP (with/without rebates)
10. **Margins** - Calculated profit margins and profitability
11. **Dates & Status** - Effective dates, review status
12. **Notes** - Cost notes, pricing notes, import notes

---

## 💡 Pro Tips

### **Tip 1: Start Small**
Begin with the "Basic" preset (7 columns) to understand the structure, then expand to more columns as needed.

### **Tip 2: Use Filters**
Apply filters before generating large reports to reduce processing time and file size.

### **Tip 3: Column Selection**
- Click category checkboxes to select/deselect entire groups
- Use presets for common report types
- Individual columns can be toggled on/off

### **Tip 4: Excel Tips**
When you open the exported Excel file:
- **Sheet 1**: Your data
- **Sheet 2**: Summary statistics
- Headers are formatted (bold, colored)
- Currency and percentages are formatted
- Columns are auto-sized

### **Tip 5: CSV for Analysis**
Use CSV export when you need to:
- Import into other tools (Python, R, Tableau)
- Share with non-Excel users
- Manipulate data programmatically

---

## 🔧 Troubleshooting

### **Issue: "No data found"**
**Solution**:
- Make sure you have products in your database
- Check that products have `is_active = true`
- Verify filters aren't too restrictive
- Try removing all filters and search for all products

### **Issue: Export button disabled**
**Solution**:
- Click "Preview Report" first to load data
- Make sure there's data in the preview table

### **Issue: Excel file won't open**
**Solution**:
- Make sure you're using Microsoft Excel 2010 or later
- Try opening with Google Sheets
- Check that the download completed fully

### **Issue: Too many columns**
**Solution**:
- Use column presets (Basic, Margins, Costs)
- Deselect unnecessary categories
- Focus on the data you actually need

---

## 📈 What's Included

### **Data Sources**
Your report pulls from:
- ✅ Products table
- ✅ Vendors table
- ✅ Customers table
- ✅ Product Vendor Costs (all 5 pricing tiers)
- ✅ Product Customer Pricing (all 8 variants)
- ✅ Import Costs

### **Calculated Fields**
Automatically computed:
- ✅ Margin amounts (price - cost)
- ✅ Margin percentages
- ✅ Landed costs (FOB + import costs)
- ✅ Profit per pallet
- ✅ Profit per container (20ft, 40ft, 40HC)
- ✅ Cost change tracking

### **Export Features**
- ✅ Professional Excel formatting
- ✅ Summary sheet with statistics
- ✅ CSV for data analysis
- ✅ Automatic timestamped filenames
- ✅ Handles large datasets (450+ products)

---

## 🎓 Learning Path

### **Day 1: Get Familiar**
1. Run migration
2. Generate basic report with preset
3. Export to Excel
4. Explore the file

### **Day 2: Customize**
1. Try different column presets
2. Apply filters
3. Select custom columns
4. Export multiple reports

### **Day 3: Advanced**
1. Filter by specific customers
2. Filter by margin ranges
3. Compare vendor costs
4. Analyze profitability

### **Week 2: Templates**
1. Save your favorite configurations
2. Share templates with team
3. Create workflows

---

## ✅ Success Checklist

After completing this quick start, you should be able to:

- [ ] Navigate to Reports section
- [ ] Open Master Price Report Builder
- [ ] Apply filters
- [ ] Select columns (using presets or custom)
- [ ] Preview report data in table
- [ ] Export to Excel
- [ ] Export to CSV
- [ ] Open and read exported Excel file
- [ ] Understand the summary sheet

---

## 🚀 Ready to Go!

You're all set! Your Master Price Report feature is ready to use.

**Need Help?**
- See `REPORTING_IMPLEMENTATION_SUMMARY.md` for detailed information
- Review `REPORTING_FEATURE_PLAN.md` for complete specifications
- Check the code documentation in each file

**Happy Reporting!** 📊
