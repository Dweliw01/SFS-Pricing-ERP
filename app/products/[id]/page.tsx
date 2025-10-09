'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, ProductVendorCost, ProductCustomerPricing, ImportCost } from '@/lib/types'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { LandedCostBreakdown } from '@/components/LandedCostBreakdown'
import { ArrowLeft, Edit, Trash2, Package, Plus, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { calculateLandedCost } from '@/lib/calculations'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  async function fetchProduct() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setProduct(data)
    } catch (error: any) {
      console.error('Error fetching product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', params.id)

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      console.error('Error deleting product:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/">
            <Button variant="primary">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'general',
      label: 'General Information',
      content: <GeneralInfoTab product={product} />
    },
    {
      id: 'physical',
      label: 'Physical Specifications',
      content: <PhysicalSpecsTab product={product} />
    },
    {
      id: 'container',
      label: 'Container & Logistics',
      content: <ContainerLogisticsTab product={product} />
    },
    {
      id: 'vendor-costs',
      label: 'Vendor Costs',
      content: <VendorCostsTab productId={product.id} />
    },
    {
      id: 'customer-pricing',
      label: 'Customer Pricing',
      content: <CustomerPricingTab productId={product.id} />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {product.item_number || 'Untitled Product'}
                  </h1>
                  <p className="text-sm text-gray-600">{product.brand || 'No brand'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${product.id}/edit`}>
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs tabs={tabs} defaultTab="general" />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.item_number}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

function GeneralInfoTab({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoField label="Master List Number" value={product.master_list_number} />
      <InfoField label="Item Number" value={product.item_number} />
      <InfoField label="Brand" value={product.brand} />
      <InfoField label="Item Description" value={product.item_description} className="md:col-span-2" />
      <InfoField label="Product Type" value={product.product_type === 'I' ? 'International' : 'Domestic'} />
      <InfoField label="Status" value={
        product.status === 'C' ? 'Current' :
        product.status === 'N' ? 'New' :
        product.status === 'T' ? 'Temporary' : 'Unknown'
      } />
      <InfoField label="Category" value={product.category} />
      <InfoField label="Pack Size" value={product.pack_size} />
      <InfoField label="Units per Case" value={product.units_per_case} />
      <InfoField label="Product of Country" value={product.product_of_country} />
      <InfoField label="HS Code" value={product.hs_code} />
      <InfoField label="Notes" value={product.notes} className="md:col-span-2" />
    </div>
  )
}

function PhysicalSpecsTab({ product }: { product: Product }) {
  return (
    <div className="space-y-8">
      {/* Case Dimensions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Length (in)" value={product.case_length_in} />
          <InfoField label="Width (in)" value={product.case_width_in} />
          <InfoField label="Height (in)" value={product.case_height_in} />
          <InfoField label="Cubic Feet" value={product.case_cube_ft} />
          <InfoField label="Weight (lbs)" value={product.case_weight_lbs} />
        </div>
      </div>

      {/* Pallet Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pallet Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="TI (cases per layer)" value={product.ti} />
          <InfoField label="HI (layers high)" value={product.hi} />
          <InfoField label="Cases per Pallet" value={product.cases_per_pallet} />
          <InfoField label="Pallet Weight (lbs)" value={product.pallet_weight_lbs} />
        </div>
      </div>

      {/* Unit Dimensions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Unit Length (in)" value={product.unit_length_in} />
          <InfoField label="Unit Width (in)" value={product.unit_width_in} />
          <InfoField label="Unit Height (in)" value={product.unit_height_in} />
          <InfoField label="Unit Weight (oz)" value={product.unit_weight_oz} />
        </div>
      </div>
    </div>
  )
}

function ContainerLogisticsTab({ product }: { product: Product }) {
  return (
    <div className="space-y-8">
      {/* Container 20ft */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">20ft Container</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Pallets per Container" value={product.pallets_per_20ft} />
          <InfoField label="Cases per Container" value={product.cases_per_20ft} />
        </div>
      </div>

      {/* Container 40ft */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">40ft Container</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Pallets per Container" value={product.pallets_per_40ft} />
          <InfoField label="Cases per Container" value={product.cases_per_40ft} />
        </div>
      </div>

      {/* Container 40ft HC */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">40ft HC Container</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Pallets per Container" value={product.pallets_per_40hc} />
          <InfoField label="Cases per Container" value={product.cases_per_40hc} />
        </div>
      </div>

      {/* Shipping Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Stackable" value={product.stackable ? 'Yes' : 'No'} />
          <InfoField label="Lead Time (days)" value={product.lead_time_days} />
          <InfoField label="Minimum Order Quantity" value={product.moq} />
        </div>
      </div>
    </div>
  )
}

function VendorCostsTab({ productId }: { productId: string }) {
  const [costs, setCosts] = useState<ProductVendorCost[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [importCost, setImportCost] = useState<ImportCost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorCosts()
  }, [productId])

  async function fetchVendorCosts() {
    try {
      setLoading(true)

      // Fetch product and vendor costs
      const [costsRes, productRes] = await Promise.all([
        supabase
          .from('product_vendor_costs')
          .select(`
            *,
            vendor:vendors(*)
          `)
          .eq('product_id', productId)
          .order('effective_date', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()
      ])

      if (costsRes.error) throw costsRes.error
      if (productRes.error) throw productRes.error

      setCosts(costsRes.data || [])
      setProduct(productRes.data)

      // Fetch import costs for product
      if (productRes.data) {
        try {
          const { data: importCostData, error: importError } = await supabase
            .from('import_costs')
            .select('*')
            .eq('product_id', productRes.data.id)
            .eq('is_current', true)
            .order('effective_date', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (!importError) {
            setImportCost(importCostData)
          }
        } catch (err) {
          console.error('Error fetching import cost:', err)
        }
      }
    } catch (error: any) {
      console.error('Error fetching vendor costs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading vendor costs...</div>
  }

  if (costs.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendor Costs</h3>
        <p className="text-gray-600 mb-6">Add vendor cost information to track pricing history.</p>
        <Link href={`/products/${productId}/vendor-costs/add`}>
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Add Vendor Cost
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Cost History</h3>
        <Link href={`/products/${productId}/vendor-costs/add`}>
          <Button variant="primary" size="sm">
            <Plus size={18} className="mr-2" />
            Add Cost
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {costs.map((cost) => (
          <div key={cost.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{cost.vendor?.vendor_name || 'Unknown Vendor'}</h4>
                <p className="text-sm text-gray-600">
                  Effective: {new Date(cost.effective_date).toLocaleDateString()}
                  {cost.is_current && (
                    <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </p>
              </div>
              <Link href={`/products/${productId}/vendor-costs/${cost.id}`}>
                <Button variant="ghost" size="sm">View Details</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <CostCard
                label="EXW"
                current={cost.exw_cost_per_case}
                previous={cost.exw_previous_cost_per_case}
              />
              <CostCard
                label="FOB"
                current={cost.fob_cost_per_case}
                previous={cost.fob_previous_cost_per_case}
              />
              <CostCard
                label="Pickup Plant"
                current={cost.pickup_plant_cost_per_case}
                previous={cost.pickup_plant_previous_cost_per_case}
              />
              <CostCard
                label="Pickup Port US"
                current={cost.pickup_port_us_cost_per_case}
                previous={cost.pickup_port_us_previous_cost_per_case}
              />
              <CostCard
                label="DDP"
                current={cost.ddp_cost_per_case}
                previous={cost.ddp_previous_cost_per_case}
              />
            </div>

            {cost.factory_fee_percent && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Factory Fee: {(cost.factory_fee_percent * 100).toFixed(2)}%
                  {cost.factory_fee_per_case && ` ($${cost.factory_fee_per_case.toFixed(2)}/case)`}
                </span>
              </div>
            )}

            {/* Landed Cost Breakdown */}
            {product && cost.fob_cost_per_case && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <LandedCostBreakdown
                  landedCost={calculateLandedCost(cost.fob_cost_per_case, product, importCost)}
                  showDetails={true}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CostCard({
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
    <div className="bg-gray-50 rounded p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">
        {current ? `$${current.toFixed(2)}` : '-'}
      </div>
      {previous && (
        <div className={`text-xs ${hasIncrease ? 'text-red-600' : hasDecrease ? 'text-green-600' : 'text-gray-500'}`}>
          {hasIncrease && '↑'}{hasDecrease && '↓'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

function CustomerPricingTab({ productId }: { productId: string }) {
  const [pricing, setPricing] = useState<ProductCustomerPricing[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [importCost, setImportCost] = useState<ImportCost | null>(null)
  const [currentVendorCost, setCurrentVendorCost] = useState<ProductVendorCost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerPricing()
  }, [productId])

  async function fetchCustomerPricing() {
    try {
      setLoading(true)

      // Fetch product, pricing, and current vendor cost
      const [pricingRes, productRes, vendorCostRes] = await Promise.all([
        supabase
          .from('product_customer_pricing')
          .select(`
            *,
            customer:customers(*)
          `)
          .eq('product_id', productId)
          .order('effective_date', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single(),
        supabase
          .from('product_vendor_costs')
          .select('*')
          .eq('product_id', productId)
          .eq('is_current', true)
          .maybeSingle()
      ])

      if (pricingRes.error) throw pricingRes.error
      if (productRes.error) throw productRes.error

      setPricing(pricingRes.data || [])
      setProduct(productRes.data)
      setCurrentVendorCost(vendorCostRes.data)

      // Fetch import costs
      if (productRes.data) {
        try {
          const { data: importCostData, error: importError } = await supabase
            .from('import_costs')
            .select('*')
            .eq('product_id', productRes.data.id)
            .eq('is_current', true)
            .order('effective_date', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (!importError) {
            setImportCost(importCostData)
          }
        } catch (err) {
          console.error('Error fetching import cost:', err)
        }
      }
    } catch (error: any) {
      console.error('Error fetching customer pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading customer pricing...</div>
  }

  if (pricing.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Pricing</h3>
        <p className="text-gray-600 mb-6">Add customer pricing to track sales prices and margins.</p>
        <Link href={`/products/${productId}/customer-pricing/add`}>
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Add Customer Pricing
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Customer Pricing History</h3>
        <Link href={`/products/${productId}/customer-pricing/add`}>
          <Button variant="primary" size="sm">
            <Plus size={18} className="mr-2" />
            Add Pricing
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {pricing.map((price) => (
          <div key={price.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{price.customer?.customer_name || 'Unknown Customer'}</h4>
                <p className="text-sm text-gray-600">
                  Effective: {new Date(price.effective_date).toLocaleDateString()}
                  {price.is_current && (
                    <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </p>
              </div>
              <Link href={`/products/${productId}/customer-pricing/${price.id}`}>
                <Button variant="ghost" size="sm">View Details</Button>
              </Link>
            </div>

            {/* EXW Pricing */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">EXW (Pick-up at Plant)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PriceCard
                  label="Price per Case"
                  current={price.exw_price_per_case}
                  previous={price.exw_previous_price_per_case}
                />
                <PriceCard
                  label="Price per Unit"
                  current={price.exw_price_per_unit}
                />
                <PriceCard
                  label="Price per Lb"
                  current={price.exw_price_per_lb}
                />
                {price.exw_rebate_amount ? (
                  <PriceCard
                    label="With Rebate"
                    current={price.exw_rebate_price_per_case}
                    badge={`-$${price.exw_rebate_amount.toFixed(2)}`}
                  />
                ) : null}
              </div>
            </div>

            {/* FOB Pricing */}
            {(price.fob_price_per_case || price.fob_rebate_price_per_case) && (
              <div className="mb-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">FOB (Free on Board)</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PriceCard
                    label="Price per Case"
                    current={price.fob_price_per_case}
                  />
                  <PriceCard
                    label="Price per Unit"
                    current={price.fob_price_per_unit}
                  />
                  <PriceCard
                    label="Price per Lb"
                    current={price.fob_price_per_lb}
                  />
                  {price.fob_rebate_amount ? (
                    <PriceCard
                      label="With Rebate"
                      current={price.fob_rebate_price_per_case}
                      badge={`-$${price.fob_rebate_amount.toFixed(2)}`}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* DAP Pricing */}
            {price.dap_price_per_case && (
              <div className="mb-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">DAP (Delivered at Place - Port USA)</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PriceCard
                    label="Price per Case"
                    current={price.dap_price_per_case}
                  />
                  <PriceCard
                    label="Price per Unit"
                    current={price.dap_price_per_unit}
                  />
                  <PriceCard
                    label="Price per Lb"
                    current={price.dap_price_per_lb}
                  />
                  {price.dap_vessel_freight_per_case && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Vessel Freight</div>
                      <div className="text-sm font-medium text-gray-700">
                        ${price.dap_vessel_freight_per_case.toFixed(2)}/case
                      </div>
                      {price.dap_cases_per_container && (
                        <div className="text-xs text-gray-500 mt-1">
                          {price.dap_cases_per_container} cases/container
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DDP Pricing */}
            {price.ddp_price_per_case && (
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">DDP (Delivered Duty Paid - Client Crossdock)</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PriceCard
                    label="Price per Case"
                    current={price.ddp_price_per_case}
                  />
                  <PriceCard
                    label="Price per Unit"
                    current={price.ddp_price_per_unit}
                  />
                  <PriceCard
                    label="Price per Lb"
                    current={price.ddp_price_per_lb}
                  />
                  {price.ddp_inland_freight_per_case && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Inland Freight</div>
                      <div className="text-sm font-medium text-gray-700">
                        ${price.ddp_inland_freight_per_case.toFixed(2)}/case
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {price.pricing_notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {price.pricing_notes}
                </p>
              </div>
            )}

            {/* Margin Analysis with Landed Costs */}
            {product && currentVendorCost && currentVendorCost.fob_cost_per_case && price.fob_price_per_case && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Margin Analysis (FOB Basis)</h5>
                {(() => {
                  const landedCost = calculateLandedCost(currentVendorCost.fob_cost_per_case, product, importCost)
                  const margin = price.fob_price_per_case - landedCost.landedCost
                  const marginPercent = (margin / landedCost.landedCost) * 100

                  return (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Vendor FOB Cost:</span>
                        <span className="font-medium text-gray-900">${currentVendorCost.fob_cost_per_case.toFixed(2)}</span>
                      </div>
                      {landedCost.hasImportCosts && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Import Costs:</span>
                          <span className="font-medium text-blue-700">+${landedCost.importCosts.total.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-300">
                        <span className="text-gray-700 font-medium">Landed Cost:</span>
                        <span className="font-semibold text-gray-900">${landedCost.landedCost.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Customer FOB Price:</span>
                        <span className="font-medium text-gray-900">${price.fob_price_per_case.toFixed(2)}</span>
                      </div>
                      <div className={`flex items-center justify-between text-base pt-2 border-t-2 ${marginPercent >= 20 ? 'border-green-500' : marginPercent >= 10 ? 'border-yellow-500' : 'border-red-500'}`}>
                        <span className="font-semibold text-gray-900">SFS Margin:</span>
                        <div className="text-right">
                          <div className={`font-bold ${marginPercent >= 20 ? 'text-green-600' : marginPercent >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                            ${margin.toFixed(2)}/case
                          </div>
                          <div className={`text-sm font-semibold ${marginPercent >= 20 ? 'text-green-600' : marginPercent >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {marginPercent.toFixed(1)}% margin
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceCard({
  label,
  current,
  previous,
  badge
}: {
  label: string
  current?: number | null
  previous?: number | null
  badge?: string
}) {
  if (!current && !previous) return null

  const change = current && previous && previous !== 0 ? ((current - previous) / previous) * 100 : 0
  const hasIncrease = change > 0
  const hasDecrease = change < 0

  return (
    <div className="bg-gray-50 rounded p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">
        {current ? `$${current.toFixed(2)}` : '-'}
      </div>
      {badge && (
        <div className="text-xs text-green-600 mt-1">{badge}</div>
      )}
      {previous && previous !== 0 && (
        <div className={`text-xs ${hasIncrease ? 'text-green-600' : hasDecrease ? 'text-red-600' : 'text-gray-500'}`}>
          {hasIncrease && '↑'}{hasDecrease && '↓'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

function InfoField({
  label,
  value,
  className = ''
}: {
  label: string
  value: any
  className?: string
}) {
  const displayValue = value !== null && value !== undefined && value !== '' ? value : '-'

  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{displayValue}</dd>
    </div>
  )
}
