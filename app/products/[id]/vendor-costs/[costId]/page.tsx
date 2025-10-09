'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, ProductVendorCost } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, Edit, Trash2, DollarSign, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default function VendorCostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const costId = params.costId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [cost, setCost] = useState<ProductVendorCost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [productId, costId])

  async function fetchData() {
    try {
      setLoading(true)

      const [productRes, costRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase
          .from('product_vendor_costs')
          .select(`
            *,
            vendor:vendors(*)
          `)
          .eq('id', costId)
          .single()
      ])

      if (productRes.error) throw productRes.error
      if (costRes.error) throw costRes.error

      setProduct(productRes.data)
      setCost(costRes.data)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)

      const { error } = await supabase
        .from('product_vendor_costs')
        .delete()
        .eq('id', costId)

      if (error) throw error

      router.push(`/products/${productId}`)
    } catch (error: any) {
      console.error('Error deleting vendor cost:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading vendor cost...</div>
      </div>
    )
  }

  if (error || !cost || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Vendor cost not found'}</p>
          <Link href={`/products/${productId}`}>
            <Button variant="primary">Back to Product</Button>
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
              <Link href={`/products/${productId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Product
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Vendor Cost Details</h1>
                  <p className="text-sm text-gray-600">
                    {cost.vendor?.vendor_name} • {product.item_number}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${productId}/vendor-costs/${costId}/edit`}>
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
              <InfoField label="Vendor" value={cost.vendor?.vendor_name} />
              <InfoField
                label="Effective Date"
                value={new Date(cost.effective_date).toLocaleDateString()}
              />
              <InfoField
                label="Status"
                value={
                  cost.is_current ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Current
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Historical
                    </span>
                  )
                }
              />
            </div>
          </div>

          {/* EXW Costs */}
          {(cost.exw_cost_per_case || cost.exw_cost_per_unit || cost.exw_cost_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                EXW (Ex Works - At Plant)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CostField
                  label="Cost per Case"
                  current={cost.exw_cost_per_case}
                  previous={cost.exw_previous_cost_per_case}
                />
                <CostField label="Cost per Unit" current={cost.exw_cost_per_unit} />
                <CostField label="Cost per Lb" current={cost.exw_cost_per_lb} />
                {cost.exw_previous_cost_per_lb && (
                  <CostField label="Previous Cost/Lb" current={cost.exw_previous_cost_per_lb} />
                )}
              </div>
            </div>
          )}

          {/* FOB Costs */}
          {(cost.fob_cost_per_case || cost.fob_cost_per_unit || cost.fob_cost_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                FOB (Free on Board - Port Origin)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CostField
                  label="Cost per Case"
                  current={cost.fob_cost_per_case}
                  previous={cost.fob_previous_cost_per_case}
                />
                <CostField label="Cost per Unit" current={cost.fob_cost_per_unit} />
                <CostField label="Cost per Lb" current={cost.fob_cost_per_lb} />
                {cost.fob_previous_cost_per_lb && (
                  <CostField label="Previous Cost/Lb" current={cost.fob_previous_cost_per_lb} />
                )}
              </div>
            </div>
          )}

          {/* Pickup at Plant */}
          {(cost.pickup_plant_cost_per_case || cost.pickup_plant_cost_per_unit || cost.pickup_plant_cost_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                Pickup at Plant
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CostField
                  label="Cost per Case"
                  current={cost.pickup_plant_cost_per_case}
                  previous={cost.pickup_plant_previous_cost_per_case}
                />
                <CostField label="Cost per Unit" current={cost.pickup_plant_cost_per_unit} />
                <CostField label="Cost per Lb" current={cost.pickup_plant_cost_per_lb} />
                {cost.pickup_plant_previous_cost_per_lb && (
                  <CostField label="Previous Cost/Lb" current={cost.pickup_plant_previous_cost_per_lb} />
                )}
              </div>
            </div>
          )}

          {/* Pickup at Port US */}
          {(cost.pickup_port_us_cost_per_case || cost.pickup_port_us_cost_per_unit || cost.pickup_port_us_cost_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                Pickup at Port US
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CostField
                  label="Cost per Case"
                  current={cost.pickup_port_us_cost_per_case}
                  previous={cost.pickup_port_us_previous_cost_per_case}
                />
                <CostField label="Cost per Unit" current={cost.pickup_port_us_cost_per_unit} />
                <CostField label="Cost per Lb" current={cost.pickup_port_us_cost_per_lb} />
                {cost.pickup_port_us_previous_cost_per_lb && (
                  <CostField label="Previous Cost/Lb" current={cost.pickup_port_us_previous_cost_per_lb} />
                )}
              </div>
            </div>
          )}

          {/* DDP Costs */}
          {(cost.ddp_cost_per_case || cost.ddp_cost_per_unit || cost.ddp_cost_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                DDP (Delivered Duty Paid)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CostField
                  label="Cost per Case"
                  current={cost.ddp_cost_per_case}
                  previous={cost.ddp_previous_cost_per_case}
                />
                <CostField label="Cost per Unit" current={cost.ddp_cost_per_unit} />
                <CostField label="Cost per Lb" current={cost.ddp_cost_per_lb} />
                {cost.ddp_previous_cost_per_lb && (
                  <CostField label="Previous Cost/Lb" current={cost.ddp_previous_cost_per_lb} />
                )}
              </div>
            </div>
          )}

          {/* Factory Fees */}
          {(cost.factory_fee_percent || cost.factory_fee_per_case) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Factory Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cost.factory_fee_percent && (
                  <InfoField
                    label="Factory Fee Percentage"
                    value={`${(cost.factory_fee_percent * 100).toFixed(2)}%`}
                  />
                )}
                {cost.factory_fee_per_case && (
                  <InfoField
                    label="Factory Fee per Case"
                    value={`$${cost.factory_fee_per_case.toFixed(2)}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {cost.cost_notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{cost.cost_notes}</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Vendor Cost"
        message="Are you sure you want to delete this vendor cost entry? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  )
}

function CostField({
  label,
  current,
  previous
}: {
  label: string
  current?: number | null
  previous?: number | null
}) {
  if (!current && !previous) return null

  const change = current && previous ? ((current - previous) / previous) * 100 : 0
  const hasIncrease = change > 0
  const hasDecrease = change < 0

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
      <div className="text-xl font-bold text-gray-900 mb-1">
        {current ? `$${current.toFixed(2)}` : '-'}
      </div>
      {previous && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">was ${previous.toFixed(2)}</span>
          <span
            className={`text-xs font-medium ${
              hasIncrease ? 'text-red-600' : hasDecrease ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {hasIncrease && '↑'}
            {hasDecrease && '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}
