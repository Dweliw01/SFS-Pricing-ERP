# How to Run the RLS Migration

This migration will fix Row Level Security (RLS) issues for ALL your tables.

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard:
   https://supabase.com/dashboard/project/wewhiflyfixxahjyepan

2. Navigate to **SQL Editor** (in the left sidebar)

3. Click **New query**

4. **FIRST** - Check what tables you have:
   - Copy contents of `supabase/migrations/check_tables.sql`
   - Run it to see all your tables and record counts

5. **THEN** - Choose ONE of these options:

   ### Option A: Enable RLS with Public Read Access (Recommended)
   - Copy contents of `supabase/migrations/002_enable_rls_all_tables.sql`
   - This enables RLS but allows public read access to all tables
   
   ### Option B: Disable RLS Completely (Quick Fix for Development)
   - Copy contents of `supabase/migrations/003_disable_rls_all_tables.sql`
   - This disables all RLS (less secure but simpler for development)

6. Paste your chosen migration into the SQL editor

7. Click **Run** (or press Ctrl+Enter)

8. You should see success messages for each table

## Option 2: Using Supabase CLI (For CI/CD)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link to your project
supabase link --project-ref wewhiflyfixxahjyepan

# Run the migration
supabase db push
```

## Option 3: Quick Fix - Disable RLS Temporarily

If you just want to test quickly without policies:

1. Go to **Table Editor** in Supabase Dashboard
2. Click on the **products** table
3. Click the **RLS enabled** toggle to disable it
4. Your data will be immediately accessible (but less secure)

## After Running the Migration

1. Refresh your application at http://localhost:3002
2. Your products data should now be visible
3. The migration creates:
   - Public read access for anyone (including anonymous users)
   - Write access (insert, update, delete) for authenticated users only

## Troubleshooting

If data still doesn't appear:
1. Check the browser console for errors
2. Visit http://localhost:3002/api/test-db to verify the connection
3. Ensure your data exists in the `products` table (not another table name)
4. Check that `is_active` field is set to `true` for your products

## Security Note

The current policies allow anyone to read your products data. For production:
- Consider adding more restrictive policies
- Use authentication to control access
- Add row-level filtering based on user roles or ownership