// app/api/reports/stats/route.ts
// API route for fetching report statistics

import { NextRequest, NextResponse } from 'next/server'
import { fetchReportStatistics } from '@/lib/reports/reportQueries'

// ============================================================================
// GET - Fetch report statistics
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    // Fetch statistics (no filters = all data)
    const stats = await fetchReportStatistics()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('Error in report stats API:', error)
    return NextResponse.json(
      {
        success: false,
        data: {
          totalProducts: 0,
          totalCustomers: 0,
          totalVendors: 0,
          averageMarginPercent: 0
        },
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// OPTIONS - CORS support
// ============================================================================
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
