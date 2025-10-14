// app/api/reports/export/excel/route.ts
// API route for exporting reports to Excel

import { NextRequest, NextResponse } from 'next/server'
import { fetchMasterPriceReport } from '@/lib/reports/reportQueries'
import { generateExcelFile, generateFilename } from '@/lib/reports/exportExcel'
import { ReportFilters } from '@/lib/reports/reportTypes'

// ============================================================================
// POST - Export report data to Excel
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

    // Generate Excel file
    const excelBuffer = generateExcelFile(result.data, columns || [], {
      format: 'excel',
      filename: filename || generateFilename()
    })

    // Return file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename || generateFilename()}"`,
        'Content-Length': excelBuffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate Excel file'
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
