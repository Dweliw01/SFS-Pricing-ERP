// lib/reports/exportExcel.ts
// Excel export functionality for master price reports

import * as XLSX from 'xlsx'
import { MasterPriceReportRow, ExportOptions } from './reportTypes'
import { getColumnByKey } from './reportColumns'

// ============================================================================
// DATE FORMATTING HELPERS
// ============================================================================

/**
 * Format date to YYYY-MM-DD format
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date to YYYY-MM-DD HH:mm:ss format
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Format date to YYYY-MM-DD-HHmmss format for filenames
 */
function formatDateTimeForFilename(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate an Excel file from report data
 * @param data - Array of report rows
 * @param selectedColumns - Array of column keys to include
 * @param options - Export options (filename, sheet name, etc.)
 * @returns ArrayBuffer of the Excel file
 */
export function generateExcelFile(
  data: MasterPriceReportRow[],
  selectedColumns: string[],
  options?: ExportOptions
): ArrayBuffer {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Generate main data sheet
  const mainSheet = generateDataSheet(data, selectedColumns)
  XLSX.utils.book_append_sheet(
    workbook,
    mainSheet,
    options?.sheetName || 'Master Price Report'
  )

  // Generate summary sheet
  const summarySheet = generateSummarySheet(data)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Write workbook to buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true
  })

  return excelBuffer
}

/**
 * Generate the main data sheet with formatted columns
 */
function generateDataSheet(
  data: MasterPriceReportRow[],
  selectedColumns: string[]
): XLSX.WorkSheet {
  // Prepare data for export
  const exportData = data.map(row => {
    const exportRow: any = {}

    selectedColumns.forEach(columnKey => {
      const columnDef = getColumnByKey(columnKey)
      const value = row[columnKey as keyof MasterPriceReportRow]

      if (columnDef) {
        // Format the value based on column type
        exportRow[columnDef.label] = formatCellValue(value, columnDef.dataType)
      } else {
        exportRow[columnKey] = value
      }
    })

    return exportRow
  })

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Apply column widths
  const columnWidths = selectedColumns.map(columnKey => {
    const columnDef = getColumnByKey(columnKey)
    return { wch: columnDef?.width ? columnDef.width / 8 : 15 }
  })
  worksheet['!cols'] = columnWidths

  // Apply header styling
  applyHeaderStyling(worksheet, selectedColumns)

  // Apply data formatting
  applyDataFormatting(worksheet, exportData.length, selectedColumns)

  return worksheet
}

/**
 * Generate a summary sheet with statistics
 */
function generateSummarySheet(data: MasterPriceReportRow[]): XLSX.WorkSheet {
  // Calculate summary statistics
  const uniqueProducts = new Set(data.map(row => row.product_id)).size
  const uniqueCustomers = new Set(data.filter(row => row.customer_id).map(row => row.customer_id)).size
  const uniqueVendors = new Set(data.filter(row => row.vendor_id).map(row => row.vendor_id)).size

  const productsNew = data.filter(row => row.status === 'N').length
  const productsCurrent = data.filter(row => row.status === 'C').length
  const productsTemporary = data.filter(row => row.status === 'T').length

  const productsInternational = data.filter(row => row.product_type === 'I').length
  const productsDomestic = data.filter(row => row.product_type === 'D').length

  // Calculate average FOB margin
  const fobMargins = data
    .filter(row => row.fob_margin_percent !== null && row.fob_margin_percent !== undefined)
    .map(row => row.fob_margin_percent!)

  const avgFobMargin = fobMargins.length > 0
    ? fobMargins.reduce((sum, m) => sum + m, 0) / fobMargins.length
    : 0

  // Calculate total profit potential
  const totalProfit40ft = data
    .filter(row => row.profit_per_40ft_fob !== null && row.profit_per_40ft_fob !== undefined)
    .reduce((sum, row) => sum + row.profit_per_40ft_fob!, 0)

  // Create summary data
  const summaryData = [
    { Metric: 'Report Generated', Value: formatDateTime(new Date()) },
    { Metric: 'Total Records', Value: data.length },
    { Metric: '', Value: '' },
    { Metric: '=== PRODUCTS ===', Value: '' },
    { Metric: 'Unique Products', Value: uniqueProducts },
    { Metric: 'Products - New', Value: productsNew },
    { Metric: 'Products - Current', Value: productsCurrent },
    { Metric: 'Products - Temporary', Value: productsTemporary },
    { Metric: 'Products - International', Value: productsInternational },
    { Metric: 'Products - Domestic', Value: productsDomestic },
    { Metric: '', Value: '' },
    { Metric: '=== CUSTOMERS & VENDORS ===', Value: '' },
    { Metric: 'Unique Customers', Value: uniqueCustomers },
    { Metric: 'Unique Vendors', Value: uniqueVendors },
    { Metric: '', Value: '' },
    { Metric: '=== PROFITABILITY ===', Value: '' },
    { Metric: 'Average FOB Margin %', Value: avgFobMargin.toFixed(2) + '%' },
    { Metric: 'Total Profit (40ft Containers)', Value: '$' + totalProfit40ft.toFixed(2) },
  ]

  const worksheet = XLSX.utils.json_to_sheet(summaryData)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 35 }, // Metric column
    { wch: 25 }  // Value column
  ]

  return worksheet
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format cell value based on data type
 */
function formatCellValue(value: any, dataType: string): any {
  if (value === null || value === undefined) {
    return ''
  }

  switch (dataType) {
    case 'currency':
      return typeof value === 'number' ? `$${value.toFixed(2)}` : value

    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(2)}%` : value

    case 'number':
      return typeof value === 'number' ? Number(value.toFixed(2)) : value

    case 'boolean':
      return value ? 'Yes' : 'No'

    case 'date':
      return value ? formatDate(new Date(value)) : ''

    case 'string':
    default:
      return value
  }
}

/**
 * Apply header styling to the worksheet
 */
function applyHeaderStyling(worksheet: XLSX.WorkSheet, columns: string[]): void {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

  // Style first row (headers)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellAddress]) continue

    // Apply bold and background color
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }
}

/**
 * Apply data formatting to cells based on column type
 */
function applyDataFormatting(
  worksheet: XLSX.WorkSheet,
  rowCount: number,
  columns: string[]
): void {
  if (!worksheet['!ref']) return

  const range = XLSX.utils.decode_range(worksheet['!ref'])

  for (let row = 1; row <= rowCount; row++) { // Start from 1 to skip header
    columns.forEach((columnKey, colIndex) => {
      const columnDef = getColumnByKey(columnKey)
      if (!columnDef) return

      const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex })
      if (!worksheet[cellAddress]) return

      // Apply number format based on data type
      switch (columnDef.dataType) {
        case 'currency':
          worksheet[cellAddress].z = '$#,##0.00'
          break

        case 'percentage':
          worksheet[cellAddress].z = '0.00%'
          break

        case 'number':
          worksheet[cellAddress].z = '#,##0.00'
          break

        case 'date':
          worksheet[cellAddress].z = 'yyyy-mm-dd'
          break
      }

      // Apply alignment
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {}
      }

      worksheet[cellAddress].s.alignment = {
        horizontal: columnDef.dataType === 'number' || columnDef.dataType === 'currency' || columnDef.dataType === 'percentage'
          ? 'right'
          : 'left',
        vertical: 'top'
      }
    })
  }
}

// ============================================================================
// DOWNLOAD HELPER
// ============================================================================

/**
 * Trigger download of Excel file in browser
 */
export function downloadExcelFile(
  buffer: ArrayBuffer,
  filename: string = 'master-price-report.xlsx'
): void {
  // Create blob from buffer
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string = 'master-price-report'): string {
  const timestamp = formatDateTimeForFilename(new Date())
  return `${prefix}-${timestamp}.xlsx`
}

// ============================================================================
// EXPORT PRESET FUNCTIONS
// ============================================================================

/**
 * Export complete master price report (all columns)
 */
export function exportCompleteReport(data: MasterPriceReportRow[]): ArrayBuffer {
  // Get all column keys
  const allColumns = Object.keys(data[0] || {})

  return generateExcelFile(data, allColumns, {
    format: 'excel',
    filename: generateFilename('complete-master-price-report'),
    sheetName: 'Complete Report'
  })
}

/**
 * Export basic pricing report
 */
export function exportBasicPricingReport(data: MasterPriceReportRow[]): ArrayBuffer {
  const basicColumns = [
    'master_list_number',
    'item_number',
    'brand',
    'vendor_name',
    'customer_name',
    'fob_cost_per_case',
    'fob_price_per_case',
    'fob_margin_amount',
    'fob_margin_percent'
  ]

  return generateExcelFile(data, basicColumns, {
    format: 'excel',
    filename: generateFilename('basic-pricing-report'),
    sheetName: 'Basic Pricing'
  })
}

/**
 * Export margin analysis report
 */
export function exportMarginAnalysisReport(data: MasterPriceReportRow[]): ArrayBuffer {
  const marginColumns = [
    'item_number',
    'brand',
    'customer_name',
    'fob_cost_per_case',
    'total_import_costs_per_case',
    'landed_cost_per_case',
    'fob_price_per_case',
    'fob_margin_amount',
    'fob_margin_percent',
    'profit_per_pallet_fob',
    'profit_per_40ft_fob'
  ]

  return generateExcelFile(data, marginColumns, {
    format: 'excel',
    filename: generateFilename('margin-analysis-report'),
    sheetName: 'Margin Analysis'
  })
}
