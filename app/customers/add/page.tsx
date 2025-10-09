'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const customerData = {
        ...formData,
        annual_volume_cases: formData.annual_volume_cases ? parseInt(formData.annual_volume_cases) : null,
        monthly_volume_cases: formData.monthly_volume_cases ? parseInt(formData.monthly_volume_cases) : null,
        is_active: true
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error

      router.push(`/customers/${data.id}`)
    } catch (error: any) {
      console.error('Error creating customer:', error)
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
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Customer Name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Customer Code"
                name="customer_code"
                value={formData.customer_code}
                onChange={handleChange}
              />
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
              <Input
                label="Warehouse Zip Code"
                name="warehouse_zip_code"
                value={formData.warehouse_zip_code}
                onChange={handleChange}
              />
              <Input
                label="Payment Terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                placeholder="e.g. Net 30, Net 60, COD"
              />
              <Input
                label="Sales Broker"
                name="sales_broker_name"
                value={formData.sales_broker_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Contact Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
              />
              <Input
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
              />
              <Input
                label="Contact Phone" 
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Volume Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Annual Volume (cases)"
                name="annual_volume_cases"
                type="number"
                value={formData.annual_volume_cases}
                onChange={handleChange}
              />
              <Input
                label="Monthly Volume (cases)"
                name="monthly_volume_cases"
                type="number"
                value={formData.monthly_volume_cases}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/customers">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
