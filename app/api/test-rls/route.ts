import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Create a client with different configurations
  const supabaseWithoutRLS = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  })
  
  try {
    // Test 1: Try to count rows using SQL
    const { data: sqlCount, error: sqlError } = await supabaseWithoutRLS
      .rpc('count_products')
      .single()
    
    // Test 2: Direct query with explicit schema
    const { data: directData, error: directError, count } = await supabaseWithoutRLS
      .schema('public')
      .from('products')
      .select('*', { count: 'exact' })
      .limit(5)
    
    // Test 3: Check if RLS is enabled
    const { data: rlsCheck, error: rlsCheckError } = await supabaseWithoutRLS
      .from('products')
      .select('*')
      .is('is_active', true)
      .limit(5)
    
    // Test 4: Try without any filters
    const { data: noFilterData, error: noFilterError } = await supabaseWithoutRLS
      .from('products')
      .select('id, item_number, status, is_active')
      .limit(10)
      
    // Test 5: Check with service role key if available (this would bypass RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let serviceRoleTest = null
    
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .limit(5)
        
      serviceRoleTest = {
        hasServiceKey: true,
        count: data?.length || 0,
        error: error?.message || null,
        sample: data?.[0] || null
      }
    } else {
      serviceRoleTest = {
        hasServiceKey: false,
        message: 'Service role key not configured'
      }
    }
    
    return NextResponse.json({
      tests: {
        sqlCount: {
          data: sqlCount,
          error: sqlError?.message || null
        },
        directQuery: {
          count: directData?.length || 0,
          totalCount: count,
          error: directError?.message || null,
          sample: directData?.[0] || null
        },
        rlsCheck: {
          count: rlsCheck?.length || 0,
          error: rlsCheckError?.message || null
        },
        noFilter: {
          count: noFilterData?.length || 0,
          error: noFilterError?.message || null,
          data: noFilterData || []
        },
        serviceRole: serviceRoleTest
      },
      diagnosis: {
        rlsEnabled: (directData?.length === 0 && !directError) ? 
          'RLS is likely enabled with no policies allowing read access' : 
          'Data might not exist or other issue',
        recommendation: 'Check Supabase dashboard -> Authentication -> Policies for the products table'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}