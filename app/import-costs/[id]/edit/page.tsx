'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { ImportCost, Product } from '@/lib/types'

export default function EditImportCostPage() {
  const params = useParams()
  const router = useRouter()
  const costId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importCost, setImportCost] = useState<ImportCost | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    effective_date: '',
    import_broker_fee_percent: '',
    import_broker_fee_per_case: '',
    duty_rate_percent: '',
    duty_per_case: '',
    previous_tariff_percent: '',
    gsp_margin_percent: '',
    gsp_profit_per_case: '',
    is_current: true,
    notes: ''
  })

  useEffect(() => {
    fetchImportCost()
  }, [costId])

  async function fetchImportCost() {
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

      // Populate form with existing data
      setFormData({
        effective_date: costData.effective_date,
        import_broker_fee_percent: costData.import_broker_fee_percent?.toString() || '',
        import_broker_fee_per_case: costData.import_broker_fee_per_case?.toString() || '',
        duty_rate_percent: costData.duty_rate_percent?.toString() || '',
        duty_per_case: costData.duty_per_case?.toString() || '',
        previous_tariff_percent: costData.previous_tariff_percent?.toString() || '',
        gsp_margin_percent: costData.gsp_margin_percent?.toString() || '',
        gsp_profit_per_case: costData.gsp_profit_per_case?.toString() || '',
        is_current: costData.is_current ?? true,
        notes: costData.notes || ''
      })
    } catch (error: any) {
      console.error('Error fetching import cost:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updateData = {
        effective_date: formData.effective_date,
        import_broker_fee_percent: formData.import_broker_fee_percent ? parseFloat(formData.import_broker_fee_percent) : null,
        import_broker_fee_per_case: formData.import_broker_fee_per_case ? parseFloat(formData.import_broker_fee_per_case) : null,
        duty_rate_percent: formData.duty_rate_percent ? parseFloat(formData.duty_rate_percent) : null,
        duty_per_case: formData.duty_per_case ? parseFloat(formData.duty_per_case) : null,
        previous_tariff_percent: formData.previous_tariff_percent ? parseFloat(formData.previous_tariff_percent) : null,
        gsp_margin_percent: formData.gsp_margin_percent ? parseFloat(formData.gsp_margin_percent) : null,
        gsp_profit_per_case: formData.gsp_profit_per_case ? parseFloat(formData.gsp_profit_per_case) : null,
        is_current: formData.is_current,
        notes: formData.notes || null
      }

      const { error } = await supabase
        .from('import_costs')
        .update(updateData)
        .eq('id', costId)

      if (error) throw error

      router.push(`/import-costs/${costId}`)
    } catch (error: any) {
      console.error('Error updating import cost:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading import cost...</div>
      </div>
    )
  }

  if (error && !importCost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/import-costs">
            <Button variant="primary">Back to Import Costs</Button>
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
            <Link href={`/import-costs/${costId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Import Cost Configuration</h1>
              {product && (
                <p className="text-sm text-gray-600">
                  {product.item_number} • {product.item_description || 'No description'}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {product?.item_number} - {product?.item_description || 'No description'}
                </div>
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
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={formData.is_current}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Mark as current/active</span>
              </label>
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
            <Link href={`/import-costs/${costId}`}>
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
