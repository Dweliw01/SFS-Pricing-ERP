'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/lib/types'

export default function AddImportCostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const [formData, setFormData] = useState({
    product_id: '',
    effective_date: new Date().toISOString().split('T')[0],

    // Import broker fees
    import_broker_fee_percent: '',
    import_broker_fee_per_case: '',

    // Duty rates
    duty_rate_percent: '',
    duty_per_case: '',

    // Previous tariff
    previous_tariff_percent: '',

    // GSP
    gsp_margin_percent: '',
    gsp_profit_per_case: '',

    notes: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, item_number, item_description, product_type')
        .eq('is_active', true)
        .order('item_number')

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      console.error('Error fetching products:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.product_id) {
        throw new Error('Please select a product')
      }

      const importCostData = {
        product_id: formData.product_id,
        effective_date: formData.effective_date,

        import_broker_fee_percent: formData.import_broker_fee_percent ? parseFloat(formData.import_broker_fee_percent) : null,
        import_broker_fee_per_case: formData.import_broker_fee_per_case ? parseFloat(formData.import_broker_fee_per_case) : null,

        duty_rate_percent: formData.duty_rate_percent ? parseFloat(formData.duty_rate_percent) : null,
        duty_per_case: formData.duty_per_case ? parseFloat(formData.duty_per_case) : null,

        previous_tariff_percent: formData.previous_tariff_percent ? parseFloat(formData.previous_tariff_percent) : null,

        gsp_margin_percent: formData.gsp_margin_percent ? parseFloat(formData.gsp_margin_percent) : null,
        gsp_profit_per_case: formData.gsp_profit_per_case ? parseFloat(formData.gsp_profit_per_case) : null,

        is_current: true,
        notes: formData.notes || null
      }

      const { error } = await supabase
        .from('import_costs')
        .insert([importCostData])

      if (error) throw error

      router.push('/import-costs')
    } catch (error: any) {
      console.error('Error adding import cost:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/import-costs">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add Import Cost Configuration</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Product"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'Select a product...' },
                  ...products.map(p => ({
                    value: p.id,
                    label: `${p.item_number} - ${p.item_description || 'No description'}`
                  }))
                ]}
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

          {/* Import Broker Fees */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Import Broker Fees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Broker Fee Percent (%)"
                name="import_broker_fee_percent"
                type="number"
                step="0.01"
                value={formData.import_broker_fee_percent}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Broker Fee Per Case ($)"
                name="import_broker_fee_per_case"
                type="number"
                step="0.01"
                value={formData.import_broker_fee_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Duty Rates */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Duty Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Duty Rate Percent (%)"
                name="duty_rate_percent"
                type="number"
                step="0.01"
                value={formData.duty_rate_percent}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Duty Per Case ($)"
                name="duty_per_case"
                type="number"
                step="0.01"
                value={formData.duty_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Previous Tariff */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Previous Tariff (for comparison)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Previous Tariff Percent (%)"
                name="previous_tariff_percent"
                type="number"
                step="0.01"
                value={formData.previous_tariff_percent}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* GSP Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              GSP (Generalized System of Preferences)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="GSP Margin Percent (%)"
                name="gsp_margin_percent"
                type="number"
                step="0.01"
                value={formData.gsp_margin_percent}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="GSP Profit Per Case ($)"
                name="gsp_profit_per_case"
                type="number"
                step="0.01"
                value={formData.gsp_profit_per_case}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notes</h2>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about this import cost configuration..."
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/import-costs">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
