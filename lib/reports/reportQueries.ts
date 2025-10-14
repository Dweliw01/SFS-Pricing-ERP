// lib/reports/reportQueries.ts
// Database query functions for generating reports

import { supabase } from '../supabase'
import {
  MasterPriceReportRow,
  ReportFilters,
  ReportSortConfig,
  ReportPagination,
  ReportStatistics,
  ReportDataResponse
} from './reportTypes'

// ============================================================================
// MAIN REPORT QUERY FUNCTIONS
// ============================================================================

/**
 * Fetch master price report data with filters, sorting, and pagination
 */
export async function fetchMasterPriceReport(
  filters?: ReportFilters,
  sort?: ReportSortConfig,
  pagination?: ReportPagination
): Promise<ReportDataResponse> {
  try {
    // Start with base query on the view
    let query = supabase
      .from('v_master_price_report')
      .select('*', { count: 'exact' })

    // Apply filters
    query = applyFilters(query, filters)

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      // Default sort by master_list_number
      query = query.order('master_list_number', { ascending: true })
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching master price report:', error)
      return {
        success: false,
        data: [],
        pagination: {
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || 50,
          total: 0,
          totalPages: 0
        },
        error: error.message
      }
    }

    const totalRecords = count || 0
    const pageSize = pagination?.pageSize || 50
    const totalPages = Math.ceil(totalRecords / pageSize)

    return {
      success: true,
      data: (data as MasterPriceReportRow[]) || [],
      pagination: {
        page: pagination?.page || 1,
        pageSize,
        total: totalRecords,
        totalPages
      }
    }
  } catch (error: any) {
    console.error('Error in fetchMasterPriceReport:', error)
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0
      },
      error: error.message || 'Unknown error occurred'
    }
  }
}

/**
 * Fetch master price report with statistics
 */
export async function fetchMasterPriceReportWithStats(
  filters?: ReportFilters,
  sort?: ReportSortConfig,
  pagination?: ReportPagination
): Promise<ReportDataResponse> {
  // Get main report data
  const reportResponse = await fetchMasterPriceReport(filters, sort, pagination)

  if (!reportResponse.success) {
    return reportResponse
  }

  // Get statistics
  const statistics = await fetchReportStatistics(filters)

  return {
    ...reportResponse,
    statistics
  }
}

// ============================================================================
// FILTER APPLICATION
// ============================================================================

/**
 * Apply filters to a Supabase query
 */
function applyFilters(query: any, filters?: ReportFilters): any {
  if (!filters) return query

  // Product ID filter
  if (filters.productIds && filters.productIds.length > 0) {
    query = query.in('product_id', filters.productIds)
  }

  // Customer ID filter
  if (filters.customerIds && filters.customerIds.length > 0) {
    query = query.in('customer_id', filters.customerIds)
  }

  // Vendor ID filter
  if (filters.vendorIds && filters.vendorIds.length > 0) {
    query = query.in('vendor_id', filters.vendorIds)
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  // Product Type filter
  if (filters.productType && filters.productType.length > 0) {
    query = query.in('product_type', filters.productType)
  }

  // Is Active filter
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    query = query.in('brand', filters.brands)
  }

  // Region filter
  if (filters.regions && filters.regions.length > 0) {
    query = query.in('region', filters.regions)
  }

  // Search term (searches across item_number, brand, description)
  if (filters.searchTerm) {
    query = query.or(
      `item_number.ilike.%${filters.searchTerm}%,` +
      `brand.ilike.%${filters.searchTerm}%,` +
      `item_description.ilike.%${filters.searchTerm}%`
    )
  }

  // Needs update filter
  if (filters.needsUpdate !== undefined) {
    query = query.eq('needs_update', filters.needsUpdate)
  }

  // Has vendor cost filter
  if (filters.hasVendorCost) {
    query = query.not('vendor_cost_id', 'is', null)
  }

  // Has customer pricing filter
  if (filters.hasCustomerPricing) {
    query = query.not('customer_pricing_id', 'is', null)
  }

  // Has import cost filter
  if (filters.hasImportCost) {
    query = query.not('import_cost_id', 'is', null)
  }

  // Margin filters
  if (filters.minMarginPercent !== undefined) {
    query = query.gte('fob_margin_percent', filters.minMarginPercent)
  }

  if (filters.maxMarginPercent !== undefined) {
    query = query.lte('fob_margin_percent', filters.maxMarginPercent)
  }

  // Date range filters
  if (filters.effectiveDateFrom) {
    query = query.gte('vendor_cost_effective_date', filters.effectiveDateFrom)
  }

  if (filters.effectiveDateTo) {
    query = query.lte('vendor_cost_effective_date', filters.effectiveDateTo)
  }

  return query
}

// ============================================================================
// STATISTICS FUNCTIONS
// ============================================================================

/**
 * Calculate statistics for the report
 */
export async function fetchReportStatistics(
  filters?: ReportFilters
): Promise<ReportStatistics> {
  try {
    // Build query with filters
    let query = supabase.from('v_master_price_report').select('*')
    query = applyFilters(query, filters)

    const { data, error } = await query

    if (error || !data) {
      console.error('Error fetching report statistics:', error)
      return getEmptyStatistics()
    }

    // Calculate statistics from data
    const stats: ReportStatistics = {
      totalProducts: new Set(data.map(row => row.product_id)).size,
      totalCustomers: new Set(data.filter(row => row.customer_id).map(row => row.customer_id)).size,
      totalVendors: new Set(data.filter(row => row.vendor_id).map(row => row.vendor_id)).size,

      productsByStatus: {
        new: data.filter(row => row.status === 'N').length,
        current: data.filter(row => row.status === 'C').length,
        temporary: data.filter(row => row.status === 'T').length
      },

      productsByType: {
        international: data.filter(row => row.product_type === 'I').length,
        domestic: data.filter(row => row.product_type === 'D').length
      },

      productsNeedingUpdate: data.filter(row => row.needs_update).length,
      productsWithoutCosts: data.filter(row => !row.vendor_cost_id).length,
      productsWithoutPricing: data.filter(row => !row.customer_pricing_id).length,
    }

    // Calculate average margin
    const marginsWithValues = data
      .filter(row => row.fob_margin_percent !== null && row.fob_margin_percent !== undefined)
      .map(row => row.fob_margin_percent!)

    if (marginsWithValues.length > 0) {
      stats.averageMarginPercent = marginsWithValues.reduce((sum, margin) => sum + margin, 0) / marginsWithValues.length
    }

    // Calculate total profit potential (based on 40ft containers)
    const profitsWithValues = data
      .filter(row => row.profit_per_40ft_fob !== null && row.profit_per_40ft_fob !== undefined)
      .map(row => row.profit_per_40ft_fob!)

    if (profitsWithValues.length > 0) {
      stats.totalProfitPotential = profitsWithValues.reduce((sum, profit) => sum + profit, 0)
    }

    return stats
  } catch (error) {
    console.error('Error calculating statistics:', error)
    return getEmptyStatistics()
  }
}

function getEmptyStatistics(): ReportStatistics {
  return {
    totalProducts: 0,
    totalCustomers: 0,
    totalVendors: 0,
    productsByStatus: {
      new: 0,
      current: 0,
      temporary: 0
    },
    productsByType: {
      international: 0,
      domestic: 0
    },
    productsNeedingUpdate: 0,
    productsWithoutCosts: 0,
    productsWithoutPricing: 0
  }
}

// ============================================================================
// FILTER OPTIONS FUNCTIONS
// ============================================================================

/**
 * Get all unique categories for filtering
 */
export async function getAvailableCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category')

    if (error || !data) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))] as string[]
    return uniqueCategories
  } catch (error) {
    console.error('Error in getAvailableCategories:', error)
    return []
  }
}

/**
 * Get all unique brands for filtering
 */
export async function getAvailableBrands(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)
      .order('brand')

    if (error || !data) {
      console.error('Error fetching brands:', error)
      return []
    }

    // Get unique brands
    const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))] as string[]
    return uniqueBrands
  } catch (error) {
    console.error('Error in getAvailableBrands:', error)
    return []
  }
}

/**
 * Get all unique regions for filtering
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('region')
      .not('region', 'is', null)
      .order('region')

    if (error || !data) {
      console.error('Error fetching regions:', error)
      return []
    }

    // Get unique regions
    const uniqueRegions = [...new Set(data.map(c => c.region).filter(Boolean))] as string[]
    return uniqueRegions
  } catch (error) {
    console.error('Error in getAvailableRegions:', error)
    return []
  }
}

/**
 * Get all products for selection (id, item_number, brand)
 */
export async function getProductsForSelection(): Promise<Array<{ id: string; item_number: string; brand?: string }>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, item_number, brand')
      .eq('is_active', true)
      .order('item_number')

    if (error || !data) {
      console.error('Error fetching products:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getProductsForSelection:', error)
    return []
  }
}

/**
 * Get all customers for selection
 */
export async function getCustomersForSelection(): Promise<Array<{ id: string; customer_name: string; customer_code?: string }>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, customer_name, customer_code')
      .eq('is_active', true)
      .order('customer_name')

    if (error || !data) {
      console.error('Error fetching customers:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getCustomersForSelection:', error)
    return []
  }
}

/**
 * Get all vendors for selection
 */
export async function getVendorsForSelection(): Promise<Array<{ id: string; vendor_name: string; vendor_code?: string }>> {
  try {
    const { data, error} = await supabase
      .from('vendors')
      .select('id, vendor_name, vendor_code')
      .eq('is_active', true)
      .order('vendor_name')

    if (error || !data) {
      console.error('Error fetching vendors:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getVendorsForSelection:', error)
    return []
  }
}
