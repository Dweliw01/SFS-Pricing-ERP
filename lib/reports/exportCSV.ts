// lib/reports/exportCSV.ts
// CSV export functionality for master price reports

import { format } from 'date-fns'
import { MasterPriceReportRow, ExportOptions } from './reportTypes'
import { getColumnByKey } from './reportColumns'

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate a CSV file from report data
 * @param data - Array of report rows
 * @param selectedColumns - Array of column keys to include
 * @param options - Export options (filename, include headers, etc.)
 * @returns CSV string
 */
export function generateCSVFile(
  data: MasterPriceReportRow[],
  selectedColumns: string[],
  options?: ExportOptions
): string {
  const includeHeaders = options?.includeHeaders !== false // Default to true

  let csv = ''

  // Add headers
  if (includeHeaders) {
    const headers = selectedColumns.map(columnKey => {
      const columnDef = getColumnByKey(columnKey)
      return columnDef ? columnDef.label : columnKey
    })
    csv += headers.map(escapeCSVValue).join(',') + '\n'
  }

  // Add data rows
  data.forEach(row => {
    const values = selectedColumns.map(columnKey => {
      const columnDef = getColumnByKey(columnKey)
      const value = row[columnKey as keyof MasterPriceReportRow]

      // Format value based on column type
      return formatCSVValue(value, columnDef?.dataType)
    })
    csv += values.map(escapeCSVValue).join(',') + '\n'
  })

  return csv
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format cell value for CSV based on data type
 */
function formatCSVValue(value: any, dataType?: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  switch (dataType) {
    case 'currency':
      return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value)

    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(2)}%` : String(value)

    case 'number':
      return typeof value === 'number' ? value.toFixed(2) : String(value)

    case 'boolean':
      return value ? 'Yes' : 'No'

    case 'date':
      return value ? format(new Date(value), 'yyyy-MM-dd') : ''

    case 'string':
    default:
      return String(value)
  }
}

/**
 * Escape CSV value (handle quotes, commas, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return '"' + stringValue.replace(/"/g, '""') + '"'
  }

  return stringValue
}

// ============================================================================
// DOWNLOAD HELPER
// ============================================================================

/**
 * Trigger download of CSV file in browser
 */
export function downloadCSVFile(
  csv: string,
  filename: string = 'master-price-report.csv'
): void {
  // Create blob from CSV string
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
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
export function generateCSVFilename(prefix: string = 'master-price-report'): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss')
  return `${prefix}-${timestamp}.csv`
}

// ============================================================================
// EXPORT PRESET FUNCTIONS
// ============================================================================

/**
 * Export complete master price report (all columns) as CSV
 */
export function exportCompleteCSV(data: MasterPriceReportRow[]): string {
  // Get all column keys
  const allColumns = Object.keys(data[0] || {})

  return generateCSVFile(data, allColumns, {
    format: 'csv',
    filename: generateCSVFilename('complete-master-price-report'),
    includeHeaders: true
  })
}

/**
 * Export basic pricing report as CSV
 */
export function exportBasicPricingCSV(data: MasterPriceReportRow[]): string {
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

  return generateCSVFile(data, basicColumns, {
    format: 'csv',
    filename: generateCSVFilename('basic-pricing-report'),
    includeHeaders: true
  })
}

/**
 * Export margin analysis report as CSV
 */
export function exportMarginAnalysisCSV(data: MasterPriceReportRow[]): string {
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

  return generateCSVFile(data, marginColumns, {
    format: 'csv',
    filename: generateCSVFilename('margin-analysis-report'),
    includeHeaders: true
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert CSV string to downloadable blob
 */
export function csvToBlob(csv: string): Blob {
  return new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  })
}

/**
 * Parse CSV data (useful for testing)
 */
export function parseCSV(csv: string): string[][] {
  const lines = csv.split('\n').filter(line => line.trim() !== '')

  return lines.map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"' && inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else if (char === '"') {
        // Toggle quotes
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        // End of value
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }

    // Add last value
    values.push(current)

    return values
  })
}
