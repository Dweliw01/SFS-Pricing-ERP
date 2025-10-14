// app/api/reports/export/csv/route.ts
// API route for exporting reports to CSV

import { NextRequest, NextResponse } from 'next/server'
import { fetchMasterPriceReport } from '@/lib/reports/reportQueries'
import { generateCSVFile, generateCSVFilename } from '@/lib/reports/exportCSV'
import { ReportFilters } from '@/lib/reports/reportTypes'

// ============================================================================
// POST - Export report data to CSV
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters, columns, filename } = body

    // Fetch all data (no pagination for export)
    const result = await fetchMasterPriceReport(filters as ReportFilters)

    if (!result.success || result.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data available for export'
        },
        { status: 400 }
      )
    }

    // Generate CSV file
    const csvContent = generateCSVFile(result.data, columns || [], {
      format: 'csv',
      filename: filename || generateCSVFilename(),
      includeHeaders: true
    })

    // Return file as response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${filename || generateCSVFilename()}"`,
        'Content-Length': Buffer.byteLength(csvContent, 'utf8').toString(),
      },
    })
  } catch (error: any) {
    console.error('Error exporting to CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate CSV file'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
