'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_code: '',
    region: '',
    warehouse_zip_code: '',
    payment_terms: '',
    sales_broker_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    annual_volume_cases: '',
    monthly_volume_cases: ''
  })

  useEffect(() => {
    fetchCustomer()
  }, [params.id])

  async function fetchCustomer() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setCustomer(data)
      setFormData({
        customer_name: data.customer_name || '',
        customer_code: data.customer_code || '',
        region: data.region || '',
        warehouse_zip_code: data.warehouse_zip_code || '',
        payment_terms: data.payment_terms || '',
        sales_broker_name: data.sales_broker_name || '',
        contact_person: data.contact_person || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        annual_volume_cases: data.annual_volume_cases?.toString() || '',
        monthly_volume_cases: data.monthly_volume_cases?.toString() || ''
      })
    } catch (error: any) {
      console.error('Error fetching customer:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const customerData = {
        ...formData,
        annual_volume_cases: formData.annual_volume_cases ? parseInt(formData.annual_volume_cases) : null,
        monthly_volume_cases: formData.monthly_volume_cases ? parseInt(formData.monthly_volume_cases) : null
      }

      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', params.id)

      if (error) throw error

      router.push(`/customers/${params.id}`)
    } catch (error: any) {
      console.error('Error updating customer:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading customer...</div>
      </div>
    )
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/customers">
            <Button variant="primary">Back to Customers</Button>
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
            <Link href={`/customers/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Customer Name" name="customer_name" value={formData.customer_name} onChange={handleChange} required />
              <Input label="Customer Code" name="customer_code" value={formData.customer_code} onChange={handleChange} />
              <Select
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select region...' },
                  { value: 'NE', label: 'Northeast' },
                  { value: 'SE', label: 'Southeast' },
                  { value: 'MW', label: 'Midwest' },
                  { value: 'W', label: 'West' },
                  { value: 'SW', label: 'Southwest' }
                ]}
              />
              <Input label="Warehouse Zip Code" name="warehouse_zip_code" value={formData.warehouse_zip_code} onChange={handleChange} />
              <Input label="Payment Terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} placeholder="e.g. Net 30, Net 60, COD" />
              <Input label="Sales Broker" name="sales_broker_name" value={formData.sales_broker_name} onChange={handleChange} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} />
              <Input label="Contact Email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
              <Input label="Contact Phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Volume Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Annual Volume (cases)" name="annual_volume_cases" type="number" value={formData.annual_volume_cases} onChange={handleChange} />
              <Input label="Monthly Volume (cases)" name="monthly_volume_cases" type="number" value={formData.monthly_volume_cases} onChange={handleChange} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href={`/customers/${params.id}`}>
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
