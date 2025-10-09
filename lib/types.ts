// lib/types.ts

export interface Product {
  id: string
  master_list_number?: number
  item_number: string
  product_type: 'I' | 'D'  // International or Domestic
  status: 'N' | 'C' | 'T'  // New, Current, Temporary
  category?: string | null
  brand?: string | null
  item_description?: string | null
  pack_size?: string | null
  units_per_case?: number | null
  product_of_country?: string | null
  hs_code?: string | null
  notes?: string | null

  // Case dimensions
  case_length_in?: number | null
  case_width_in?: number | null
  case_height_in?: number | null
  case_cube_ft?: number | null
  case_weight_lbs?: number | null

  // Pallet configuration
  ti?: number | null
  hi?: number | null
  cases_per_pallet?: number | null
  pallet_weight_lbs?: number | null

  // Unit dimensions
  unit_length_in?: number | null
  unit_width_in?: number | null
  unit_height_in?: number | null
  unit_weight_oz?: number | null

  // Container logistics
  pallets_per_20ft?: number | null
  cases_per_20ft?: number | null
  pallets_per_40ft?: number | null
  cases_per_40ft?: number | null
  pallets_per_40hc?: number | null
  cases_per_40hc?: number | null

  // Shipping
  stackable?: boolean
  lead_time_days?: number | null
  moq?: number | null

  // Status
  review_status?: string | null
  needs_update?: boolean
  is_active?: boolean

  created_at?: string
  updated_at?: string
}

export interface Vendor {
  id: string
  vendor_name: string
  vendor_code: string | null
  country_origin: string | null
  facility_name: string | null
  facility_address: string | null
  payment_terms: string | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  customer_name: string
  customer_code: string | null
  region: string | null
  warehouse_zip_code: string | null
  payment_terms: string | null
  sales_broker_name: string | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  annual_volume_cases: number | null
  monthly_volume_cases: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVendorCost {
  id: string
  product_id: string
  vendor_id: string
  incoterm?: string
  shipment_size?: string
  loading_option?: string

  // EXW costs (Ex Works - at plant)
  exw_cost_per_case?: number | null
  exw_cost_per_unit?: number | null
  exw_cost_per_lb?: number | null
  exw_previous_cost_per_case?: number | null
  exw_previous_cost_per_lb?: number | null

  // FOB costs (Free on Board - at port origin)
  fob_cost_per_case?: number | null
  fob_cost_per_unit?: number | null
  fob_cost_per_lb?: number | null
  fob_previous_cost_per_case?: number | null
  fob_previous_cost_per_lb?: number | null

  // Pickup at Plant costs
  pickup_plant_cost_per_case?: number | null
  pickup_plant_cost_per_unit?: number | null
  pickup_plant_cost_per_lb?: number | null
  pickup_plant_previous_cost_per_case?: number | null
  pickup_plant_previous_cost_per_lb?: number | null

  // Pickup at Port US costs
  pickup_port_us_cost_per_case?: number | null
  pickup_port_us_cost_per_unit?: number | null
  pickup_port_us_cost_per_lb?: number | null
  pickup_port_us_previous_cost_per_case?: number | null
  pickup_port_us_previous_cost_per_lb?: number | null

  // DDP costs (Delivered Duty Paid)
  ddp_cost_per_case?: number | null
  ddp_cost_per_unit?: number | null
  ddp_cost_per_lb?: number | null
  ddp_previous_cost_per_case?: number | null
  ddp_previous_cost_per_lb?: number | null

  // Factory fees
  factory_fee_percent?: number | null
  factory_fee_per_case?: number | null

  // Dates
  effective_date: string
  expiry_date?: string | null
  is_current?: boolean
  cost_notes?: string | null

  created_at?: string
  updated_at?: string

  // Join fields
  vendor?: Vendor
}

export interface ProductCustomerPricing {
  id: string
  product_id: string
  customer_id: string

  // EXW pricing (Pick-up at Plant)
  exw_price_per_case?: number | null
  exw_price_per_unit?: number | null
  exw_price_per_lb?: number | null
  exw_previous_price_per_case?: number | null

  // EXW with Rebate
  exw_rebate_amount?: number | null
  exw_rebate_price_per_case?: number | null
  exw_rebate_price_per_unit?: number | null
  exw_rebate_price_per_lb?: number | null

  // FOB pricing (Free on Board)
  fob_price_per_case?: number | null
  fob_price_per_unit?: number | null
  fob_price_per_lb?: number | null

  // FOB with Rebate
  fob_rebate_amount?: number | null
  fob_rebate_price_per_case?: number | null
  fob_rebate_price_per_unit?: number | null
  fob_rebate_price_per_lb?: number | null

  // DAP pricing (Delivered at Place - Port USA)
  dap_cases_per_container?: number | null
  dap_vessel_freight_per_case?: number | null
  dap_price_per_case?: number | null
  dap_price_per_unit?: number | null
  dap_price_per_lb?: number | null

  // DDP pricing (Delivered Duty Paid - Client Crossdock)
  ddp_inland_freight_per_case?: number | null
  ddp_price_per_case?: number | null
  ddp_price_per_unit?: number | null
  ddp_price_per_lb?: number | null

  effective_date: string
  expiry_date?: string | null
  is_current?: boolean
  pricing_notes?: string | null

  created_at?: string
  updated_at?: string

  // Join fields
  customer?: Customer
}

export interface ImportCost {
  id: string
  product_id: string

  // Import broker fees
  import_broker_fee_percent?: number | null  // As percentage
  import_broker_fee_per_case?: number | null  // As dollar amount per case

  // Duty rates
  duty_rate_percent?: number | null  // As percentage
  duty_per_case?: number | null  // As dollar amount per case

  // Previous tariff for comparison
  previous_tariff_percent?: number | null  // As percentage

  // GSP (Generalized System of Preferences) calculations
  gsp_margin_percent?: number | null  // Profit margin as percentage
  gsp_profit_per_case?: number | null  // Profit per case in dollars

  // Dates and metadata
  effective_date: string
  is_current?: boolean
  notes?: string | null

  created_at?: string
  updated_at?: string
}
