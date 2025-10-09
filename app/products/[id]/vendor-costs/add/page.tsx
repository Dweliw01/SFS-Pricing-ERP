'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Vendor, Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddVendorCostPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params.id as string
  const preselectedVendorId = searchParams.get('vendor_id')

  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [product, setProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    vendor_id: '',
    effective_date: new Date().toISOString().split('T')[0],

    // EXW costs
    exw_cost_per_case: '',
    exw_cost_per_unit: '',
    exw_cost_per_lb: '',
    exw_previous_cost_per_case: '',
    exw_previous_cost_per_lb: '',

    // FOB costs
    fob_cost_per_case: '',
    fob_cost_per_unit: '',
    fob_cost_per_lb: '',
    fob_previous_cost_per_case: '',
    fob_previous_cost_per_lb: '',

    // Pickup at Plant
    pickup_plant_cost_per_case: '',
    pickup_plant_cost_per_unit: '',
    pickup_plant_cost_per_lb: '',
    pickup_plant_previous_cost_per_case: '',
    pickup_plant_previous_cost_per_lb: '',

    // Pickup at Port US
    pickup_port_us_cost_per_case: '',
    pickup_port_us_cost_per_unit: '',
    pickup_port_us_cost_per_lb: '',
    pickup_port_us_previous_cost_per_case: '',
    pickup_port_us_previous_cost_per_lb: '',

    // DDP costs
    ddp_cost_per_case: '',
    ddp_cost_per_unit: '',
    ddp_cost_per_lb: '',
    ddp_previous_cost_per_case: '',
    ddp_previous_cost_per_lb: '',

    // Factory fees
    factory_fee_percent: '',
    factory_fee_per_case: '',

    // Notes
    cost_notes: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [productId])

  async function fetchInitialData() {
    try {
      setFetchingData(true)

      const [vendorsRes, productRes] = await Promise.all([
        supabase.from('vendors').select('*').eq('is_active', true).order('vendor_name'),
        supabase.from('products').select('*').eq('id', productId).single()
      ])

      if (vendorsRes.error) throw vendorsRes.error
      if (productRes.error) throw productRes.error

      setVendors(vendorsRes.data || [])
      setProduct(productRes.data)

      // Pre-select vendor if provided in URL
      if (preselectedVendorId) {
        setFormData(prev => ({ ...prev, vendor_id: preselectedVendorId }))
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setFetchingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const costData = {
        product_id: productId,
        vendor_id: formData.vendor_id,
        effective_date: formData.effective_date,
        is_current: true,

        // Convert all numeric fields
        exw_cost_per_case: formData.exw_cost_per_case ? parseFloat(formData.exw_cost_per_case) : null,
        exw_cost_per_unit: formData.exw_cost_per_unit ? parseFloat(formData.exw_cost_per_unit) : null,
        exw_cost_per_lb: formData.exw_cost_per_lb ? parseFloat(formData.exw_cost_per_lb) : null,
        exw_previous_cost_per_case: formData.exw_previous_cost_per_case ? parseFloat(formData.exw_previous_cost_per_case) : null,
        exw_previous_cost_per_lb: formData.exw_previous_cost_per_lb ? parseFloat(formData.exw_previous_cost_per_lb) : null,

        fob_cost_per_case: formData.fob_cost_per_case ? parseFloat(formData.fob_cost_per_case) : null,
        fob_cost_per_unit: formData.fob_cost_per_unit ? parseFloat(formData.fob_cost_per_unit) : null,
        fob_cost_per_lb: formData.fob_cost_per_lb ? parseFloat(formData.fob_cost_per_lb) : null,
        fob_previous_cost_per_case: formData.fob_previous_cost_per_case ? parseFloat(formData.fob_previous_cost_per_case) : null,
        fob_previous_cost_per_lb: formData.fob_previous_cost_per_lb ? parseFloat(formData.fob_previous_cost_per_lb) : null,

        pickup_plant_cost_per_case: formData.pickup_plant_cost_per_case ? parseFloat(formData.pickup_plant_cost_per_case) : null,
        pickup_plant_cost_per_unit: formData.pickup_plant_cost_per_unit ? parseFloat(formData.pickup_plant_cost_per_unit) : null,
        pickup_plant_cost_per_lb: formData.pickup_plant_cost_per_lb ? parseFloat(formData.pickup_plant_cost_per_lb) : null,
        pickup_plant_previous_cost_per_case: formData.pickup_plant_previous_cost_per_case ? parseFloat(formData.pickup_plant_previous_cost_per_case) : null,
        pickup_plant_previous_cost_per_lb: formData.pickup_plant_previous_cost_per_lb ? parseFloat(formData.pickup_plant_previous_cost_per_lb) : null,

        pickup_port_us_cost_per_case: formData.pickup_port_us_cost_per_case ? parseFloat(formData.pickup_port_us_cost_per_case) : null,
        pickup_port_us_cost_per_unit: formData.pickup_port_us_cost_per_unit ? parseFloat(formData.pickup_port_us_cost_per_unit) : null,
        pickup_port_us_cost_per_lb: formData.pickup_port_us_cost_per_lb ? parseFloat(formData.pickup_port_us_cost_per_lb) : null,
        pickup_port_us_previous_cost_per_case: formData.pickup_port_us_previous_cost_per_case ? parseFloat(formData.pickup_port_us_previous_cost_per_case) : null,
        pickup_port_us_previous_cost_per_lb: formData.pickup_port_us_previous_cost_per_lb ? parseFloat(formData.pickup_port_us_previous_cost_per_lb) : null,

        ddp_cost_per_case: formData.ddp_cost_per_case ? parseFloat(formData.ddp_cost_per_case) : null,
        ddp_cost_per_unit: formData.ddp_cost_per_unit ? parseFloat(formData.ddp_cost_per_unit) : null,
        ddp_cost_per_lb: formData.ddp_cost_per_lb ? parseFloat(formData.ddp_cost_per_lb) : null,
        ddp_previous_cost_per_case: formData.ddp_previous_cost_per_case ? parseFloat(formData.ddp_previous_cost_per_case) : null,
        ddp_previous_cost_per_lb: formData.ddp_previous_cost_per_lb ? parseFloat(formData.ddp_previous_cost_per_lb) : null,

        factory_fee_percent: formData.factory_fee_percent ? parseFloat(formData.factory_fee_percent) / 100 : null,
        factory_fee_per_case: formData.factory_fee_per_case ? parseFloat(formData.factory_fee_per_case) : null,

        cost_notes: formData.cost_notes || null
      }

      const { error } = await supabase
        .from('product_vendor_costs')
        .insert([costData])

      if (error) throw error

      router.push(`/products/${productId}`)
    } catch (error: any) {
      console.error('Error creating vendor cost:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/products/${productId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Vendor Cost</h1>
              <p className="text-sm text-gray-600">
                {product?.item_number} - {product?.item_description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Vendor Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vendor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Vendor"
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select vendor...' },
                  ...vendors.map(v => ({ value: v.id, label: v.vendor_name }))
                ]}
                required
              />
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

          {/* EXW Costs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">EXW (Ex Works - At Plant)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Cost per Case" name="exw_cost_per_case" type="number" step="0.0001" value={formData.exw_cost_per_case} onChange={handleChange} />
              <Input label="Cost per Unit" name="exw_cost_per_unit" type="number" step="0.0001" value={formData.exw_cost_per_unit} onChange={handleChange} />
              <Input label="Cost per Lb" name="exw_cost_per_lb" type="number" step="0.0001" value={formData.exw_cost_per_lb} onChange={handleChange} />
              <Input label="Previous Cost per Case" name="exw_previous_cost_per_case" type="number" step="0.0001" value={formData.exw_previous_cost_per_case} onChange={handleChange} />
              <Input label="Previous Cost per Lb" name="exw_previous_cost_per_lb" type="number" step="0.0001" value={formData.exw_previous_cost_per_lb} onChange={handleChange} />
            </div>
          </div>

          {/* FOB Costs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">FOB (Free on Board - Port Origin)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Cost per Case" name="fob_cost_per_case" type="number" step="0.0001" value={formData.fob_cost_per_case} onChange={handleChange} />
              <Input label="Cost per Unit" name="fob_cost_per_unit" type="number" step="0.0001" value={formData.fob_cost_per_unit} onChange={handleChange} />
              <Input label="Cost per Lb" name="fob_cost_per_lb" type="number" step="0.0001" value={formData.fob_cost_per_lb} onChange={handleChange} />
              <Input label="Previous Cost per Case" name="fob_previous_cost_per_case" type="number" step="0.0001" value={formData.fob_previous_cost_per_case} onChange={handleChange} />
              <Input label="Previous Cost per Lb" name="fob_previous_cost_per_lb" type="number" step="0.0001" value={formData.fob_previous_cost_per_lb} onChange={handleChange} />
            </div>
          </div>

          {/* Pickup at Plant */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pickup at Plant</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Cost per Case" name="pickup_plant_cost_per_case" type="number" step="0.0001" value={formData.pickup_plant_cost_per_case} onChange={handleChange} />
              <Input label="Cost per Unit" name="pickup_plant_cost_per_unit" type="number" step="0.0001" value={formData.pickup_plant_cost_per_unit} onChange={handleChange} />
              <Input label="Cost per Lb" name="pickup_plant_cost_per_lb" type="number" step="0.0001" value={formData.pickup_plant_cost_per_lb} onChange={handleChange} />
              <Input label="Previous Cost per Case" name="pickup_plant_previous_cost_per_case" type="number" step="0.0001" value={formData.pickup_plant_previous_cost_per_case} onChange={handleChange} />
              <Input label="Previous Cost per Lb" name="pickup_plant_previous_cost_per_lb" type="number" step="0.0001" value={formData.pickup_plant_previous_cost_per_lb} onChange={handleChange} />
            </div>
          </div>

          {/* Pickup at Port US */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pickup at Port US</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Cost per Case" name="pickup_port_us_cost_per_case" type="number" step="0.0001" value={formData.pickup_port_us_cost_per_case} onChange={handleChange} />
              <Input label="Cost per Unit" name="pickup_port_us_cost_per_unit" type="number" step="0.0001" value={formData.pickup_port_us_cost_per_unit} onChange={handleChange} />
              <Input label="Cost per Lb" name="pickup_port_us_cost_per_lb" type="number" step="0.0001" value={formData.pickup_port_us_cost_per_lb} onChange={handleChange} />
              <Input label="Previous Cost per Case" name="pickup_port_us_previous_cost_per_case" type="number" step="0.0001" value={formData.pickup_port_us_previous_cost_per_case} onChange={handleChange} />
              <Input label="Previous Cost per Lb" name="pickup_port_us_previous_cost_per_lb" type="number" step="0.0001" value={formData.pickup_port_us_previous_cost_per_lb} onChange={handleChange} />
            </div>
          </div>

          {/* DDP Costs */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">DDP (Delivered Duty Paid)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Cost per Case" name="ddp_cost_per_case" type="number" step="0.0001" value={formData.ddp_cost_per_case} onChange={handleChange} />
              <Input label="Cost per Unit" name="ddp_cost_per_unit" type="number" step="0.0001" value={formData.ddp_cost_per_unit} onChange={handleChange} />
              <Input label="Cost per Lb" name="ddp_cost_per_lb" type="number" step="0.0001" value={formData.ddp_cost_per_lb} onChange={handleChange} />
              <Input label="Previous Cost per Case" name="ddp_previous_cost_per_case" type="number" step="0.0001" value={formData.ddp_previous_cost_per_case} onChange={handleChange} />
              <Input label="Previous Cost per Lb" name="ddp_previous_cost_per_lb" type="number" step="0.0001" value={formData.ddp_previous_cost_per_lb} onChange={handleChange} />
            </div>
          </div>

          {/* Factory Fees */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Factory Fees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Factory Fee Percentage (%)" name="factory_fee_percent" type="number" step="0.01" value={formData.factory_fee_percent} onChange={handleChange} />
              <Input label="Factory Fee per Case ($)" name="factory_fee_per_case" type="number" step="0.01" value={formData.factory_fee_per_case} onChange={handleChange} />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              name="cost_notes"
              value={formData.cost_notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add any additional notes about this cost entry..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href={`/products/${productId}`}>
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Vendor Cost'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
