'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Vendor } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // General Information
    item_number: '',
    brand: '',
    item_description: '',
    product_type: 'I',
    status: 'N',
    category: '',
    pack_size: '',
    units_per_case: '',
    product_of_country: '',
    hs_code: '',
    notes: '',
    vendor_id: '',  // Add vendor selection

    // Physical Specifications
    case_length_in: '',
    case_width_in: '',
    case_height_in: '',
    case_weight_lbs: '',
    ti: '',
    hi: '',
    unit_length_in: '',
    unit_width_in: '',
    unit_height_in: '',
    unit_weight_oz: '',

    // Container & Logistics
    pallets_per_20ft: '',
    cases_per_20ft: '',
    pallets_per_40ft: '',
    cases_per_40ft: '',
    pallets_per_40hc: '',
    cases_per_40hc: '',
    stackable: true,
    lead_time_days: '',
    moq: ''
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors() {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('vendor_name')

      if (error) throw error
      setVendors(data || [])
    } catch (error: any) {
      console.error('Error fetching vendors:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert numeric fields
      const productData = {
        ...formData,
        units_per_case: formData.units_per_case ? parseFloat(formData.units_per_case) : null,
        case_length_in: formData.case_length_in ? parseFloat(formData.case_length_in) : null,
        case_width_in: formData.case_width_in ? parseFloat(formData.case_width_in) : null,
        case_height_in: formData.case_height_in ? parseFloat(formData.case_height_in) : null,
        case_weight_lbs: formData.case_weight_lbs ? parseFloat(formData.case_weight_lbs) : null,
        ti: formData.ti ? parseInt(formData.ti) : null,
        hi: formData.hi ? parseInt(formData.hi) : null,
        unit_length_in: formData.unit_length_in ? parseFloat(formData.unit_length_in) : null,
        unit_width_in: formData.unit_width_in ? parseFloat(formData.unit_width_in) : null,
        unit_height_in: formData.unit_height_in ? parseFloat(formData.unit_height_in) : null,
        unit_weight_oz: formData.unit_weight_oz ? parseFloat(formData.unit_weight_oz) : null,
        pallets_per_20ft: formData.pallets_per_20ft ? parseInt(formData.pallets_per_20ft) : null,
        cases_per_20ft: formData.cases_per_20ft ? parseInt(formData.cases_per_20ft) : null,
        pallets_per_40ft: formData.pallets_per_40ft ? parseInt(formData.pallets_per_40ft) : null,
        cases_per_40ft: formData.cases_per_40ft ? parseInt(formData.cases_per_40ft) : null,
        pallets_per_40hc: formData.pallets_per_40hc ? parseInt(formData.pallets_per_40hc) : null,
        cases_per_40hc: formData.cases_per_40hc ? parseInt(formData.cases_per_40hc) : null,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null,
        moq: formData.moq ? parseInt(formData.moq) : null,
        is_active: true
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error

      // If vendor was selected, redirect to vendor costs form
      if (formData.vendor_id) {
        router.push(`/products/${data.id}/vendor-costs/add?vendor_id=${formData.vendor_id}`)
      } else {
        router.push(`/products/${data.id}`)
      }
    } catch (error: any) {
      console.error('Error creating product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'general',
      label: 'General Information',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Item Number"
            name="item_number"
            value={formData.item_number}
            onChange={handleChange}
            required
          />
          <Input
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="item_description"
              value={formData.item_description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            label="Product Type"
            name="product_type"
            value={formData.product_type}
            onChange={handleChange}
            options={[
              { value: 'I', label: 'International' },
              { value: 'D', label: 'Domestic' }
            ]}
            required
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'N', label: 'New' },
              { value: 'C', label: 'Current' },
              { value: 'T', label: 'Temporary' }
            ]}
            required
          />
          <Select
            label="Vendor (Supplier)"
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select vendor...' },
              ...vendors.map(v => ({ value: v.id, label: v.vendor_name }))
            ]}
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
          <Input
            label="Pack Size"
            name="pack_size"
            value={formData.pack_size}
            onChange={handleChange}
          />
          <Input
            label="Units per Case"
            name="units_per_case"
            type="number"
            step="0.01"
            value={formData.units_per_case}
            onChange={handleChange}
          />
          <Input
            label="Product of Country"
            name="product_of_country"
            value={formData.product_of_country}
            onChange={handleChange}
          />
          <Input
            label="HS Code"
            name="hs_code"
            value={formData.hs_code}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      id: 'physical',
      label: 'Physical Specifications',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Length (in)"
                name="case_length_in"
                type="number"
                step="0.01"
                value={formData.case_length_in}
                onChange={handleChange}
              />
              <Input
                label="Width (in)"
                name="case_width_in"
                type="number"
                step="0.01"
                value={formData.case_width_in}
                onChange={handleChange}
              />
              <Input
                label="Height (in)"
                name="case_height_in"
                type="number"
                step="0.01"
                value={formData.case_height_in}
                onChange={handleChange}
              />
              <Input
                label="Weight (lbs)"
                name="case_weight_lbs"
                type="number"
                step="0.01"
                value={formData.case_weight_lbs}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pallet Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="TI (cases per layer)"
                name="ti"
                type="number"
                value={formData.ti}
                onChange={handleChange}
              />
              <Input
                label="HI (layers high)"
                name="hi"
                type="number"
                value={formData.hi}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Unit Length (in)"
                name="unit_length_in"
                type="number"
                step="0.01"
                value={formData.unit_length_in}
                onChange={handleChange}
              />
              <Input
                label="Unit Width (in)"
                name="unit_width_in"
                type="number"
                step="0.01"
                value={formData.unit_width_in}
                onChange={handleChange}
              />
              <Input
                label="Unit Height (in)"
                name="unit_height_in"
                type="number"
                step="0.01"
                value={formData.unit_height_in}
                onChange={handleChange}
              />
              <Input
                label="Unit Weight (oz)"
                name="unit_weight_oz"
                type="number"
                step="0.01"
                value={formData.unit_weight_oz}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'container',
      label: 'Container & Logistics',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">20ft Container</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pallets per Container"
                name="pallets_per_20ft"
                type="number"
                value={formData.pallets_per_20ft}
                onChange={handleChange}
              />
              <Input
                label="Cases per Container"
                name="cases_per_20ft"
                type="number"
                value={formData.cases_per_20ft}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">40ft Container</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pallets per Container"
                name="pallets_per_40ft"
                type="number"
                value={formData.pallets_per_40ft}
                onChange={handleChange}
              />
              <Input
                label="Cases per Container"
                name="cases_per_40ft"
                type="number"
                value={formData.cases_per_40ft}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">40ft HC Container</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pallets per Container"
                name="pallets_per_40hc"
                type="number"
                value={formData.pallets_per_40hc}
                onChange={handleChange}
              />
              <Input
                label="Cases per Container"
                name="cases_per_40hc"
                type="number"
                value={formData.cases_per_40hc}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="stackable"
                    checked={formData.stackable}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Stackable</span>
                </label>
              </div>
              <Input
                label="Lead Time (days)"
                name="lead_time_days"
                type="number"
                value={formData.lead_time_days}
                onChange={handleChange}
              />
              <Input
                label="Minimum Order Quantity"
                name="moq"
                type="number"
                value={formData.moq}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <Tabs tabs={tabs} defaultTab="general" />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
