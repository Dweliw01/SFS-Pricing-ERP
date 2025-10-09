# 🚀 SFS Pricing Portal - Local Setup Guide

## Prerequisites Checklist
- ✅ Node.js (v18+) installed
- ✅ Git installed  
- ✅ Supabase project created
- ✅ Project cloned to your PC

## Step-by-Step Setup

### 1. 📁 Navigate to Project Directory
```bash
cd path/to/your/sfs-pricing-portal_v2
```

### 2. 📦 Install Dependencies (Already Done)
```bash
npm install
```

### 3. 🔐 Configure Environment Variables

**IMPORTANT**: You need to update `.env.local` with your Supabase credentials.

1. Go to [Supabase Dashboard](https://app.supabase.com/projects)
2. Select your SFS project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** 
   - **anon public key**

5. Open `.env.local` file and replace the placeholder values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 🗄️ Database Setup (If needed)

If your Supabase database doesn't have the required tables, run:
```bash
# Run the audit trail table creation script
# (Execute audit_trail_table.sql in your Supabase SQL editor)
```

### 5. 🖥️ Start the Development Server
```bash
npm run dev
```

### 6. 🌐 Access the Portal
Open your browser and go to: **http://localhost:3000**

## 🔧 Additional Configuration

### MPC Server (File Upload Processing)
If you want to upload Excel files, make sure your MPC server is running on:
```
http://localhost:3001
```

### Common Issues & Solutions

**Issue**: "Supabase connection failed"
**Solution**: Double-check your `.env.local` file has correct Supabase credentials

**Issue**: "Database tables not found"
**Solution**: Make sure your Supabase project has the required tables:
- products
- product_pricing  
- companies
- shipping_costs
- broker_fees
- audit_trail

**Issue**: "Port 3000 already in use"
**Solution**: 
```bash
# Use a different port
npm run dev -- -p 3001
```

## 🎯 Testing the Setup

1. **Frontend loads**: You should see the SFS Pricing Portal homepage
2. **Database connection**: The portal should display product data (if any exists)
3. **File upload**: Upload functionality works if MPC server is running

## 📞 Next Steps After Setup

Once the portal is running:
1. Test the database connection
2. Verify existing data displays correctly
3. Test any existing features
4. Then we can discuss the customer's new requirements for the overhaul!

---

**Need help?** If you encounter any issues during setup, let me know exactly what error you're seeing.
