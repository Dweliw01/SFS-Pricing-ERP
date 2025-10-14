// lib/reports/reportTypes.ts
// TypeScript types for the reporting system

import { Product, Vendor, Customer, ProductVendorCost, ProductCustomerPricing, ImportCost } from '../types'

// ============================================================================
// MASTER PRICE REPORT TYPES
// ============================================================================

/**
 * Complete row from the master price report view
 * Contains all 190+ fields from products, vendors, customers, costs, and pricing
 */
export interface MasterPriceReportRow {
  // Product Information
  product_id: string
  master_list_number?: number
  item_number: string
  product_type: 'I' | 'D'
  status: 'N' | 'C' | 'T'
  category?: string
  brand?: string
  item_description?: string
  pack_size?: string
  units_per_case?: number
  product_of_country?: string
  hs_code?: string
  notes?: string

  // Physical Specifications
  case_length_in?: number
  case_width_in?: number
  case_height_in?: number
  case_cube_ft?: number
  case_weight_lbs?: number
  unit_length_in?: number
  unit_width_in?: number
  unit_height_in?: number
  unit_weight_oz?: number

  // Pallet Configuration
  ti?: number
  hi?: number
  cases_per_pallet?: number
  pallet_weight_lbs?: number

  // Container Logistics
  pallets_per_20ft?: number
  cases_per_20ft?: number
  pallets_per_40ft?: number
  cases_per_40ft?: number
  pallets_per_40hc?: number
  cases_per_40hc?: number

  // Shipping
  stackable?: boolean
  lead_time_days?: number
  moq?: number

  // Status & Review
  review_status?: string
  needs_update?: boolean
  is_active?: boolean

  // Vendor Information
  vendor_id?: string
  vendor_name?: string
  vendor_code?: string
  country_origin?: string
  facility_name?: string
  facility_address?: string
  vendor_payment_terms?: string
  vendor_contact_person?: string
  vendor_contact_email?: string
  vendor_contact_phone?: string

  // Vendor Costs ID
  vendor_cost_id?: string
  incoterm?: string
  shipment_size?: string
  loading_option?: string

  // EXW Costs
  exw_cost_per_case?: number
  exw_cost_per_unit?: number
  exw_cost_per_lb?: number
  exw_previous_cost_per_case?: number
  exw_previous_cost_per_lb?: number

  // FOB Costs
  fob_cost_per_case?: number
  fob_cost_per_unit?: number
  fob_cost_per_lb?: number
  fob_previous_cost_per_case?: number
  fob_previous_cost_per_lb?: number

  // Pickup at Plant Costs
  pickup_plant_cost_per_case?: number
  pickup_plant_cost_per_unit?: number
  pickup_plant_cost_per_lb?: number
  pickup_plant_previous_cost_per_case?: number
  pickup_plant_previous_cost_per_lb?: number

  // Pickup at Port US Costs
  pickup_port_us_cost_per_case?: number
  pickup_port_us_cost_per_unit?: number
  pickup_port_us_cost_per_lb?: number
  pickup_port_us_previous_cost_per_case?: number
  pickup_port_us_previous_cost_per_lb?: number

  // DDP Costs
  ddp_cost_per_case?: number
  ddp_cost_per_unit?: number
  ddp_cost_per_lb?: number
  ddp_previous_cost_per_case?: number
  ddp_previous_cost_per_lb?: number

  // Factory Fees
  factory_fee_percent?: number
  factory_fee_per_case?: number

  vendor_cost_effective_date?: string
  vendor_cost_expiry_date?: string
  cost_notes?: string

  // Customer Information
  customer_id?: string
  customer_name?: string
  customer_code?: string
  region?: string
  warehouse_zip_code?: string
  sales_broker_name?: string
  customer_payment_terms?: string
  customer_contact_person?: string
  customer_contact_email?: string
  customer_contact_phone?: string
  annual_volume_cases?: number
  monthly_volume_cases?: number

  // Customer Pricing ID
  customer_pricing_id?: string

  // EXW Pricing (without rebate)
  exw_price_per_case?: number
  exw_price_per_unit?: number
  exw_price_per_lb?: number
  exw_previous_price_per_case?: number

  // EXW Pricing (with rebate)
  exw_rebate_amount?: number
  exw_rebate_price_per_case?: number
  exw_rebate_price_per_unit?: number
  exw_rebate_price_per_lb?: number

  // FOB Pricing (without rebate)
  fob_price_per_case?: number
  fob_price_per_unit?: number
  fob_price_per_lb?: number

  // FOB Pricing (with rebate)
  fob_rebate_amount?: number
  fob_rebate_price_per_case?: number
  fob_rebate_price_per_unit?: number
  fob_rebate_price_per_lb?: number

  // DAP Pricing
  dap_cases_per_container?: number
  dap_vessel_freight_per_case?: number
  dap_price_per_case?: number
  dap_price_per_unit?: number
  dap_price_per_lb?: number

  // DDP Pricing
  ddp_inland_freight_per_case?: number
  ddp_price_per_case?: number
  ddp_price_per_unit?: number
  ddp_price_per_lb?: number

  customer_pricing_effective_date?: string
  customer_pricing_expiry_date?: string
  pricing_notes?: string

  // Import Costs
  import_cost_id?: string
  import_broker_fee_percent?: number
  import_broker_fee_per_case?: number
  duty_rate_percent?: number
  duty_per_case?: number
  previous_tariff_percent?: number
  gsp_margin_percent?: number
  gsp_profit_per_case?: number
  import_cost_effective_date?: string
  import_cost_notes?: string

  // Calculated Fields - Margins
  exw_margin_amount?: number
  exw_margin_percent?: number
  fob_margin_amount?: number
  fob_margin_percent?: number
  ddp_margin_amount?: number
  ddp_margin_percent?: number

  // Calculated Fields - Landed Cost
  landed_cost_per_case?: number
  total_import_costs_per_case?: number

  // Calculated Fields - Profitability
  profit_per_pallet_fob?: number
  profit_per_20ft_fob?: number
  profit_per_40ft_fob?: number
  profit_per_40hc_fob?: number

  // Calculated Fields - Cost Changes
  fob_cost_change_amount?: number
  fob_cost_change_percent?: number

  // Timestamps
  product_created_at?: string
  product_updated_at?: string
}

// ============================================================================
// REPORT FILTER TYPES
// ============================================================================

export interface ReportDateRange {
  from?: string
  to?: string
}

export interface ReportFilters {
  // Entity Filters
  productIds?: string[]
  customerIds?: string[]
  vendorIds?: string[]

  // Date Filters
  dateRange?: ReportDateRange
  effectiveDateFrom?: string
  effectiveDateTo?: string

  // Status Filters
  status?: ('N' | 'C' | 'T')[]
  productType?: ('I' | 'D')[]
  isActive?: boolean

  // Category Filters
  categories?: string[]
  brands?: string[]
  regions?: string[]

  // Search
  searchTerm?: string

  // Other Filters
  needsUpdate?: boolean
  hasVendorCost?: boolean
  hasCustomerPricing?: boolean
  hasImportCost?: boolean

  // Margin Filters
  minMarginPercent?: number
  maxMarginPercent?: number
}

// ============================================================================
// REPORT CONFIGURATION TYPES
// ============================================================================

export interface ReportSortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export interface ReportPagination {
  page: number
  pageSize: number
  total?: number
}

export interface ReportConfiguration {
  filters: ReportFilters
  columns: string[]
  sort?: ReportSortConfig
  pagination?: ReportPagination
}

// ============================================================================
// REPORT TEMPLATE TYPES
// ============================================================================

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  report_type: 'master_price' | 'custom'

  // Configuration
  filters: ReportFilters
  columns: string[]
  sort_config?: ReportSortConfig

  // Sharing & Permissions
  is_public: boolean
  created_by?: string

  // Usage Tracking
  use_count: number
  last_used_at?: string

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================================================
// REPORT COLUMN DEFINITION TYPES
// ============================================================================

export interface ReportColumnDefinition {
  key: string
  label: string
  category: string
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'percentage'
  format?: (value: any) => string
  width?: number
  description?: string
}

export interface ReportColumnCategory {
  id: string
  label: string
  columns: ReportColumnDefinition[]
  defaultSelected?: boolean
}

// ============================================================================
// REPORT EXPORT TYPES
// ============================================================================

export type ExportFormat = 'excel' | 'csv' | 'pdf'

export interface ExportOptions {
  format: ExportFormat
  filename?: string
  includeHeaders?: boolean
  includeCalculatedFields?: boolean
  sheetName?: string
}

export interface ExportProgress {
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number // 0-100
  message?: string
  downloadUrl?: string
  error?: string
}

// ============================================================================
// REPORT STATISTICS TYPES
// ============================================================================

export interface ReportStatistics {
  totalProducts: number
  totalCustomers: number
  totalVendors: number

  averageMarginPercent?: number
  totalProfitPotential?: number

  productsByStatus: {
    new: number
    current: number
    temporary: number
  }

  productsByType: {
    international: number
    domestic: number
  }

  productsNeedingUpdate: number
  productsWithoutCosts: number
  productsWithoutPricing: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ReportDataResponse {
  success: boolean
  data: MasterPriceReportRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  statistics?: ReportStatistics
  error?: string
}

export interface ReportTemplateResponse {
  success: boolean
  template?: ReportTemplate
  templates?: ReportTemplate[]
  error?: string
}

export interface ReportExportResponse {
  success: boolean
  downloadUrl?: string
  filename?: string
  fileSize?: number
  error?: string
}
