// lib/calculations.ts
// Pricing and margin calculation utilities

import { Product, ProductVendorCost, ProductCustomerPricing, ImportCost } from './types'
import { supabase } from './supabase'

// ============================================================================
// MARGIN CALCULATIONS
// ============================================================================

/**
 * Calculate margin amount (price - cost)
 */
export function calculateMargin(price: number, cost: number): number {
  return price - cost
}

/**
 * Calculate margin percentage ((price - cost) / cost * 100)
 */
export function calculateMarginPercent(price: number, cost: number): number {
  if (cost === 0) return 0
  return ((price - cost) / cost) * 100
}

/**
 * Calculate markup percentage ((price - cost) / price * 100)
 */
export function calculateMarkupPercent(price: number, cost: number): number {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}

// ============================================================================
// TIER MATCHING
// ============================================================================

/**
 * Get matching cost and price for a specific tier (EXW, FOB, DAP, DDP)
 */
export interface TierComparison {
  tier: 'EXW' | 'FOB' | 'DAP' | 'DDP'
  cost?: number | null
  price?: number | null
  margin?: number
  marginPercent?: number
  hasRebate?: boolean
  rebateAmount?: number
}

export function compareTiers(
  vendorCost: ProductVendorCost | null,
  customerPrice: ProductCustomerPricing | null
): TierComparison[] {
  const comparisons: TierComparison[] = []

  if (!vendorCost || !customerPrice) return comparisons

  // EXW Comparison
  if (vendorCost.exw_cost_per_case && customerPrice.exw_price_per_case) {
    comparisons.push({
      tier: 'EXW',
      cost: vendorCost.exw_cost_per_case,
      price: customerPrice.exw_price_per_case,
      margin: calculateMargin(customerPrice.exw_price_per_case, vendorCost.exw_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.exw_price_per_case, vendorCost.exw_cost_per_case)
    })
  }

  // EXW with Rebate
  if (vendorCost.exw_cost_per_case && customerPrice.exw_rebate_price_per_case && customerPrice.exw_rebate_amount) {
    comparisons.push({
      tier: 'EXW',
      cost: vendorCost.exw_cost_per_case,
      price: customerPrice.exw_rebate_price_per_case,
      margin: calculateMargin(customerPrice.exw_rebate_price_per_case, vendorCost.exw_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.exw_rebate_price_per_case, vendorCost.exw_cost_per_case),
      hasRebate: true,
      rebateAmount: customerPrice.exw_rebate_amount
    })
  }

  // FOB Comparison
  if (vendorCost.fob_cost_per_case && customerPrice.fob_price_per_case) {
    comparisons.push({
      tier: 'FOB',
      cost: vendorCost.fob_cost_per_case,
      price: customerPrice.fob_price_per_case,
      margin: calculateMargin(customerPrice.fob_price_per_case, vendorCost.fob_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.fob_price_per_case, vendorCost.fob_cost_per_case)
    })
  }

  // FOB with Rebate
  if (vendorCost.fob_cost_per_case && customerPrice.fob_rebate_price_per_case && customerPrice.fob_rebate_amount) {
    comparisons.push({
      tier: 'FOB',
      cost: vendorCost.fob_cost_per_case,
      price: customerPrice.fob_rebate_price_per_case,
      margin: calculateMargin(customerPrice.fob_rebate_price_per_case, vendorCost.fob_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.fob_rebate_price_per_case, vendorCost.fob_cost_per_case),
      hasRebate: true,
      rebateAmount: customerPrice.fob_rebate_amount
    })
  }

  // DAP Comparison (use pickup_port_us_cost as closest match)
  if (vendorCost.pickup_port_us_cost_per_case && customerPrice.dap_price_per_case) {
    comparisons.push({
      tier: 'DAP',
      cost: vendorCost.pickup_port_us_cost_per_case,
      price: customerPrice.dap_price_per_case,
      margin: calculateMargin(customerPrice.dap_price_per_case, vendorCost.pickup_port_us_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.dap_price_per_case, vendorCost.pickup_port_us_cost_per_case)
    })
  }

  // DDP Comparison
  if (vendorCost.ddp_cost_per_case && customerPrice.ddp_price_per_case) {
    comparisons.push({
      tier: 'DDP',
      cost: vendorCost.ddp_cost_per_case,
      price: customerPrice.ddp_price_per_case,
      margin: calculateMargin(customerPrice.ddp_price_per_case, vendorCost.ddp_cost_per_case),
      marginPercent: calculateMarginPercent(customerPrice.ddp_price_per_case, vendorCost.ddp_cost_per_case)
    })
  }

  return comparisons
}

// ============================================================================
// PROFIT CALCULATIONS
// ============================================================================

export interface ProfitCalculation {
  profitPerCase: number
  profitPerPallet: number
  profitPerContainer20ft: number
  profitPerContainer40ft: number
  profitPerContainer40hc: number
  marginPercent: number
}

/**
 * Calculate profit across different container sizes
 */
export function calculateProfit(
  price: number,
  cost: number,
  product: Product
): ProfitCalculation {
  const profitPerCase = calculateMargin(price, cost)
  const marginPercent = calculateMarginPercent(price, cost)

  return {
    profitPerCase,
    profitPerPallet: product.cases_per_pallet
      ? profitPerCase * product.cases_per_pallet
      : 0,
    profitPerContainer20ft: product.cases_per_20ft
      ? profitPerCase * product.cases_per_20ft
      : 0,
    profitPerContainer40ft: product.cases_per_40ft
      ? profitPerCase * product.cases_per_40ft
      : 0,
    profitPerContainer40hc: product.cases_per_40hc
      ? profitPerCase * product.cases_per_40hc
      : 0,
    marginPercent
  }
}

// ============================================================================
// COST WATERFALL CALCULATIONS
// ============================================================================

export interface CostWaterfallStep {
  label: string
  amount: number
  cumulative: number
  description?: string
}

/**
 * Calculate cost waterfall from supplier to customer
 * Shows cost buildup: Supplier → Fees → Freight → Duties → Margin → Customer
 */
export function calculateCostWaterfall(
  vendorCost: ProductVendorCost,
  customerPrice: ProductCustomerPricing,
  importCostBreakdown?: ImportCostBreakdown
): CostWaterfallStep[] {
  const steps: CostWaterfallStep[] = []

  // Start with base cost (EXW, FOB, or DDP depending on what's available)
  const baseCost = vendorCost.exw_cost_per_case || vendorCost.fob_cost_per_case || vendorCost.ddp_cost_per_case || 0
  let cumulative = baseCost

  steps.push({
    label: 'Supplier Base Cost',
    amount: baseCost,
    cumulative,
    description: 'Cost from vendor'
  })

  // Factory fees
  if (vendorCost.factory_fee_per_case) {
    cumulative += vendorCost.factory_fee_per_case
    steps.push({
      label: 'Factory Fee',
      amount: vendorCost.factory_fee_per_case,
      cumulative,
      description: vendorCost.factory_fee_percent
        ? `${(vendorCost.factory_fee_percent * 100).toFixed(2)}%`
        : undefined
    })
  }

  // Vessel freight (for DAP)
  if (customerPrice.dap_vessel_freight_per_case) {
    cumulative += customerPrice.dap_vessel_freight_per_case
    steps.push({
      label: 'Ocean Freight',
      amount: customerPrice.dap_vessel_freight_per_case,
      cumulative,
      description: 'Vessel freight to US port'
    })
  }

  // Import costs (detailed breakdown)
  if (importCostBreakdown && importCostBreakdown.total > 0) {
    for (const detail of importCostBreakdown.details) {
      cumulative += detail.amount
      steps.push({
        label: detail.label,
        amount: detail.amount,
        cumulative,
        description: detail.rate
      })
    }
  }

  // Inland freight (for DDP)
  if (customerPrice.ddp_inland_freight_per_case) {
    cumulative += customerPrice.ddp_inland_freight_per_case
    steps.push({
      label: 'Inland Freight',
      amount: customerPrice.ddp_inland_freight_per_case,
      cumulative,
      description: 'Port to customer warehouse'
    })
  }

  // Final customer price and SFS margin
  const finalPrice = customerPrice.ddp_price_per_case
    || customerPrice.dap_price_per_case
    || customerPrice.fob_price_per_case
    || customerPrice.exw_price_per_case
    || 0

  const sfsMargin = finalPrice - cumulative

  if (sfsMargin !== 0) {
    steps.push({
      label: 'SFS Margin',
      amount: sfsMargin,
      cumulative: finalPrice,
      description: `${calculateMarginPercent(finalPrice, cumulative).toFixed(2)}% margin`
    })
  }

  return steps
}

// ============================================================================
// IMPORT COST CALCULATIONS
// ============================================================================

/**
 * Fetch applicable import cost configuration for a product
 */
export async function fetchImportCostForProduct(
  product: Product
): Promise<ImportCost | null> {
  try {
    // Query by product_id to get current import cost configuration
    const { data, error } = await supabase
      .from('import_costs')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_current', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching import cost:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching import cost:', error)
    return null
  }
}

/**
 * Calculate import costs per case
 */
export interface ImportCostBreakdown {
  importBrokerFee: number
  duty: number
  total: number
  details: {
    label: string
    amount: number
    rate?: string
  }[]
}

export function calculateImportCosts(
  baseCost: number,
  casesPerContainer: number | null,
  importCost: ImportCost | null
): ImportCostBreakdown {
  const breakdown: ImportCostBreakdown = {
    importBrokerFee: 0,
    duty: 0,
    total: 0,
    details: []
  }

  if (!importCost) return breakdown

  // Import broker fee - can be percentage or fixed per case
  let brokerFee = 0
  let brokerFeeRate: string | undefined

  if (importCost.import_broker_fee_per_case) {
    // Fixed dollar amount per case
    brokerFee = importCost.import_broker_fee_per_case
  } else if (importCost.import_broker_fee_percent) {
    // Percentage of FOB cost
    brokerFee = baseCost * (importCost.import_broker_fee_percent / 100)
    brokerFeeRate = `${importCost.import_broker_fee_percent}%`
  }

  if (brokerFee > 0) {
    breakdown.importBrokerFee = brokerFee
    breakdown.details.push({
      label: 'Import Broker Fee',
      amount: brokerFee,
      rate: brokerFeeRate
    })
  }

  // Duty/Tariff - can be percentage or fixed per case
  let duty = 0
  let dutyRate: string | undefined

  if (importCost.duty_per_case) {
    // Fixed dollar amount per case
    duty = importCost.duty_per_case
  } else if (importCost.duty_rate_percent) {
    // Percentage of FOB cost
    duty = baseCost * (importCost.duty_rate_percent / 100)
    dutyRate = `${importCost.duty_rate_percent}%`
  }

  if (duty > 0) {
    breakdown.duty = duty
    breakdown.details.push({
      label: 'Duty/Tariff',
      amount: duty,
      rate: dutyRate
    })
  }

  breakdown.total = breakdown.importBrokerFee + breakdown.duty

  return breakdown
}

/**
 * Calculate landed cost (vendor cost + import costs)
 */
export interface LandedCostCalculation {
  vendorCost: number
  importCosts: ImportCostBreakdown
  landedCost: number
  hasImportCosts: boolean
}

export function calculateLandedCost(
  vendorCostPerCase: number,
  product: Product,
  importCost: ImportCost | null
): LandedCostCalculation {
  const casesPerContainer = product.cases_per_40ft || product.cases_per_40hc || product.cases_per_20ft || null

  const importCosts = calculateImportCosts(vendorCostPerCase, casesPerContainer, importCost)

  return {
    vendorCost: vendorCostPerCase,
    importCosts,
    landedCost: vendorCostPerCase + importCosts.total,
    hasImportCosts: importCosts.total > 0
  }
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `$${value.toFixed(2)}`
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)}%`
}

/**
 * Format margin with color class based on value
 */
export function getMarginColorClass(marginPercent: number): string {
  if (marginPercent < 10) return 'text-red-600'
  if (marginPercent < 20) return 'text-yellow-600'
  return 'text-green-600'
}
