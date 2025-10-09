// components/LandedCostBreakdown.tsx
import { LandedCostCalculation, formatCurrency } from '@/lib/calculations'
import { Ship, AlertCircle, CheckCircle } from 'lucide-react'

interface LandedCostBreakdownProps {
  landedCost: LandedCostCalculation
  showDetails?: boolean
}

export function LandedCostBreakdown({ landedCost, showDetails = true }: LandedCostBreakdownProps) {
  if (!landedCost.hasImportCosts) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">No Import Costs Applied</p>
            <p className="text-sm text-blue-700 mt-1">
              Configure import costs for this product's HS Code and country to see landed cost calculations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Ship className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Landed Cost Breakdown</h3>
      </div>

      <div className="space-y-4">
        {/* Vendor Cost */}
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Vendor Cost</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(landedCost.vendorCost)}
          </span>
        </div>

        {/* Import Costs Details */}
        {showDetails && landedCost.importCosts.details.length > 0 && (
          <div className="space-y-2 py-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Import Costs:</div>
            {landedCost.importCosts.details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between pl-4">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">+</span>
                  {detail.label}
                  {detail.rate && (
                    <span className="text-xs text-gray-500">({detail.rate})</span>
                  )}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {formatCurrency(detail.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total Import Costs Summary */}
        {!showDetails && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Total Import Costs
              <span className="text-xs text-gray-500 ml-2">
                ({landedCost.importCosts.details.length} items)
              </span>
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(landedCost.importCosts.total)}
            </span>
          </div>
        )}

        {/* Landed Cost Total */}
        <div className="flex items-center justify-between pt-2 bg-green-50 -mx-6 px-6 py-3 rounded-b-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-base font-semibold text-gray-900">Total Landed Cost</span>
          </div>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(landedCost.landedCost)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Compact version for inline display
export function LandedCostCompact({ landedCost }: { landedCost: LandedCostCalculation }) {
  if (!landedCost.hasImportCosts) {
    return (
      <div className="text-sm text-gray-900">
        {formatCurrency(landedCost.vendorCost)} <span className="text-gray-500">(no import costs)</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Vendor:</span>
        <span className="font-medium text-gray-900">{formatCurrency(landedCost.vendorCost)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Import:</span>
        <span className="font-medium text-gray-900">
          +{formatCurrency(landedCost.importCosts.total)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm pt-1 border-t border-gray-200">
        <span className="text-gray-700 font-medium">Landed:</span>
        <span className="font-bold text-green-600">{formatCurrency(landedCost.landedCost)}</span>
      </div>
    </div>
  )
}

// Badge version for summary display
export function LandedCostBadge({ landedCost }: { landedCost: LandedCostCalculation }) {
  return (
    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
      <Ship className="h-4 w-4 text-green-600" />
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-600">Landed:</span>
        <span className="font-semibold text-green-700">
          {formatCurrency(landedCost.landedCost)}
        </span>
        {landedCost.hasImportCosts && (
          <span className="text-xs text-gray-500">
            (+{formatCurrency(landedCost.importCosts.total)})
          </span>
        )}
      </div>
    </div>
  )
}
