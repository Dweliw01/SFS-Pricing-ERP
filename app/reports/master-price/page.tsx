'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Download, FileText, Filter, X, Search, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { REPORT_COLUMN_CATEGORIES, getDefaultColumns, COLUMN_PRESETS, getColumnByKey } from '@/lib/reports/reportColumns'
import { MasterPriceReportRow, ReportFilters } from '@/lib/reports/reportTypes'

export default function MasterPriceReportPage() {
  const searchParams = useSearchParams()

  // State
  const [filters, setFilters] = useState<ReportFilters>({
    status: ['C'], // Default to "Current" products
    isActive: true
  })
  const [selectedColumns, setSelectedColumns] = useState<string[]>(getDefaultColumns())
  const [reportData, setReportData] = useState<MasterPriceReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [reportTitle, setReportTitle] = useState('Master Price Report')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)
  const [totalRecords, setTotalRecords] = useState(0)

  // Products, customers, vendors for selection
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])

  // Handle preset from URL on mount
  useEffect(() => {
    const preset = searchParams.get('preset')
    if (preset && preset in COLUMN_PRESETS) {
      setSelectedColumns(COLUMN_PRESETS[preset as keyof typeof COLUMN_PRESETS])

      // Update report title based on preset
      const titles: Record<string, string> = {
        margins: 'Margin Analysis Report',
        costs: 'Cost Comparison Report',
        basic: 'Basic Price Report',
        full: 'Complete Master Price Report'
      }
      setReportTitle(titles[preset] || 'Master Price Report')
    }
  }, [searchParams])

  // Load report data
  const loadReportData = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())
      params.append('includeStats', 'true')

      // Add filters
      if (filters.productIds?.length) params.append('productIds', filters.productIds.join(','))
      if (filters.customerIds?.length) params.append('customerIds', filters.customerIds.join(','))
      if (filters.vendorIds?.length) params.append('vendorIds', filters.vendorIds.join(','))
      if (filters.status?.length) params.append('status', filters.status.join(','))
      if (filters.productType?.length) params.append('productType', filters.productType.join(','))
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)

      const response = await fetch(`/api/reports/master-price?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setReportData(result.data)
        setTotalRecords(result.pagination.total)
      }
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true)

      const response = await fetch('/api/reports/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          columns: selectedColumns,
          filename: `master-price-report-${new Date().toISOString().split('T')[0]}.xlsx`
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `master-price-report-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setExporting(false)
    }
  }

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setExporting(true)

      const response = await fetch('/api/reports/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          columns: selectedColumns,
          filename: `master-price-report-${new Date().toISOString().split('T')[0]}.csv`
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `master-price-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  // Toggle column selection
  const toggleColumn = (columnKey: string) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(k => k !== columnKey))
    } else {
      setSelectedColumns([...selectedColumns, columnKey])
    }
  }

  // Select all columns in a category
  const toggleCategory = (categoryId: string) => {
    const category = REPORT_COLUMN_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return

    const categoryColumnKeys = category.columns.map(c => c.key)
    const allSelected = categoryColumnKeys.every(k => selectedColumns.includes(k))

    if (allSelected) {
      // Deselect all
      setSelectedColumns(selectedColumns.filter(k => !categoryColumnKeys.includes(k)))
    } else {
      // Select all
      const newColumns = [...new Set([...selectedColumns, ...categoryColumnKeys])]
      setSelectedColumns(newColumns)
    }
  }

  // Apply preset
  const applyPreset = (presetName: keyof typeof COLUMN_PRESETS, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setSelectedColumns(COLUMN_PRESETS[presetName])
  }

  // Calculate totals
  const totalPages = Math.ceil(totalRecords / pageSize)

  // Helper function to get column label
  const getColumnLabel = (columnKey: string): string => {
    const column = getColumnByKey(columnKey)
    return column ? column.label : columnKey.replace(/_/g, ' ')
  }

  // Helper function to format cell value
  const formatCellValue = (value: any, columnKey: string): string => {
    if (value === null || value === undefined) return '-'

    const column = getColumnByKey(columnKey)
    if (column?.format) {
      return column.format(value)
    }

    return String(value)
  }

  // Helper function to get header color based on category
  const getHeaderColor = (columnKey: string): string => {
    const column = getColumnByKey(columnKey)
    if (!column) return 'bg-gray-100 text-gray-700'

    const categoryColors: Record<string, string> = {
      'product_info': 'bg-blue-100 text-blue-800',
      'vendor_info': 'bg-purple-100 text-purple-800',
      'physical_specs': 'bg-gray-100 text-gray-700',
      'container_logistics': 'bg-teal-100 text-teal-800',
      'customer_info': 'bg-green-100 text-green-800',
      'vendor_costs_exw': 'bg-orange-100 text-orange-800',
      'vendor_costs_fob': 'bg-red-100 text-red-800',
      'vendor_costs_pickup_plant': 'bg-orange-100 text-orange-700',
      'vendor_costs_pickup_port': 'bg-orange-100 text-orange-700',
      'vendor_costs_ddp': 'bg-red-100 text-red-700',
      'factory_fees': 'bg-yellow-100 text-yellow-800',
      'import_costs': 'bg-indigo-100 text-indigo-800',
      'customer_pricing_exw': 'bg-emerald-100 text-emerald-800',
      'customer_pricing_fob': 'bg-green-100 text-green-800',
      'customer_pricing_dap': 'bg-lime-100 text-lime-800',
      'customer_pricing_ddp': 'bg-green-100 text-green-700',
      'margins_profitability': 'bg-pink-100 text-pink-800',
      'dates_status': 'bg-slate-100 text-slate-700',
      'notes': 'bg-amber-100 text-amber-800'
    }

    return categoryColors[column.category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{reportTitle}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {totalRecords} records • {selectedColumns.length} columns selected
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                <FileText size={18} className="mr-2" />
                Columns ({selectedColumns.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({ status: ['C'], isActive: true })
                  setSearchTerm('')
                }}
              >
                <X size={16} className="mr-1" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Item #, brand, description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {['N', 'C', 'T'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status as any)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...(filters.status || []), status as any]
                            : filters.status?.filter(s => s !== status)
                          setFilters({ ...filters, status: newStatus })
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {status === 'N' ? 'New' : status === 'C' ? 'Current' : 'Temporary'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <div className="space-y-2">
                  {['I', 'D'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.productType?.includes(type as any)}
                        onChange={(e) => {
                          const newType = e.target.checked
                            ? [...(filters.productType || []), type as any]
                            : filters.productType?.filter(t => t !== type)
                          setFilters({ ...filters, productType: newType })
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {type === 'I' ? 'International' : 'Domestic'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="primary" onClick={loadReportData}>
                <Filter size={18} className="mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Column Selector */}
        {showColumnSelector && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Columns</h2>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={(e) => applyPreset('basic', e)}>
                  Basic
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={(e) => applyPreset('margins', e)}>
                  Margins
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={(e) => applyPreset('costs', e)}>
                  Costs
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={(e) => applyPreset('full', e)}>
                  All Columns
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {REPORT_COLUMN_CATEGORIES.map(category => {
                const categoryColumnKeys = category.columns.map(c => c.key)
                const allSelected = categoryColumnKeys.every(k => selectedColumns.includes(k))
                const someSelected = categoryColumnKeys.some(k => selectedColumns.includes(k))

                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center mb-3 font-medium">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={input => {
                          if (input) input.indeterminate = someSelected && !allSelected
                        }}
                        onChange={() => toggleCategory(category.id)}
                        className="mr-2"
                      />
                      {category.label} ({category.columns.length})
                    </label>
                    <div className="ml-6 space-y-1 text-sm">
                      {category.columns.slice(0, 5).map(column => (
                        <label key={column.key} className="flex items-center text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            className="mr-2"
                          />
                          {column.label}
                        </label>
                      ))}
                      {category.columns.length > 5 && (
                        <div className="text-xs text-gray-400 ml-5">
                          +{category.columns.length - 5} more...
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Generate Report</h2>
              <p className="text-sm text-gray-600">
                Preview data or export to Excel/CSV format
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={loadReportData}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Preview Report'}
              </Button>
              <Button
                variant="primary"
                onClick={exportToExcel}
                disabled={exporting || reportData.length === 0}
              >
                <Download size={18} className="mr-2" />
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
              <Button
                variant="secondary"
                onClick={exportToCSV}
                disabled={exporting || reportData.length === 0}
              >
                <FileSpreadsheet size={18} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Table - Excel Style */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Preview ({reportData.length} records)
              </h2>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t border-gray-200">
              <table className="w-full border-collapse">
                {/* Sticky Header */}
                <thead className="sticky top-0 z-10">
                  <tr>
                    {selectedColumns.map((columnKey, idx) => {
                      const column = getColumnByKey(columnKey)
                      const width = column?.width || 120
                      const isFirstColumn = idx === 0
                      const headerColor = getHeaderColor(columnKey)

                      return (
                        <th
                          key={columnKey}
                          className={`
                            px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide
                            border-r border-b border-gray-300 whitespace-nowrap
                            ${headerColor}
                            ${isFirstColumn ? 'sticky left-0 z-20 shadow-sm' : ''}
                          `}
                          style={{ minWidth: `${width}px`, maxWidth: `${width}px` }}
                        >
                          {getColumnLabel(columnKey)}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {reportData.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`
                        hover:bg-blue-50 transition-colors
                        ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      `}
                    >
                      {selectedColumns.map((columnKey, colIdx) => {
                        const column = getColumnByKey(columnKey)
                        const width = column?.width || 120
                        const isFirstColumn = colIdx === 0
                        const value = row[columnKey as keyof MasterPriceReportRow]
                        const formattedValue = formatCellValue(value, columnKey)

                        return (
                          <td
                            key={columnKey}
                            className={`
                              px-2 py-1 text-xs text-gray-900 border-r border-b border-gray-200 whitespace-nowrap
                              ${isFirstColumn ? 'sticky left-0 z-10 font-medium bg-inherit' : ''}
                            `}
                            style={{ minWidth: `${width}px`, maxWidth: `${width}px` }}
                            title={formattedValue}
                          >
                            <div className="truncate">{formattedValue}</div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && reportData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-6">
              Click "Preview Report" to load data with your current filters
            </p>
            <Button variant="primary" onClick={loadReportData}>
              Load Report Data
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
