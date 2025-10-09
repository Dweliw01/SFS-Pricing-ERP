# 🎯 SFS Master Cost & Price Portal - New Requirements Analysis

## 📋 Executive Summary

Based on the Excel template provided (`SFS_Master_Cost___Price_list_-_ERP_Template_Draft_6_9_22_25__1_.xlsx`), the customer wants a **complete ERP-style portal** that tracks products from vendor purchase through to customer sales with extensive cost analysis and pricing calculations.

### Key Differences from Previous System:
- **Previous**: Focused on simple product listing and basic pricing
- **New**: Comprehensive end-to-end cost tracking with 190+ data fields across 17 categories
- **Scale**: Template shows structure for 450+ products
- **AI Integration**: Customer explicitly wants AI assistance for data input

---

## 🏗️ NEW DATA STRUCTURE (17 CATEGORIES)

### **1. PRODUCT GENERAL INFORMATION** (4 fields)
- Master price list number (1 out of 450)
- International/Domestic indicator (I/D)
- Status (N=New, C=Current, T=Temporary)
- Product Category (Vegetables, etc.)

### **2. VENDOR INFORMATION** (8+ fields)
- Country of Origin
- Facility Address
- Facility Zip Code
- INCOTERM (EXW/FOB/DAP/DDP)
- Payment Terms
- Size of Shipment (LTL or FTL)
- Loading Options (Palletized or Floor Loaded)

### **3. PRODUCT-SPECIFIC INFORMATION** (30+ fields)
**Basic Product Details:**
- Item Number
- Brand
- Item Description
- Pack size (units)
- Pack size (weight)

**Container & Packaging:**
- Cases Per Pallet
- TI x HI configuration
- Total Cases Per Container
- Case Net Weight
- Case Gross Weight
- Container Type (40', 20', HQ)

**Delivery Specifications:**
- Delivery State
- Delivery State ZIP Code
- Allowed Container Weight (LBS)
- Allowed Overweight (LBS)
- Total Container Gross Weight
- Total Container Net Weight
- Available Weight Difference

**Dimensional Data:**
- Case Length, Width, Height
- Bag Ideal Dimensions
- Case Ideal Dimensions
- Pallet Ideal Cubing
- New Pallet HI/TI calculations
- Total Cases Per Pallet

### **4. CUSTOMER INFORMATION** (5 fields)
- Customer Name
- Region
- Sales Broker
- Warehouse ZIP Code
- Payment Terms

### **5. COSTS - VENDOR COSTS** (Multiple pricing tiers)

**A. COST at Plant - EXW:**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**B. COST FOB Port Origin:**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**C. COST Pick-up at Plant:**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**D. COST Pick-up at Port US:**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**E. COST Delivery Duty Paid (DDP):**
- Cost per case
- Cost per unit
- Cost per lb
- Previous cost per case
- Previous cost per lb

**F. Factory Fees:**
- Factory Fee percentage
- Factory fee per CASE

### **6. COSTS - SALES BROKER COMMISSION** (3 broker options)
- **Sales Broker A**: Broker %, Broker fee per case
- **Sales Broker B**: Broker %, Broker fee per case
- **Sales Broker C**: Broker %, Broker fee per case

### **7. COSTS - IMPORT COSTS**
- **Import Broker**: Fee %, Fee per case
- **Tariffs**: Duty rate %, Duty per case, Last tariff %
- **GSP**: Margin %, Profit per case

### **8. COSTS - SFS MARGINS**
- SFS Gross Margin %
- Profit per case
- Profit per pallet
- Profit per container
- Previous SFS %
- Previous SFS margin per case

### **9. CUSTOMER PRICING - PICK UP AT PLANT**
**Without Rebate:**
- Price per case
- Price per unit
- Price per lb
- Previous price per case

**With Rebate:**
- Rebate amount
- Price per case
- Price per unit
- Price per lb

### **10. CUSTOMER PRICING - FOB ORIGIN**
**Standard FOB:**
- Price per case
- Price per unit
- Price per lb

**FOB with Rebate:**
- Rebate amount
- Price per case
- Price per unit
- Price per lb

### **11. CUSTOMER PRICING - DAP PORT USA**
- Cases per container
- Vessel freight per case
- Price per case
- Price per unit
- Price per lb

### **12. CUSTOMER PRICING - DDP (DELIVERED)**
- Inland freight per case
- Price per case
- Price per unit
- Price per lb

### **13-17. ADDITIONAL TRACKING** (From old template)
- Last updated infosheet date
- Review notes (yearly contract status, stock status, etc.)
- Updated status tracking
- Historical pricing comparisons
- AI database integration notes

---

## 🎯 KEY BUSINESS REQUIREMENTS

### **1. Multi-Tier Pricing System**
The customer sells products with **4 different INCOTERMS**:
- **EXW** (Ex Works) - Pickup at plant
- **FOB** (Free on Board) - Delivered to port
- **DAP** (Delivered at Place) - Delivered to US port
- **DDP** (Delivered Duty Paid) - Full delivery with duties

Each pricing tier needs:
- Base price calculations
- With/without rebate options
- Historical price tracking
- Per case, per unit, per lb breakdowns

### **2. Cost Waterfall Tracking**
Complete cost flow from vendor to customer:
```
Supplier Cost (EXW)
  ↓
+ Factory Fees
  ↓
= FOB Cost
  ↓
+ Sales Broker Commission
  ↓
+ Import Broker Fees
  ↓
+ Tariffs/Duties
  ↓
+ SFS Margin
  ↓
= Customer Price (EXW/FOB/DAP/DDP)
  ↓
± Rebates
  ↓
= Final Price
```

### **3. Container Optimization**
Critical for logistics planning:
- Calculate maximum cases per container
- Track weight constraints (52,000 - 53,000 lbs allowed)
- Optimize pallet configurations (TI x HI)
- Calculate total profitability per container

### **4. Historical Price Tracking**
For every cost/price point, track:
- Current value
- Previous value
- Date of change
- Reason for change (AI database notes)

### **5. Multi-Customer Support**
Track different pricing for:
- Different customers (Victory Foods, RD, etc.)
- Different regions (SE, etc.)
- Different sales brokers (KATGO, etc.)
- Different warehouse locations

### **6. Margin Analysis**
Multiple margin calculations:
- GSP margin
- SFS gross margin
- Profit per case
- Profit per pallet
- Profit per container

### **7. Status & Review Tracking**
Product lifecycle management:
- Status flags (N=New, C=Current, T=Temporary)
- Review notes:
  - "YEARLY CONTRACT - CURRENTLY OUT OF STOCK"
  - "HAVE NOT SOLD IN A LONG TIME"
  - "NEEDS UPDATE"
- Last updated dates
- Update frequency tracking

---

## 🤖 AI INTEGRATION REQUIREMENTS

The template explicitly mentions **"AI DATABASE" and "AI SHOULD ASSIST INPUTTING DATA"**

### AI Features Needed:
1. **Auto-fill product specifications** from existing database
2. **Suggest pricing** based on historical data
3. **Validate data entry** (dimensions, weights, calculations)
4. **Flag inconsistencies** (weight vs. dimensions)
5. **Calculate optimal pallet configurations**
6. **Recommend pricing adjustments** based on margin targets
7. **Historical data analysis** for price trend predictions

---

## 📊 SCALE REQUIREMENTS

- **Products**: 450+ products to track
- **Fields per product**: 190+ data fields
- **Customers**: Multiple (Victory Foods, RD, etc.)
- **Categories**: 17 major data categories
- **Price versions**: 4 INCOTERMS × 2 (with/without rebate) = 8 price variants
- **Historical tracking**: Unlimited historical records

---

## 🚀 PORTAL FUNCTIONALITY REQUIREMENTS

### **Core Features:**
1. **Product Master Database** - Centralized product catalog
2. **Vendor Management** - Track all vendor information
3. **Customer Management** - Multiple customers per product
4. **Pricing Engine** - Calculate all pricing tiers automatically
5. **Cost Analysis Dashboard** - Visualize cost breakdowns
6. **Margin Calculator** - Real-time margin analysis
7. **Container Optimizer** - Maximize container utilization
8. **Historical Tracker** - Track all price changes over time
9. **Bulk Upload** - Import from Excel templates
10. **Export Functionality** - Generate reports in Excel format
11. **Search & Filter** - Advanced filtering by any field
12. **Audit Trail** - Track all changes with timestamps
13. **Review System** - Flag products needing updates
14. **AI Assistant** - Help with data entry and validation

### **User Workflows:**
1. **Add New Product** - Guided wizard with AI assistance
2. **Update Costs** - Batch update vendor costs
3. **Calculate Prices** - Automatic price cascade calculations
4. **Analyze Margins** - View profitability by product/customer/container
5. **Generate Reports** - Custom reports for management
6. **Review Products** - Scheduled review workflow for outdated products

---

## 💾 DATABASE SCHEMA (High-Level)

### **Core Tables:**
```
products
  - Basic product info
  - Item number, brand, description
  - Physical specifications (weight, dimensions)
  
vendors
  - Vendor information
  - Country, facility, address
  - Payment terms, INCOTERMS
  
vendor_costs
  - Product-vendor relationship
  - All cost tiers (EXW, FOB, etc.)
  - Historical cost tracking
  
customers
  - Customer information
  - Region, warehouse locations
  - Payment terms
  
customer_pricing
  - Product-customer relationship
  - All price tiers with/without rebates
  - Historical price tracking
  
logistics
  - Container specifications
  - Pallet configurations
  - Weight/dimension calculations
  
fees_and_margins
  - Factory fees
  - Sales broker commissions
  - Import broker fees
  - Tariffs and duties
  - SFS margins
  
price_history
  - Track all price changes
  - Previous values
  - Change dates and reasons
  
product_reviews
  - Status tracking
  - Review notes
  - Update requirements
```

---

## 🎨 UI/UX REQUIREMENTS

### **Main Navigation:**
1. Dashboard (Overview)
2. Products (Master list)
3. Vendors
4. Customers
5. Pricing Engine
6. Cost Analysis
7. Reports
8. Settings

### **Product Detail View:**
- **Tab 1**: General Info
- **Tab 2**: Vendor & Costs
- **Tab 3**: Customer & Pricing
- **Tab 4**: Logistics & Container
- **Tab 5**: Margins & Profitability
- **Tab 6**: History & Changes

### **Key UI Components:**
- Data tables with inline editing
- Cost waterfall visualization
- Margin charts
- Container utilization graphics
- Price comparison tools
- Bulk edit modals
- Export/import wizards

---

## ✅ NEXT STEPS

### **Phase 1: Database Design**
- Design normalized database schema
- Set up Supabase tables with proper relationships
- Create database views for calculations

### **Phase 2: Core Features**
- Product master CRUD operations
- Vendor management
- Customer management
- Basic pricing calculations

### **Phase 3: Advanced Features**
- Multi-tier pricing engine
- Cost waterfall calculations
- Container optimization
- Margin analysis

### **Phase 4: AI Integration**
- Auto-fill functionality
- Price recommendations
- Data validation
- Anomaly detection

### **Phase 5: Reporting & Analytics**
- Custom report builder
- Dashboard widgets
- Export functionality
- Historical analysis

---

## 📝 NOTES

- **Template shows**: This is an ENTERPRISE-GRADE system, not a simple product catalog
- **Customer expects**: Full cost-to-sell tracking with extensive analytics
- **AI emphasis**: Customer wants intelligent data entry assistance
- **Scale**: Built for 450+ products with growth potential
- **Complexity**: 190+ fields per product requires sophisticated data model
- **Excel integration**: Must support import/export of this template format

This is a **complete ERP system for food import/distribution business** with focus on:
- Cost transparency
- Margin optimization
- Multi-customer pricing
- Container logistics
- Historical tracking
