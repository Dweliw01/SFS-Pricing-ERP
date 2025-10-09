'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ImportCost } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/Navigation'
import { DollarSign, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function ImportCostsPage() {
  const [importCosts, setImportCosts] = useState<ImportCost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchImportCosts()
  }, [])

  async function fetchImportCosts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('import_costs')
        .select(`
          *,
          products:product_id (
            item_number,
            item_description
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setImportCosts(data || [])
    } catch (error: any) {
      console.error('Error fetching import costs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCosts = importCosts.filter(cost => {
    const search = searchTerm.toLowerCase()
    return (
      (cost as any).products?.item_number?.toLowerCase().includes(search) ||
      (cost as any).products?.item_description?.toLowerCase().includes(search) ||
      cost.notes?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Import Costs</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage tariffs, duties, and import-related costs
                </p>
              </div>
            </div>
            <Link href="/import-costs/add">
              <Button variant="primary">
                <Plus size={18} className="mr-2" />
                Add Import Cost
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product number, description, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900">{importCosts.length}</div>
            <div className="text-sm text-gray-600">Total Configurations</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900">
              {importCosts.filter(c => c.is_current).length}
            </div>
            <div className="text-sm text-gray-600">Current/Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900">
              {importCosts.filter(c => c.gsp_margin_percent || c.gsp_profit_per_case).length}
            </div>
            <div className="text-sm text-gray-600">With GSP Data</div>
          </div>
        </div>

        {/* Import Costs List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-500">Loading import costs...</div>
          </div>
        ) : filteredCosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching import costs' : 'No import costs configured'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by adding your first import cost configuration'}
            </p>
            {!searchTerm && (
              <Link href="/import-costs/add">
                <Button variant="primary">
                  <Plus size={18} className="mr-2" />
                  Add Import Cost
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Broker Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duty Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GSP Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCosts.map((cost) => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {(cost as any).products?.item_number || '-'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(cost as any).products?.item_description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{cost.import_broker_fee_percent ? `${cost.import_broker_fee_percent}%` : '-'}</div>
                      <div className="text-xs text-gray-500">
                        {cost.import_broker_fee_per_case ? `$${cost.import_broker_fee_per_case.toFixed(2)}/case` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{cost.duty_rate_percent ? `${cost.duty_rate_percent}%` : '-'}</div>
                      <div className="text-xs text-gray-500">
                        {cost.duty_per_case ? `$${cost.duty_per_case.toFixed(2)}/case` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{cost.gsp_margin_percent ? `${cost.gsp_margin_percent}%` : '-'}</div>
                      <div className="text-xs text-gray-500">
                        {cost.gsp_profit_per_case ? `$${cost.gsp_profit_per_case.toFixed(2)}/case` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(cost.effective_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {cost.is_current ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/import-costs/${cost.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
