'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, TrendingUp, DollarSign, Package, Download, Filter } from 'lucide-react'

export default function ReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalVendors: 0,
    averageMargin: 0
  })
  const [loading, setLoading] = useState(true)

  // Load statistics on mount
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/stats')
      const result = await response.json()

      if (result.success) {
        setStats({
          totalProducts: result.data.totalProducts || 0,
          totalCustomers: result.data.totalCustomers || 0,
          totalVendors: result.data.totalVendors || 0,
          averageMargin: result.data.averageMarginPercent || 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600 mt-1">Generate comprehensive pricing and margin reports</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package className="h-8 w-8 text-blue-600" />}
            label="Total Products"
            value={loading ? '...' : stats.totalProducts}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp className="h-8 w-8 text-green-600" />}
            label="Total Customers"
            value={loading ? '...' : stats.totalCustomers}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<DollarSign className="h-8 w-8 text-purple-600" />}
            label="Total Vendors"
            value={loading ? '...' : stats.totalVendors}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<FileText className="h-8 w-8 text-orange-600" />}
            label="Avg Margin"
            value={loading ? '...' : `${stats.averageMargin.toFixed(1)}%`}
            bgColor="bg-orange-50"
          />
        </div>

        {/* Report Types */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              title="Master Price Report"
              description="Comprehensive report with all product, vendor, customer, cost, and pricing data (190+ fields)"
              icon={<FileText className="h-6 w-6" />}
              href="/reports/master-price"
              color="blue"
            />
            <ReportCard
              title="Margin Analysis"
              description="Focus on margins and profitability across all pricing tiers with calculated fields"
              icon={<TrendingUp className="h-6 w-6" />}
              href="/reports/master-price?preset=margins"
              color="green"
            />
            <ReportCard
              title="Cost Comparison"
              description="Compare costs across all vendor tiers with historical data and change tracking"
              icon={<DollarSign className="h-6 w-6" />}
              href="/reports/master-price?preset=costs"
              color="purple"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/reports/master-price">
              <Button variant="primary" className="w-full md:w-auto">
                <FileText size={18} className="mr-2" />
                Generate Master Price Report
              </Button>
            </Link>
            <div className="text-sm text-gray-600 mt-2">
              Build custom reports with flexible filters and column selection
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({
  icon,
  label,
  value,
  bgColor
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// REPORT CARD COMPONENT
// ============================================================================
function ReportCard({
  title,
  description,
  icon,
  href,
  color
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
  }

  return (
    <Link href={href}>
      <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
        <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
          Generate Report →
        </div>
      </div>
    </Link>
  )
}
