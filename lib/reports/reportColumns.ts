// lib/reports/reportColumns.ts
// Column definitions for Master Price Report

import { ReportColumnDefinition, ReportColumnCategory } from './reportTypes'
import { formatCurrency, formatPercent } from '../calculations'

/**
 * Format a number to 2 decimal places
 */
const formatNumber = (value: any): string => {
  if (value === null || value === undefined) return '-'
  return typeof value === 'number' ? value.toFixed(2) : value.toString()
}

/**
 * Format a boolean as Yes/No
 */
const formatBoolean = (value: any): string => {
  if (value === null || value === undefined) return '-'
  return value ? 'Yes' : 'No'
}

/**
 * Format a date string
 */
const formatDate = (value: any): string => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

// ============================================================================
// COLUMN DEFINITIONS BY CATEGORY
// ============================================================================

/**
 * All available columns for the Master Price Report
 * Organized by category matching the 17 categories in requirements
 */
export const REPORT_COLUMN_CATEGORIES: ReportColumnCategory[] = [
  // ==========================================================================
  // 1. PRODUCT GENERAL INFORMATION
  // ==========================================================================
  {
    id: 'product_info',
    label: 'Product Information',
    defaultSelected: true,
    columns: [
      { key: 'master_list_number', label: 'Master List #', category: 'product_info', dataType: 'number', width: 100 },
      { key: 'item_number', label: 'Item Number', category: 'product_info', dataType: 'string', width: 120 },
      { key: 'product_type', label: 'Type (I/D)', category: 'product_info', dataType: 'string', width: 80 },
      { key: 'status', label: 'Status', category: 'product_info', dataType: 'string', width: 80 },
      { key: 'category', label: 'Category', category: 'product_info', dataType: 'string', width: 120 },
      { key: 'brand', label: 'Brand', category: 'product_info', dataType: 'string', width: 120 },
      { key: 'item_description', label: 'Description', category: 'product_info', dataType: 'string', width: 250 },
      { key: 'pack_size', label: 'Pack Size', category: 'product_info', dataType: 'string', width: 100 },
      { key: 'units_per_case', label: 'Units/Case', category: 'product_info', dataType: 'number', width: 100 },
      { key: 'product_of_country', label: 'Country', category: 'product_info', dataType: 'string', width: 100 },
      { key: 'hs_code', label: 'HS Code', category: 'product_info', dataType: 'string', width: 120 },
      { key: 'notes', label: 'Notes', category: 'product_info', dataType: 'string', width: 200 },
    ]
  },

  // ==========================================================================
  // 2. VENDOR INFORMATION
  // ==========================================================================
  {
    id: 'vendor_info',
    label: 'Vendor Information',
    defaultSelected: true,
    columns: [
      { key: 'vendor_name', label: 'Vendor Name', category: 'vendor_info', dataType: 'string', width: 150 },
      { key: 'vendor_code', label: 'Vendor Code', category: 'vendor_info', dataType: 'string', width: 100 },
      { key: 'country_origin', label: 'Country of Origin', category: 'vendor_info', dataType: 'string', width: 120 },
      { key: 'facility_name', label: 'Facility Name', category: 'vendor_info', dataType: 'string', width: 150 },
      { key: 'facility_address', label: 'Facility Address', category: 'vendor_info', dataType: 'string', width: 200 },
      { key: 'vendor_payment_terms', label: 'Payment Terms', category: 'vendor_info', dataType: 'string', width: 120 },
      { key: 'incoterm', label: 'INCOTERM', category: 'vendor_info', dataType: 'string', width: 80 },
      { key: 'shipment_size', label: 'Shipment Size', category: 'vendor_info', dataType: 'string', width: 100 },
      { key: 'loading_option', label: 'Loading Option', category: 'vendor_info', dataType: 'string', width: 120 },
      { key: 'vendor_contact_person', label: 'Contact Person', category: 'vendor_info', dataType: 'string', width: 150 },
      { key: 'vendor_contact_email', label: 'Contact Email', category: 'vendor_info', dataType: 'string', width: 180 },
      { key: 'vendor_contact_phone', label: 'Contact Phone', category: 'vendor_info', dataType: 'string', width: 130 },
    ]
  },

  // ==========================================================================
  // 3. PHYSICAL SPECIFICATIONS
  // ==========================================================================
  {
    id: 'physical_specs',
    label: 'Physical Specifications',
    defaultSelected: false,
    columns: [
      { key: 'case_length_in', label: 'Case Length (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'case_width_in', label: 'Case Width (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'case_height_in', label: 'Case Height (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'case_cube_ft', label: 'Case Cube (ft³)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'case_weight_lbs', label: 'Case Weight (lbs)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'unit_length_in', label: 'Unit Length (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'unit_width_in', label: 'Unit Width (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'unit_height_in', label: 'Unit Height (in)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
      { key: 'unit_weight_oz', label: 'Unit Weight (oz)', category: 'physical_specs', dataType: 'number', width: 120, format: formatNumber },
    ]
  },

  // ==========================================================================
  // 4. PALLET & CONTAINER LOGISTICS
  // ==========================================================================
  {
    id: 'container_logistics',
    label: 'Container & Logistics',
    defaultSelected: false,
    columns: [
      { key: 'ti', label: 'TI (per layer)', category: 'container_logistics', dataType: 'number', width: 100 },
      { key: 'hi', label: 'HI (layers)', category: 'container_logistics', dataType: 'number', width: 100 },
      { key: 'cases_per_pallet', label: 'Cases/Pallet', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'pallet_weight_lbs', label: 'Pallet Weight (lbs)', category: 'container_logistics', dataType: 'number', width: 140, format: formatNumber },
      { key: 'pallets_per_20ft', label: 'Pallets/20ft', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'cases_per_20ft', label: 'Cases/20ft', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'pallets_per_40ft', label: 'Pallets/40ft', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'cases_per_40ft', label: 'Cases/40ft', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'pallets_per_40hc', label: 'Pallets/40HC', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'cases_per_40hc', label: 'Cases/40HC', category: 'container_logistics', dataType: 'number', width: 120 },
      { key: 'stackable', label: 'Stackable', category: 'container_logistics', dataType: 'boolean', width: 100, format: formatBoolean },
      { key: 'lead_time_days', label: 'Lead Time (days)', category: 'container_logistics', dataType: 'number', width: 130 },
      { key: 'moq', label: 'MOQ', category: 'container_logistics', dataType: 'number', width: 100 },
    ]
  },

  // ==========================================================================
  // 5. CUSTOMER INFORMATION
  // ==========================================================================
  {
    id: 'customer_info',
    label: 'Customer Information',
    defaultSelected: true,
    columns: [
      { key: 'customer_name', label: 'Customer Name', category: 'customer_info', dataType: 'string', width: 150 },
      { key: 'customer_code', label: 'Customer Code', category: 'customer_info', dataType: 'string', width: 120 },
      { key: 'region', label: 'Region', category: 'customer_info', dataType: 'string', width: 80 },
      { key: 'warehouse_zip_code', label: 'Warehouse ZIP', category: 'customer_info', dataType: 'string', width: 120 },
      { key: 'sales_broker_name', label: 'Sales Broker', category: 'customer_info', dataType: 'string', width: 130 },
      { key: 'customer_payment_terms', label: 'Payment Terms', category: 'customer_info', dataType: 'string', width: 130 },
      { key: 'annual_volume_cases', label: 'Annual Volume', category: 'customer_info', dataType: 'number', width: 130 },
      { key: 'monthly_volume_cases', label: 'Monthly Volume', category: 'customer_info', dataType: 'number', width: 130 },
      { key: 'customer_contact_person', label: 'Contact Person', category: 'customer_info', dataType: 'string', width: 150 },
      { key: 'customer_contact_email', label: 'Contact Email', category: 'customer_info', dataType: 'string', width: 180 },
      { key: 'customer_contact_phone', label: 'Contact Phone', category: 'customer_info', dataType: 'string', width: 130 },
    ]
  },

  // ==========================================================================
  // 6. VENDOR COSTS - EXW (Ex Works)
  // ==========================================================================
  {
    id: 'vendor_costs_exw',
    label: 'Vendor Costs - EXW',
    defaultSelected: false,
    columns: [
      { key: 'exw_cost_per_case', label: 'EXW Cost/Case', category: 'vendor_costs_exw', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'exw_cost_per_unit', label: 'EXW Cost/Unit', category: 'vendor_costs_exw', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'exw_cost_per_lb', label: 'EXW Cost/lb', category: 'vendor_costs_exw', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'exw_previous_cost_per_case', label: 'EXW Prev Cost/Case', category: 'vendor_costs_exw', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'exw_previous_cost_per_lb', label: 'EXW Prev Cost/lb', category: 'vendor_costs_exw', dataType: 'currency', width: 160, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 7. VENDOR COSTS - FOB (Free on Board)
  // ==========================================================================
  {
    id: 'vendor_costs_fob',
    label: 'Vendor Costs - FOB',
    defaultSelected: true,
    columns: [
      { key: 'fob_cost_per_case', label: 'FOB Cost/Case', category: 'vendor_costs_fob', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'fob_cost_per_unit', label: 'FOB Cost/Unit', category: 'vendor_costs_fob', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'fob_cost_per_lb', label: 'FOB Cost/lb', category: 'vendor_costs_fob', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'fob_previous_cost_per_case', label: 'FOB Prev Cost/Case', category: 'vendor_costs_fob', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'fob_previous_cost_per_lb', label: 'FOB Prev Cost/lb', category: 'vendor_costs_fob', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'fob_cost_change_amount', label: 'FOB Cost Change $', category: 'vendor_costs_fob', dataType: 'currency', width: 150, format: formatCurrency },
      { key: 'fob_cost_change_percent', label: 'FOB Cost Change %', category: 'vendor_costs_fob', dataType: 'percentage', width: 150, format: formatPercent },
    ]
  },

  // ==========================================================================
  // 8. VENDOR COSTS - PICKUP AT PLANT
  // ==========================================================================
  {
    id: 'vendor_costs_pickup_plant',
    label: 'Vendor Costs - Pickup Plant',
    defaultSelected: false,
    columns: [
      { key: 'pickup_plant_cost_per_case', label: 'Pickup Plant Cost/Case', category: 'vendor_costs_pickup_plant', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_plant_cost_per_unit', label: 'Pickup Plant Cost/Unit', category: 'vendor_costs_pickup_plant', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_plant_cost_per_lb', label: 'Pickup Plant Cost/lb', category: 'vendor_costs_pickup_plant', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_plant_previous_cost_per_case', label: 'Pickup Plant Prev/Case', category: 'vendor_costs_pickup_plant', dataType: 'currency', width: 200, format: formatCurrency },
      { key: 'pickup_plant_previous_cost_per_lb', label: 'Pickup Plant Prev/lb', category: 'vendor_costs_pickup_plant', dataType: 'currency', width: 200, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 9. VENDOR COSTS - PICKUP AT PORT US
  // ==========================================================================
  {
    id: 'vendor_costs_pickup_port',
    label: 'Vendor Costs - Pickup Port US',
    defaultSelected: false,
    columns: [
      { key: 'pickup_port_us_cost_per_case', label: 'Pickup Port Cost/Case', category: 'vendor_costs_pickup_port', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_port_us_cost_per_unit', label: 'Pickup Port Cost/Unit', category: 'vendor_costs_pickup_port', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_port_us_cost_per_lb', label: 'Pickup Port Cost/lb', category: 'vendor_costs_pickup_port', dataType: 'currency', width: 180, format: formatCurrency },
      { key: 'pickup_port_us_previous_cost_per_case', label: 'Pickup Port Prev/Case', category: 'vendor_costs_pickup_port', dataType: 'currency', width: 200, format: formatCurrency },
      { key: 'pickup_port_us_previous_cost_per_lb', label: 'Pickup Port Prev/lb', category: 'vendor_costs_pickup_port', dataType: 'currency', width: 200, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 10. VENDOR COSTS - DDP (Delivered Duty Paid)
  // ==========================================================================
  {
    id: 'vendor_costs_ddp',
    label: 'Vendor Costs - DDP',
    defaultSelected: false,
    columns: [
      { key: 'ddp_cost_per_case', label: 'DDP Cost/Case', category: 'vendor_costs_ddp', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'ddp_cost_per_unit', label: 'DDP Cost/Unit', category: 'vendor_costs_ddp', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'ddp_cost_per_lb', label: 'DDP Cost/lb', category: 'vendor_costs_ddp', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'ddp_previous_cost_per_case', label: 'DDP Prev Cost/Case', category: 'vendor_costs_ddp', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'ddp_previous_cost_per_lb', label: 'DDP Prev Cost/lb', category: 'vendor_costs_ddp', dataType: 'currency', width: 160, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 11. FACTORY FEES
  // ==========================================================================
  {
    id: 'factory_fees',
    label: 'Factory Fees',
    defaultSelected: false,
    columns: [
      { key: 'factory_fee_percent', label: 'Factory Fee %', category: 'factory_fees', dataType: 'percentage', width: 130, format: formatPercent },
      { key: 'factory_fee_per_case', label: 'Factory Fee/Case', category: 'factory_fees', dataType: 'currency', width: 140, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 12. IMPORT COSTS
  // ==========================================================================
  {
    id: 'import_costs',
    label: 'Import Costs',
    defaultSelected: true,
    columns: [
      { key: 'import_broker_fee_percent', label: 'Import Broker %', category: 'import_costs', dataType: 'percentage', width: 150, format: formatPercent },
      { key: 'import_broker_fee_per_case', label: 'Import Broker/Case', category: 'import_costs', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'duty_rate_percent', label: 'Duty Rate %', category: 'import_costs', dataType: 'percentage', width: 120, format: formatPercent },
      { key: 'duty_per_case', label: 'Duty/Case', category: 'import_costs', dataType: 'currency', width: 120, format: formatCurrency },
      { key: 'previous_tariff_percent', label: 'Previous Tariff %', category: 'import_costs', dataType: 'percentage', width: 150, format: formatPercent },
      { key: 'gsp_margin_percent', label: 'GSP Margin %', category: 'import_costs', dataType: 'percentage', width: 130, format: formatPercent },
      { key: 'gsp_profit_per_case', label: 'GSP Profit/Case', category: 'import_costs', dataType: 'currency', width: 150, format: formatCurrency },
      { key: 'total_import_costs_per_case', label: 'Total Import Costs', category: 'import_costs', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'landed_cost_per_case', label: 'Landed Cost/Case', category: 'import_costs', dataType: 'currency', width: 150, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 13. CUSTOMER PRICING - EXW
  // ==========================================================================
  {
    id: 'customer_pricing_exw',
    label: 'Customer Pricing - EXW',
    defaultSelected: false,
    columns: [
      { key: 'exw_price_per_case', label: 'EXW Price/Case', category: 'customer_pricing_exw', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'exw_price_per_unit', label: 'EXW Price/Unit', category: 'customer_pricing_exw', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'exw_price_per_lb', label: 'EXW Price/lb', category: 'customer_pricing_exw', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'exw_previous_price_per_case', label: 'EXW Prev Price/Case', category: 'customer_pricing_exw', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'exw_rebate_amount', label: 'EXW Rebate', category: 'customer_pricing_exw', dataType: 'currency', width: 120, format: formatCurrency },
      { key: 'exw_rebate_price_per_case', label: 'EXW w/Rebate/Case', category: 'customer_pricing_exw', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'exw_rebate_price_per_unit', label: 'EXW w/Rebate/Unit', category: 'customer_pricing_exw', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'exw_rebate_price_per_lb', label: 'EXW w/Rebate/lb', category: 'customer_pricing_exw', dataType: 'currency', width: 160, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 14. CUSTOMER PRICING - FOB
  // ==========================================================================
  {
    id: 'customer_pricing_fob',
    label: 'Customer Pricing - FOB',
    defaultSelected: true,
    columns: [
      { key: 'fob_price_per_case', label: 'FOB Price/Case', category: 'customer_pricing_fob', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'fob_price_per_unit', label: 'FOB Price/Unit', category: 'customer_pricing_fob', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'fob_price_per_lb', label: 'FOB Price/lb', category: 'customer_pricing_fob', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'fob_rebate_amount', label: 'FOB Rebate', category: 'customer_pricing_fob', dataType: 'currency', width: 120, format: formatCurrency },
      { key: 'fob_rebate_price_per_case', label: 'FOB w/Rebate/Case', category: 'customer_pricing_fob', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'fob_rebate_price_per_unit', label: 'FOB w/Rebate/Unit', category: 'customer_pricing_fob', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'fob_rebate_price_per_lb', label: 'FOB w/Rebate/lb', category: 'customer_pricing_fob', dataType: 'currency', width: 160, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 15. CUSTOMER PRICING - DAP
  // ==========================================================================
  {
    id: 'customer_pricing_dap',
    label: 'Customer Pricing - DAP',
    defaultSelected: false,
    columns: [
      { key: 'dap_cases_per_container', label: 'DAP Cases/Container', category: 'customer_pricing_dap', dataType: 'number', width: 170 },
      { key: 'dap_vessel_freight_per_case', label: 'DAP Vessel Freight', category: 'customer_pricing_dap', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'dap_price_per_case', label: 'DAP Price/Case', category: 'customer_pricing_dap', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'dap_price_per_unit', label: 'DAP Price/Unit', category: 'customer_pricing_dap', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'dap_price_per_lb', label: 'DAP Price/lb', category: 'customer_pricing_dap', dataType: 'currency', width: 130, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 16. CUSTOMER PRICING - DDP
  // ==========================================================================
  {
    id: 'customer_pricing_ddp',
    label: 'Customer Pricing - DDP',
    defaultSelected: false,
    columns: [
      { key: 'ddp_inland_freight_per_case', label: 'DDP Inland Freight', category: 'customer_pricing_ddp', dataType: 'currency', width: 170, format: formatCurrency },
      { key: 'ddp_price_per_case', label: 'DDP Price/Case', category: 'customer_pricing_ddp', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'ddp_price_per_unit', label: 'DDP Price/Unit', category: 'customer_pricing_ddp', dataType: 'currency', width: 140, format: formatCurrency },
      { key: 'ddp_price_per_lb', label: 'DDP Price/lb', category: 'customer_pricing_ddp', dataType: 'currency', width: 130, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 17. MARGINS & PROFITABILITY
  // ==========================================================================
  {
    id: 'margins_profitability',
    label: 'Margins & Profitability',
    defaultSelected: true,
    columns: [
      { key: 'exw_margin_amount', label: 'EXW Margin $', category: 'margins_profitability', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'exw_margin_percent', label: 'EXW Margin %', category: 'margins_profitability', dataType: 'percentage', width: 130, format: formatPercent },
      { key: 'fob_margin_amount', label: 'FOB Margin $', category: 'margins_profitability', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'fob_margin_percent', label: 'FOB Margin %', category: 'margins_profitability', dataType: 'percentage', width: 130, format: formatPercent },
      { key: 'ddp_margin_amount', label: 'DDP Margin $', category: 'margins_profitability', dataType: 'currency', width: 130, format: formatCurrency },
      { key: 'ddp_margin_percent', label: 'DDP Margin %', category: 'margins_profitability', dataType: 'percentage', width: 130, format: formatPercent },
      { key: 'profit_per_pallet_fob', label: 'Profit/Pallet (FOB)', category: 'margins_profitability', dataType: 'currency', width: 160, format: formatCurrency },
      { key: 'profit_per_20ft_fob', label: 'Profit/20ft (FOB)', category: 'margins_profitability', dataType: 'currency', width: 150, format: formatCurrency },
      { key: 'profit_per_40ft_fob', label: 'Profit/40ft (FOB)', category: 'margins_profitability', dataType: 'currency', width: 150, format: formatCurrency },
      { key: 'profit_per_40hc_fob', label: 'Profit/40HC (FOB)', category: 'margins_profitability', dataType: 'currency', width: 160, format: formatCurrency },
    ]
  },

  // ==========================================================================
  // 18. DATES & STATUS
  // ==========================================================================
  {
    id: 'dates_status',
    label: 'Dates & Status',
    defaultSelected: false,
    columns: [
      { key: 'vendor_cost_effective_date', label: 'Cost Effective Date', category: 'dates_status', dataType: 'date', width: 150, format: formatDate },
      { key: 'vendor_cost_expiry_date', label: 'Cost Expiry Date', category: 'dates_status', dataType: 'date', width: 150, format: formatDate },
      { key: 'customer_pricing_effective_date', label: 'Price Effective Date', category: 'dates_status', dataType: 'date', width: 170, format: formatDate },
      { key: 'customer_pricing_expiry_date', label: 'Price Expiry Date', category: 'dates_status', dataType: 'date', width: 150, format: formatDate },
      { key: 'import_cost_effective_date', label: 'Import Cost Date', category: 'dates_status', dataType: 'date', width: 150, format: formatDate },
      { key: 'review_status', label: 'Review Status', category: 'dates_status', dataType: 'string', width: 200 },
      { key: 'needs_update', label: 'Needs Update', category: 'dates_status', dataType: 'boolean', width: 120, format: formatBoolean },
      { key: 'is_active', label: 'Is Active', category: 'dates_status', dataType: 'boolean', width: 100, format: formatBoolean },
      { key: 'product_created_at', label: 'Created Date', category: 'dates_status', dataType: 'date', width: 130, format: formatDate },
      { key: 'product_updated_at', label: 'Updated Date', category: 'dates_status', dataType: 'date', width: 130, format: formatDate },
    ]
  },

  // ==========================================================================
  // 19. NOTES & COMMENTS
  // ==========================================================================
  {
    id: 'notes',
    label: 'Notes & Comments',
    defaultSelected: false,
    columns: [
      { key: 'cost_notes', label: 'Cost Notes', category: 'notes', dataType: 'string', width: 200 },
      { key: 'pricing_notes', label: 'Pricing Notes', category: 'notes', dataType: 'string', width: 200 },
      { key: 'import_cost_notes', label: 'Import Cost Notes', category: 'notes', dataType: 'string', width: 200 },
    ]
  },
]

/**
 * Get all columns flattened into a single array
 */
export const getAllColumns = (): ReportColumnDefinition[] => {
  return REPORT_COLUMN_CATEGORIES.flatMap(category => category.columns)
}

/**
 * Get columns by category ID
 */
export const getColumnsByCategory = (categoryId: string): ReportColumnDefinition[] => {
  const category = REPORT_COLUMN_CATEGORIES.find(c => c.id === categoryId)
  return category ? category.columns : []
}

/**
 * Get column definition by key
 */
export const getColumnByKey = (key: string): ReportColumnDefinition | undefined => {
  return getAllColumns().find(col => col.key === key)
}

/**
 * Get default selected columns
 */
export const getDefaultColumns = (): string[] => {
  return REPORT_COLUMN_CATEGORIES
    .filter(category => category.defaultSelected)
    .flatMap(category => category.columns.map(col => col.key))
}

/**
 * Get columns for a preset
 */
export const COLUMN_PRESETS = {
  basic: [
    'item_number',
    'brand',
    'vendor_name',
    'customer_name',
    'fob_cost_per_case',
    'fob_price_per_case',
    'fob_margin_percent'
  ],
  full: getAllColumns().map(col => col.key),
  margins: [
    'item_number',
    'brand',
    'customer_name',
    'fob_cost_per_case',
    'landed_cost_per_case',
    'fob_price_per_case',
    'fob_margin_amount',
    'fob_margin_percent',
    'profit_per_40ft_fob'
  ],
  costs: [
    'item_number',
    'brand',
    'vendor_name',
    'exw_cost_per_case',
    'fob_cost_per_case',
    'ddp_cost_per_case',
    'fob_previous_cost_per_case',
    'fob_cost_change_percent'
  ]
}
