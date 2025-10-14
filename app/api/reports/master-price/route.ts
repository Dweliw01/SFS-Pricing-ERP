// app/api/reports/master-price/route.ts
// API route for fetching master price report data

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchMasterPriceReport,
  fetchMasterPriceReportWithStats
} from '@/lib/reports/reportQueries'
import {
  ReportFilters,
  ReportSortConfig,
  ReportPagination
} from '@/lib/reports/reportTypes'

// ============================================================================
// GET - Fetch master price report data
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters from query params
    const filters: ReportFilters = {
      // Product filters
      productIds: searchParams.get('productIds')?.split(',').filter(Boolean),
      customerIds: searchParams.get('customerIds')?.split(',').filter(Boolean),
      vendorIds: searchParams.get('vendorIds')?.split(',').filter(Boolean),

      // Status filters
      status: searchParams.get('status')?.split(',') as ('N' | 'C' | 'T')[] | undefined,
      productType: searchParams.get('productType')?.split(',') as ('I' | 'D')[] | undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,

      // Category filters
      categories: searchParams.get('categories')?.split(',').filter(Boolean),
      brands: searchParams.get('brands')?.split(',').filter(Boolean),
      regions: searchParams.get('regions')?.split(',').filter(Boolean),

      // Search
      searchTerm: searchParams.get('searchTerm') || undefined,

      // Boolean filters
      needsUpdate: searchParams.get('needsUpdate') === 'true' ? true : undefined,
      hasVendorCost: searchParams.get('hasVendorCost') === 'true' ? true : undefined,
      hasCustomerPricing: searchParams.get('hasCustomerPricing') === 'true' ? true : undefined,
      hasImportCost: searchParams.get('hasImportCost') === 'true' ? true : undefined,

      // Margin filters
      minMarginPercent: searchParams.get('minMarginPercent') ? Number(searchParams.get('minMarginPercent')) : undefined,
      maxMarginPercent: searchParams.get('maxMarginPercent') ? Number(searchParams.get('maxMarginPercent')) : undefined,

      // Date filters
      effectiveDateFrom: searchParams.get('effectiveDateFrom') || undefined,
      effectiveDateTo: searchParams.get('effectiveDateTo') || undefined,
    }

    // Parse sort config
    const sortField = searchParams.get('sortField')
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' | undefined
    const sort: ReportSortConfig | undefined = sortField ? {
      field: sortField,
      direction: sortDirection || 'asc'
    } : undefined

    // Parse pagination
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 50
    const pagination: ReportPagination = { page, pageSize }

    // Include statistics?
    const includeStats = searchParams.get('includeStats') === 'true'

    // Fetch report data
    const result = includeStats
      ? await fetchMasterPriceReportWithStats(filters, sort, pagination)
      : await fetchMasterPriceReport(filters, sort, pagination)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in master price report API:', error)
    return NextResponse.json(
      {
        success: false,
        data: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 },
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
