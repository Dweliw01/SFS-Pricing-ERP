import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: tables, error: tablesError } = await supabase
      .from('products')
      .select('count')
      .limit(1)

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
    }

    // Test 2: Get all products without filters
    const { data: allProducts, error: allProductsError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Test 3: Get only active products
    const { data: activeProducts, error: activeProductsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    // Test 4: Get products with any is_active value
    const { data: anyActiveProducts, error: anyActiveError } = await supabase
      .from('products')
      .select('is_active, id, item_number, status')
      .limit(10)

    return NextResponse.json({
      connection: 'success',
      tests: {
        tableCheck: {
          success: !tablesError,
          error: tablesError?.message || null
        },
        allProducts: {
          success: !allProductsError,
          count: allProducts?.length || 0,
          totalCount: count,
          error: allProductsError?.message || null,
          sample: allProducts?.[0] || null
        },
        activeProducts: {
          success: !activeProductsError,
          count: activeProducts?.length || 0,
          error: activeProductsError?.message || null
        },
        anyActiveProducts: {
          success: !anyActiveError,
          count: anyActiveProducts?.length || 0,
          data: anyActiveProducts || [],
          error: anyActiveError?.message || null
        }
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      connection: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}