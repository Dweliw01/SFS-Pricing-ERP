'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, ProductCustomerPricing } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function CustomerPricingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const pricingId = params.pricingId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [pricing, setPricing] = useState<ProductCustomerPricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [productId, pricingId])

  async function fetchData() {
    try {
      setLoading(true)

      const [productRes, pricingRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase
          .from('product_customer_pricing')
          .select(`
            *,
            customer:customers(*)
          `)
          .eq('id', pricingId)
          .single()
      ])

      if (productRes.error) throw productRes.error
      if (pricingRes.error) throw pricingRes.error

      setProduct(productRes.data)
      setPricing(pricingRes.data)
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
        .from('product_customer_pricing')
        .delete()
        .eq('id', pricingId)

      if (error) throw error

      router.push(`/products/${productId}`)
    } catch (error: any) {
      console.error('Error deleting customer pricing:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading customer pricing...</div>
      </div>
    )
  }

  if (error || !pricing || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Customer pricing not found'}</p>
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
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Customer Pricing Details</h1>
                  <p className="text-sm text-gray-600">
                    {pricing.customer?.customer_name} • {product.item_number}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${productId}/customer-pricing/${pricingId}/edit`}>
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
              <InfoField label="Customer" value={pricing.customer?.customer_name} />
              <InfoField
                label="Effective Date"
                value={new Date(pricing.effective_date).toLocaleDateString()}
              />
              <InfoField
                label="Status"
                value={
                  pricing.is_current ? (
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

          {/* EXW Pricing */}
          {(pricing.exw_price_per_case || pricing.exw_price_per_unit || pricing.exw_price_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                EXW (Pick-up at Plant)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PriceField
                  label="Price per Case"
                  current={pricing.exw_price_per_case}
                  previous={pricing.exw_previous_price_per_case}
                />
                <PriceField label="Price per Unit" current={pricing.exw_price_per_unit} />
                <PriceField label="Price per Lb" current={pricing.exw_price_per_lb} />
              </div>
            </div>
          )}

          {/* EXW with Rebate */}
          {pricing.exw_rebate_amount ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                EXW with Rebate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InfoField
                  label="Rebate Amount"
                  value={`$${pricing.exw_rebate_amount.toFixed(2)}`}
                />
                <PriceField
                  label="Final Price per Case"
                  current={pricing.exw_rebate_price_per_case}
                />
                <PriceField
                  label="Final Price per Unit"
                  current={pricing.exw_rebate_price_per_unit}
                />
                <PriceField label="Final Price per Lb" current={pricing.exw_rebate_price_per_lb} />
              </div>
            </div>
          ) : null}

          {/* FOB Pricing */}
          {(pricing.fob_price_per_case || pricing.fob_price_per_unit || pricing.fob_price_per_lb) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                FOB (Free on Board)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PriceField label="Price per Case" current={pricing.fob_price_per_case} />
                <PriceField label="Price per Unit" current={pricing.fob_price_per_unit} />
                <PriceField label="Price per Lb" current={pricing.fob_price_per_lb} />
              </div>
            </div>
          )}

          {/* FOB with Rebate */}
          {pricing.fob_rebate_amount ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                FOB with Rebate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InfoField
                  label="Rebate Amount"
                  value={`$${pricing.fob_rebate_amount.toFixed(2)}`}
                />
                <PriceField
                  label="Final Price per Case"
                  current={pricing.fob_rebate_price_per_case}
                />
                <PriceField
                  label="Final Price per Unit"
                  current={pricing.fob_rebate_price_per_unit}
                />
                <PriceField label="Final Price per Lb" current={pricing.fob_rebate_price_per_lb} />
              </div>
            </div>
          ) : null}

          {/* DAP Pricing */}
          {pricing.dap_price_per_case && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                DAP (Delivered at Place - Port USA)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PriceField label="Price per Case" current={pricing.dap_price_per_case} />
                <PriceField label="Price per Unit" current={pricing.dap_price_per_unit} />
                <PriceField label="Price per Lb" current={pricing.dap_price_per_lb} />
                {pricing.dap_vessel_freight_per_case && (
                  <InfoField
                    label="Vessel Freight"
                    value={`$${pricing.dap_vessel_freight_per_case.toFixed(2)}/case`}
                  />
                )}
              </div>
              {pricing.dap_cases_per_container && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <InfoField
                    label="Cases per Container"
                    value={pricing.dap_cases_per_container}
                  />
                </div>
              )}
            </div>
          )}

          {/* DDP Pricing */}
          {pricing.ddp_price_per_case && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                DDP (Delivered Duty Paid - Client Crossdock)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PriceField label="Price per Case" current={pricing.ddp_price_per_case} />
                <PriceField label="Price per Unit" current={pricing.ddp_price_per_unit} />
                <PriceField label="Price per Lb" current={pricing.ddp_price_per_lb} />
                {pricing.ddp_inland_freight_per_case && (
                  <InfoField
                    label="Inland Freight"
                    value={`$${pricing.ddp_inland_freight_per_case.toFixed(2)}/case`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {pricing.pricing_notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{pricing.pricing_notes}</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Customer Pricing"
        message="Are you sure you want to delete this customer pricing entry? This action cannot be undone."
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

function PriceField({
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
              hasIncrease ? 'text-green-600' : hasDecrease ? 'text-red-600' : 'text-gray-500'
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
