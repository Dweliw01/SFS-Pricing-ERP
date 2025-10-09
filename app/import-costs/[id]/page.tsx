'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ImportCost, Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, Edit, Trash2, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'

export default function ImportCostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const costId = params.id as string

  const [importCost, setImportCost] = useState<ImportCost | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [costId])

  async function fetchData() {
    try {
      setLoading(true)

      const { data: costData, error: costError } = await supabase
        .from('import_costs')
        .select(`
          *,
          products:product_id (
            id,
            item_number,
            item_description,
            brand
          )
        `)
        .eq('id', costId)
        .single()

      if (costError) throw costError

      setImportCost(costData)
      setProduct((costData as any).products)
    } catch (error: any) {
      console.error('Error fetching import cost:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)

      const { error } = await supabase
        .from('import_costs')
        .delete()
        .eq('id', costId)

      if (error) throw error

      router.push('/import-costs')
    } catch (error: any) {
      console.error('Error deleting import cost:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading import cost...</div>
      </div>
    )
  }

  if (error || !importCost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Import cost not found'}</p>
          <Link href="/import-costs">
            <Button variant="primary">Back to Import Costs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/import-costs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Import Costs
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Import Cost Details</h1>
                  {product && (
                    <p className="text-sm text-gray-600">
                      {product.item_number} • {product.item_description || 'No description'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/import-costs/${costId}/edit`}>
                <Button variant="secondary">
                  <Edit size={18} className="mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                <Trash2 size={18} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField
                label="Effective Date"
                value={new Date(importCost.effective_date).toLocaleDateString()}
              />
              <InfoField
                label="Status"
                value={
                  importCost.is_current ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Current
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )
                }
              />
            </div>
          </div>

          {/* Product Information */}
          {product && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Product Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Item Number" value={product.item_number} />
                <InfoField label="Brand" value={product.brand} />
                <InfoField label="Description" value={product.item_description} className="md:col-span-2" />
              </div>
              <div className="mt-4">
                <Link href={`/products/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    View Full Product Details →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Import Broker Fees */}
          {(importCost.import_broker_fee_percent || importCost.import_broker_fee_per_case) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Broker Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {importCost.import_broker_fee_percent && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Fee Percentage</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {importCost.import_broker_fee_percent}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Applied to FOB value</div>
                  </div>
                )}
                {importCost.import_broker_fee_per_case && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Fee per Case</div>
                    <div className="text-2xl font-bold text-blue-700">
                      ${importCost.import_broker_fee_per_case.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Fixed amount per case</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duty Rates */}
          {(importCost.duty_rate_percent || importCost.duty_per_case) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Duty Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {importCost.duty_rate_percent && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Duty Rate Percentage</div>
                    <div className="text-2xl font-bold text-orange-700">
                      {importCost.duty_rate_percent}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Tariff rate applied</div>
                  </div>
                )}
                {importCost.duty_per_case && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Duty per Case</div>
                    <div className="text-2xl font-bold text-orange-700">
                      ${importCost.duty_per_case.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Fixed amount per case</div>
                  </div>
                )}
              </div>
              {importCost.previous_tariff_percent && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Previous Tariff Rate:</span>
                    <span className="font-medium text-gray-900">
                      {importCost.previous_tariff_percent}%
                    </span>
                  </div>
                  {importCost.duty_rate_percent && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-semibold ${
                        importCost.duty_rate_percent > importCost.previous_tariff_percent
                          ? 'text-red-600'
                          : importCost.duty_rate_percent < importCost.previous_tariff_percent
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {importCost.duty_rate_percent > importCost.previous_tariff_percent && '↑'}
                        {importCost.duty_rate_percent < importCost.previous_tariff_percent && '↓'}
                        {' '}
                        {Math.abs(importCost.duty_rate_percent - importCost.previous_tariff_percent).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GSP (Generalized System of Preferences) Data */}
          {(importCost.gsp_margin_percent || importCost.gsp_profit_per_case) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">GSP (Generalized System of Preferences)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {importCost.gsp_margin_percent && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">GSP Margin</div>
                    <div className="text-2xl font-bold text-green-700">
                      {importCost.gsp_margin_percent}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Profit margin percentage</div>
                  </div>
                )}
                {importCost.gsp_profit_per_case && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">GSP Profit per Case</div>
                    <div className="text-2xl font-bold text-green-700">
                      ${importCost.gsp_profit_per_case.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Profit amount per case</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Import Costs Summary */}
          {(importCost.import_broker_fee_per_case || importCost.duty_per_case) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Import Costs Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {importCost.import_broker_fee_per_case && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Import Broker Fee:</span>
                    <span className="font-medium text-gray-900">
                      ${importCost.import_broker_fee_per_case.toFixed(2)}/case
                    </span>
                  </div>
                )}
                {importCost.duty_per_case && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duty:</span>
                    <span className="font-medium text-gray-900">
                      ${importCost.duty_per_case.toFixed(2)}/case
                    </span>
                  </div>
                )}
                {importCost.import_broker_fee_per_case && importCost.duty_per_case && (
                  <div className="flex items-center justify-between text-base pt-2 border-t-2 border-gray-300">
                    <span className="font-semibold text-gray-900">Total Import Cost:</span>
                    <span className="font-bold text-blue-700">
                      ${(importCost.import_broker_fee_per_case + importCost.duty_per_case).toFixed(2)}/case
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {importCost.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{importCost.notes}</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Import Cost"
        message="Are you sure you want to delete this import cost configuration? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

function InfoField({ label, value, className = '' }: { label: string; value: any; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  )
}
