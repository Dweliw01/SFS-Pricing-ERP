'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
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

      // Populate form data
      setFormData({
        item_number: data.item_number || '',
        brand: data.brand || '',
        item_description: data.item_description || '',
        product_type: data.product_type || 'I',
        status: data.status || 'N',
        category: data.category || '',
        pack_size: data.pack_size || '',
        units_per_case: data.units_per_case?.toString() || '',
        product_of_country: data.product_of_country || '',
        hs_code: data.hs_code || '',
        notes: data.notes || '',
        case_length_in: data.case_length_in?.toString() || '',
        case_width_in: data.case_width_in?.toString() || '',
        case_height_in: data.case_height_in?.toString() || '',
        case_weight_lbs: data.case_weight_lbs?.toString() || '',
        ti: data.ti?.toString() || '',
        hi: data.hi?.toString() || '',
        unit_length_in: data.unit_length_in?.toString() || '',
        unit_width_in: data.unit_width_in?.toString() || '',
        unit_height_in: data.unit_height_in?.toString() || '',
        unit_weight_oz: data.unit_weight_oz?.toString() || '',
        pallets_per_20ft: data.pallets_per_20ft?.toString() || '',
        cases_per_20ft: data.cases_per_20ft?.toString() || '',
        pallets_per_40ft: data.pallets_per_40ft?.toString() || '',
        cases_per_40ft: data.cases_per_40ft?.toString() || '',
        pallets_per_40hc: data.pallets_per_40hc?.toString() || '',
        cases_per_40hc: data.cases_per_40hc?.toString() || '',
        stackable: data.stackable ?? true,
        lead_time_days: data.lead_time_days?.toString() || '',
        moq: data.moq?.toString() || ''
      })
    } catch (error: any) {
      console.error('Error fetching product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
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
    setSaving(true)
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
        moq: formData.moq ? parseInt(formData.moq) : null
      }

      const { data: updatedData, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', params.id)
        .select()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(error.message || 'Failed to update product')
      }

      router.push(`/products/${params.id}`)
    } catch (error: any) {
      console.error('Error updating product:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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
              <Link href={`/products/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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
            <Link href={`/products/${params.id}`}>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
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
