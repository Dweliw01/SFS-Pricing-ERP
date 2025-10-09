import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // List all tables using information_schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info')
      .single()
      
    // If RPC doesn't exist, try a direct query to a known table
    if (tablesError) {
      console.log('RPC method not available, trying direct queries...')
      
      // Test different possible table names
      const tableNames = [
        'products',
        'Products', 
        'product',
        'Product',
        'items',
        'inventory'
      ]
      
      const results: any = {}
      
      for (const tableName of tableNames) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            
          results[tableName] = {
            exists: !error,
            error: error?.message || null,
            count: count || 0
          }
          
          // If we found a table with data, get a sample
          if (!error && count && count > 0) {
            const { data: sampleData } = await supabase
              .from(tableName)
              .select('*')
              .limit(1)
              
            results[tableName].sample = sampleData?.[0] || null
            results[tableName].columns = sampleData?.[0] ? Object.keys(sampleData[0]) : []
          }
        } catch (e: any) {
          results[tableName] = {
            exists: false,
            error: e.message
          }
        }
      }
      
      // Also check for RLS policies
      const { data: rlsTest, error: rlsError } = await supabase
        .from('products')
        .select('*')
        .limit(1)
      
      return NextResponse.json({
        method: 'direct_queries',
        tables: results,
        rls: {
          tested: true,
          error: rlsError?.message || null,
          data: rlsTest
        },
        connection: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40),
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
    }
    
    return NextResponse.json({
      method: 'rpc',
      tables: tables,
      error: tablesError
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}