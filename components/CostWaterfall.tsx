// components/CostWaterfall.tsx
import { CostWaterfallStep, formatCurrency } from '@/lib/calculations'
import { TrendingUp, ArrowRight } from 'lucide-react'

interface CostWaterfallProps {
  steps: CostWaterfallStep[]
  title?: string
}

export function CostWaterfall({ steps, title = 'Cost Waterfall Analysis' }: CostWaterfallProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No cost data available for waterfall analysis
      </div>
    )
  }

  const maxAmount = Math.max(...steps.map(s => s.cumulative))
  const finalPrice = steps[steps.length - 1]?.cumulative || 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isFirst = index === 0
          const isLast = index === steps.length - 1
          const widthPercent = (step.cumulative / maxAmount) * 100
          const incrementWidthPercent = isFirst ? widthPercent : (step.amount / maxAmount) * 100

          // Color coding
          let barColor = 'bg-gray-400'
          if (isFirst) barColor = 'bg-blue-500'
          if (isLast) barColor = step.amount >= 0 ? 'bg-green-500' : 'bg-red-500'

          return (
            <div key={index} className="space-y-2">
              {/* Step label and values */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{step.label}</span>
                    {step.description && (
                      <span className="text-xs text-gray-500">({step.description})</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {!isFirst && (
                    <span className={`font-medium ${step.amount >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                      {step.amount >= 0 ? '+' : ''}{formatCurrency(step.amount)}
                    </span>
                  )}
                  {isFirst && (
                    <span className="font-medium text-gray-700">
                      {formatCurrency(step.amount)}
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 min-w-[80px] text-right">
                    {formatCurrency(step.cumulative)}
                  </span>
                </div>
              </div>

              {/* Visual bar */}
              <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                {isFirst ? (
                  // First bar shows full width from 0
                  <div
                    className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <div className="h-full flex items-center justify-end pr-2">
                      <span className="text-xs font-medium text-white">
                        {formatCurrency(step.amount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Subsequent bars stack on previous cumulative
                  <>
                    {/* Previous cumulative (light background) */}
                    <div
                      className="absolute left-0 top-0 h-full bg-gray-300"
                      style={{ width: `${((step.cumulative - step.amount) / maxAmount) * 100}%` }}
                    />
                    {/* Current increment */}
                    <div
                      className={`absolute top-0 h-full ${barColor} transition-all duration-300`}
                      style={{
                        left: `${((step.cumulative - step.amount) / maxAmount) * 100}%`,
                        width: `${incrementWidthPercent}%`
                      }}
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(step.amount)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Final Customer Price</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(finalPrice)}</span>
        </div>
        {steps.length > 1 && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Cost Build-up</span>
            <span className="font-medium text-gray-700">
              {formatCurrency(finalPrice - steps[0].amount)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact version for inline display
export function CostWaterfallCompact({ steps }: { steps: CostWaterfallStep[] }) {
  if (steps.length === 0) return null

  const baseCost = steps[0]?.amount || 0
  const finalPrice = steps[steps.length - 1]?.cumulative || 0
  const totalAdded = finalPrice - baseCost

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-gray-900">{formatCurrency(baseCost)}</span>
      {steps.slice(1).map((step, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className="text-gray-400">+</span>
          <span className={step.amount >= 0 ? 'text-gray-600' : 'text-red-600'}>
            {formatCurrency(Math.abs(step.amount))}
          </span>
        </span>
      ))}
      <span className="text-gray-400">=</span>
      <span className="font-semibold text-gray-900">{formatCurrency(finalPrice)}</span>
    </div>
  )
}
