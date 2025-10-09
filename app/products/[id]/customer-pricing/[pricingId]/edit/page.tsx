'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, ProductCustomerPricing } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditCustomerPricingPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const pricingId = params.pricingId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [pricing, setPricing] = useState<ProductCustomerPricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    effective_date: '',

    // EXW pricing
    exw_price_per_case: '',
    exw_price_per_unit: '',
    exw_price_per_lb: '',
    exw_previous_price_per_case: '',

    // EXW with Rebate
    exw_rebate_amount: '',
    exw_rebate_price_per_case: '',
    exw_rebate_price_per_unit: '',
    exw_rebate_price_per_lb: '',

    // FOB pricing
    fob_price_per_case: '',
    fob_price_per_unit: '',
    fob_price_per_lb: '',

    // FOB with Rebate
    fob_rebate_amount: '',
    fob_rebate_price_per_case: '',
    fob_rebate_price_per_unit: '',
    fob_rebate_price_per_lb: '',

    // DAP pricing
    dap_cases_per_container: '',
    dap_vessel_freight_per_case: '',
    dap_price_per_case: '',
    dap_price_per_unit: '',
    dap_price_per_lb: '',

    // DDP pricing
    ddp_inland_freight_per_case: '',
    ddp_price_per_case: '',
    ddp_price_per_unit: '',
    ddp_price_per_lb: '',

    pricing_notes: ''
  })

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

      // Populate form with existing data
      const p = pricingRes.data
      setFormData({
        effective_date: p.effective_date || '',
        exw_price_per_case: p.exw_price_per_case?.toString() || '',
        exw_price_per_unit: p.exw_price_per_unit?.toString() || '',
        exw_price_per_lb: p.exw_price_per_lb?.toString() || '',
        exw_previous_price_per_case: p.exw_previous_price_per_case?.toString() || '',
        exw_rebate_amount: p.exw_rebate_amount?.toString() || '',
        exw_rebate_price_per_case: p.exw_rebate_price_per_case?.toString() || '',
        exw_rebate_price_per_unit: p.exw_rebate_price_per_unit?.toString() || '',
        exw_rebate_price_per_lb: p.exw_rebate_price_per_lb?.toString() || '',
        fob_price_per_case: p.fob_price_per_case?.toString() || '',
        fob_price_per_unit: p.fob_price_per_unit?.toString() || '',
        fob_price_per_lb: p.fob_price_per_lb?.toString() || '',
        fob_rebate_amount: p.fob_rebate_amount?.toString() || '',
        fob_rebate_price_per_case: p.fob_rebate_price_per_case?.toString() || '',
        fob_rebate_price_per_unit: p.fob_rebate_price_per_unit?.toString() || '',
        fob_rebate_price_per_lb: p.fob_rebate_price_per_lb?.toString() || '',
        dap_cases_per_container: p.dap_cases_per_container?.toString() || '',
        dap_vessel_freight_per_case: p.dap_vessel_freight_per_case?.toString() || '',
        dap_price_per_case: p.dap_price_per_case?.toString() || '',
        dap_price_per_unit: p.dap_price_per_unit?.toString() || '',
        dap_price_per_lb: p.dap_price_per_lb?.toString() || '',
        ddp_inland_freight_per_case: p.ddp_inland_freight_per_case?.toString() || '',
        ddp_price_per_case: p.ddp_price_per_case?.toString() || '',
        ddp_price_per_unit: p.ddp_price_per_unit?.toString() || '',
        ddp_price_per_lb: p.ddp_price_per_lb?.toString() || '',
        pricing_notes: p.pricing_notes || ''
      })
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const pricingData = {
        effective_date: formData.effective_date,

        // EXW pricing
        exw_price_per_case: formData.exw_price_per_case ? parseFloat(formData.exw_price_per_case) : null,
        exw_price_per_unit: formData.exw_price_per_unit ? parseFloat(formData.exw_price_per_unit) : null,
        exw_price_per_lb: formData.exw_price_per_lb ? parseFloat(formData.exw_price_per_lb) : null,
        exw_previous_price_per_case: formData.exw_previous_price_per_case ? parseFloat(formData.exw_previous_price_per_case) : null,

        // EXW with Rebate
        exw_rebate_amount: formData.exw_rebate_amount ? parseFloat(formData.exw_rebate_amount) : null,
        exw_rebate_price_per_case: formData.exw_rebate_price_per_case ? parseFloat(formData.exw_rebate_price_per_case) : null,
        exw_rebate_price_per_unit: formData.exw_rebate_price_per_unit ? parseFloat(formData.exw_rebate_price_per_unit) : null,
        exw_rebate_price_per_lb: formData.exw_rebate_price_per_lb ? parseFloat(formData.exw_rebate_price_per_lb) : null,

        // FOB pricing
        fob_price_per_case: formData.fob_price_per_case ? parseFloat(formData.fob_price_per_case) : null,
        fob_price_per_unit: formData.fob_price_per_unit ? parseFloat(formData.fob_price_per_unit) : null,
        fob_price_per_lb: formData.fob_price_per_lb ? parseFloat(formData.fob_price_per_lb) : null,

        // FOB with Rebate
        fob_rebate_amount: formData.fob_rebate_amount ? parseFloat(formData.fob_rebate_amount) : null,
        fob_rebate_price_per_case: formData.fob_rebate_price_per_case ? parseFloat(formData.fob_rebate_price_per_case) : null,
        fob_rebate_price_per_unit: formData.fob_rebate_price_per_unit ? parseFloat(formData.fob_rebate_price_per_unit) : null,
        fob_rebate_price_per_lb: formData.fob_rebate_price_per_lb ? parseFloat(formData.fob_rebate_price_per_lb) : null,

        // DAP pricing
        dap_cases_per_container: formData.dap_cases_per_container ? parseInt(formData.dap_cases_per_container) : null,
        dap_vessel_freight_per_case: formData.dap_vessel_freight_per_case ? parseFloat(formData.dap_vessel_freight_per_case) : null,
        dap_price_per_case: formData.dap_price_per_case ? parseFloat(formData.dap_price_per_case) : null,
        dap_price_per_unit: formData.dap_price_per_unit ? parseFloat(formData.dap_price_per_unit) : null,
        dap_price_per_lb: formData.dap_price_per_lb ? parseFloat(formData.dap_price_per_lb) : null,

        // DDP pricing
        ddp_inland_freight_per_case: formData.ddp_inland_freight_per_case ? parseFloat(formData.ddp_inland_freight_per_case) : null,
        ddp_price_per_case: formData.ddp_price_per_case ? parseFloat(formData.ddp_price_per_case) : null,
        ddp_price_per_unit: formData.ddp_price_per_unit ? parseFloat(formData.ddp_price_per_unit) : null,
        ddp_price_per_lb: formData.ddp_price_per_lb ? parseFloat(formData.ddp_price_per_lb) : null,

        pricing_notes: formData.pricing_notes || null
      }

      const { error } = await supabase
        .from('product_customer_pricing')
        .update(pricingData)
        .eq('id', pricingId)

      if (error) throw error

      router.push(`/products/${productId}/customer-pricing/${pricingId}`)
    } catch (error: any) {
      console.error('Error updating customer pricing:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href={`/products/${productId}`}>
            <Button variant="primary">Back to Product</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/products/${productId}/customer-pricing/${pricingId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Customer Pricing</h1>
              <p className="text-sm text-gray-600">
                {pricing?.customer?.customer_name} • {product?.item_number} - {product?.item_description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <div className="text-gray-900 font-medium">{pricing?.customer?.customer_name}</div>
              </div>
              <Input
                label="Effective Date"
                name="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* EXW Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">EXW Pricing (Pick-up at Plant)</h2>
            <p className="text-sm text-gray-600 mb-6">Customer picks up product at the plant</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price per Case ($)"
                name="exw_price_per_case"
                type="number"
                step="0.01"
                value={formData.exw_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Unit ($)"
                name="exw_price_per_unit"
                type="number"
                step="0.01"
                value={formData.exw_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Lb ($)"
                name="exw_price_per_lb"
                type="number"
                step="0.01"
                value={formData.exw_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Previous Price per Case ($)"
                name="exw_previous_price_per_case"
                type="number"
                step="0.01"
                value={formData.exw_previous_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* EXW with Rebate */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">EXW with Rebate</h2>
            <p className="text-sm text-gray-600 mb-6">Price after applying rebate/discount</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Rebate Amount per Case ($)"
                name="exw_rebate_amount"
                type="number"
                step="0.01"
                value={formData.exw_rebate_amount}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Case ($)"
                name="exw_rebate_price_per_case"
                type="number"
                step="0.01"
                value={formData.exw_rebate_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Unit ($)"
                name="exw_rebate_price_per_unit"
                type="number"
                step="0.01"
                value={formData.exw_rebate_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Lb ($)"
                name="exw_rebate_price_per_lb"
                type="number"
                step="0.01"
                value={formData.exw_rebate_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* FOB Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">FOB Pricing (Free on Board)</h2>
            <p className="text-sm text-gray-600 mb-6">Price includes delivery to port of origin</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price per Case ($)"
                name="fob_price_per_case"
                type="number"
                step="0.01"
                value={formData.fob_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Unit ($)"
                name="fob_price_per_unit"
                type="number"
                step="0.01"
                value={formData.fob_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Lb ($)"
                name="fob_price_per_lb"
                type="number"
                step="0.01"
                value={formData.fob_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* FOB with Rebate */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">FOB with Rebate</h2>
            <p className="text-sm text-gray-600 mb-6">FOB price after applying rebate/discount</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Rebate Amount per Case ($)"
                name="fob_rebate_amount"
                type="number"
                step="0.01"
                value={formData.fob_rebate_amount}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Case ($)"
                name="fob_rebate_price_per_case"
                type="number"
                step="0.01"
                value={formData.fob_rebate_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Unit ($)"
                name="fob_rebate_price_per_unit"
                type="number"
                step="0.01"
                value={formData.fob_rebate_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Final Price per Lb ($)"
                name="fob_rebate_price_per_lb"
                type="number"
                step="0.01"
                value={formData.fob_rebate_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* DAP Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">DAP Pricing (Delivered at Place - Port USA)</h2>
            <p className="text-sm text-gray-600 mb-6">Price includes ocean freight to US port</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Cases per Container"
                name="dap_cases_per_container"
                type="number"
                value={formData.dap_cases_per_container}
                onChange={handleChange}
                placeholder="0"
              />
              <Input
                label="Vessel Freight per Case ($)"
                name="dap_vessel_freight_per_case"
                type="number"
                step="0.01"
                value={formData.dap_vessel_freight_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Case ($)"
                name="dap_price_per_case"
                type="number"
                step="0.01"
                value={formData.dap_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Unit ($)"
                name="dap_price_per_unit"
                type="number"
                step="0.01"
                value={formData.dap_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Lb ($)"
                name="dap_price_per_lb"
                type="number"
                step="0.01"
                value={formData.dap_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* DDP Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">DDP Pricing (Delivered Duty Paid - Client Crossdock)</h2>
            <p className="text-sm text-gray-600 mb-6">Price includes all costs to customer's warehouse</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Inland Freight per Case ($)"
                name="ddp_inland_freight_per_case"
                type="number"
                step="0.01"
                value={formData.ddp_inland_freight_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Case ($)"
                name="ddp_price_per_case"
                type="number"
                step="0.01"
                value={formData.ddp_price_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Unit ($)"
                name="ddp_price_per_unit"
                type="number"
                step="0.01"
                value={formData.ddp_price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Price per Lb ($)"
                name="ddp_price_per_lb"
                type="number"
                step="0.01"
                value={formData.ddp_price_per_lb}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="pricing_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Notes
                </label>
                <textarea
                  id="pricing_notes"
                  name="pricing_notes"
                  rows={3}
                  value={formData.pricing_notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes about this pricing..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href={`/products/${productId}/customer-pricing/${pricingId}`}>
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" type="submit" disabled={saving}>
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
