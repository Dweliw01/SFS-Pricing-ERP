// components/ProfitCalculator.tsx
import { Product } from '@/lib/types'
import { calculateProfit, formatCurrency, formatPercent, getMarginColorClass } from '@/lib/calculations'
import { TrendingUp, Package, Truck, Ship } from 'lucide-react'

interface ProfitCalculatorProps {
  price: number
  cost: number
  product: Product
  title?: string
  showDetails?: boolean
}

export function ProfitCalculator({
  price,
  cost,
  product,
  title = 'Profit Analysis',
  showDetails = true
}: ProfitCalculatorProps) {
  const profit = calculateProfit(price, cost, product)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Main Profit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProfitCard
          icon={<Package size={20} />}
          label="Profit per Case"
          value={profit.profitPerCase}
          color="blue"
        />
        <ProfitCard
          icon={<Truck size={20} />}
          label="Profit per Pallet"
          value={profit.profitPerPallet}
          subtitle={product.cases_per_pallet ? `${product.cases_per_pallet} cases` : undefined}
          color="indigo"
        />
        <ProfitCard
          icon={<Ship size={20} />}
          label="Margin"
          value={profit.marginPercent}
          isPercent
          color={profit.marginPercent >= 20 ? 'green' : profit.marginPercent >= 10 ? 'yellow' : 'red'}
        />
      </div>

      {/* Container Profit Breakdown */}
      {showDetails && (product.cases_per_20ft || product.cases_per_40ft || product.cases_per_40hc) && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Container Profit Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.cases_per_20ft && (
              <ContainerCard
                label="20ft Container"
                cases={product.cases_per_20ft}
                profit={profit.profitPerContainer20ft}
              />
            )}
            {product.cases_per_40ft && (
              <ContainerCard
                label="40ft Container"
                cases={product.cases_per_40ft}
                profit={profit.profitPerContainer40ft}
              />
            )}
            {product.cases_per_40hc && (
              <ContainerCard
                label="40ft HC Container"
                cases={product.cases_per_40hc}
                profit={profit.profitPerContainer40hc}
              />
            )}
          </div>
        </div>
      )}

      {/* Cost vs Price Summary */}
      {showDetails && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cost per Case:</span>
              <span className="ml-2 font-medium text-gray-900">{formatCurrency(cost)}</span>
            </div>
            <div>
              <span className="text-gray-600">Price per Case:</span>
              <span className="ml-2 font-medium text-gray-900">{formatCurrency(price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProfitCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subtitle?: string
  isPercent?: boolean
  color?: 'blue' | 'green' | 'indigo' | 'yellow' | 'red'
}

function ProfitCard({ icon, label, value, subtitle, isPercent, color = 'blue' }: ProfitCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {isPercent ? formatPercent(value) : formatCurrency(value)}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  )
}

interface ContainerCardProps {
  label: string
  cases: number
  profit: number
}

function ContainerCard({ label, cases, profit }: ContainerCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="text-xl font-bold text-gray-900 mb-1">
        {formatCurrency(profit)}
      </div>
      <div className="text-xs text-gray-600">
        {cases} cases × {formatCurrency(profit / cases)}
      </div>
    </div>
  )
}

// Compact version for inline display
export function ProfitCalculatorCompact({
  price,
  cost,
  product
}: {
  price: number
  cost: number
  product: Product
}) {
  const profit = calculateProfit(price, cost, product)

  return (
    <div className="flex items-center gap-4 text-sm">
      <div>
        <span className="text-gray-600">Per Case:</span>
        <span className={`ml-1 font-semibold ${getMarginColorClass(profit.marginPercent)}`}>
          {formatCurrency(profit.profitPerCase)}
        </span>
      </div>
      {product.cases_per_pallet && (
        <div>
          <span className="text-gray-600">Per Pallet:</span>
          <span className={`ml-1 font-semibold ${getMarginColorClass(profit.marginPercent)}`}>
            {formatCurrency(profit.profitPerPallet)}
          </span>
        </div>
      )}
      <div>
        <span className="text-gray-600">Margin:</span>
        <span className={`ml-1 font-semibold ${getMarginColorClass(profit.marginPercent)}`}>
          {formatPercent(profit.marginPercent)}
        </span>
      </div>
    </div>
  )
}

// Comparison table for multiple price/cost scenarios
export function ProfitComparisonTable({
  scenarios,
  product
}: {
  scenarios: Array<{
    label: string
    price: number
    cost: number
  }>
  product: Product
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Scenario
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Cost
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Profit/Case
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Profit/Pallet
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Margin %
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {scenarios.map((scenario, index) => {
            const profit = calculateProfit(scenario.price, scenario.cost, product)
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {scenario.label}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  {formatCurrency(scenario.cost)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {formatCurrency(scenario.price)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(profit.profitPerCase)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {product.cases_per_pallet ? formatCurrency(profit.profitPerPallet) : '-'}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-semibold ${getMarginColorClass(profit.marginPercent)}`}>
                  {formatPercent(profit.marginPercent)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
