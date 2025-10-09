'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddVendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vendor_name: '',
    vendor_code: '',
    country_origin: '',
    facility_name: '',
    facility_address: '',
    payment_terms: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([{ ...formData, is_active: true }])
        .select()
        .single()

      if (error) throw error

      router.push(`/vendors/${data.id}`)
    } catch (error: any) {
      console.error('Error creating vendor:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/vendors">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vendor</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vendor Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Vendor Name"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Vendor Code"
                name="vendor_code"
                value={formData.vendor_code}
                onChange={handleChange}
              />
              <Input
                label="Country of Origin"
                name="country_origin"
                value={formData.country_origin}
                onChange={handleChange}
              />
              <Input
                label="Facility Name"
                name="facility_name"
                value={formData.facility_name}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Address
                </label>
                <textarea
                  name="facility_address"
                  value={formData.facility_address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Input
                label="Payment Terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                placeholder="e.g. Net 30, Net 60"
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/vendors">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Vendor'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
