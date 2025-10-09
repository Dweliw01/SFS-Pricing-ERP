'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Vendor, ProductVendorCost } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, Edit, Trash2, Building2, Mail, Phone, Package } from 'lucide-react'
import Link from 'next/link'

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVendor()
  }, [params.id])

  async function fetchVendor() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setVendor(data)
    } catch (error: any) {
      console.error('Error fetching vendor:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)

      const { error } = await supabase
        .from('vendors')
        .update({ is_active: false })
        .eq('id', params.id)

      if (error) throw error

      router.push('/vendors')
    } catch (error: any) {
      console.error('Error deleting vendor:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading vendor...</div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Vendor not found'}</p>
          <Link href="/vendors">
            <Button variant="primary">Back to Vendors</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vendors">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.vendor_name}</h1>
                  <p className="text-sm text-gray-600">
                    {vendor.vendor_code || 'No code'} • {vendor.country_origin || 'Unknown country'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/vendors/${vendor.id}/edit`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
            <dl className="space-y-4">
              <InfoField label="Vendor Name" value={vendor.vendor_name} />
              <InfoField label="Vendor Code" value={vendor.vendor_code} />
              <InfoField label="Country of Origin" value={vendor.country_origin} />
              <InfoField label="Facility Name" value={vendor.facility_name} />
              <InfoField label="Facility Address" value={vendor.facility_address} />
              <InfoField label="Payment Terms" value={vendor.payment_terms} />
            </dl>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Building2 size={16} />
                  Contact Person
                </dt>
                <dd className="text-sm text-gray-900">{vendor.contact_person || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </dt>
                <dd className="text-sm text-gray-900">
                  {vendor.contact_email ? (
                    <a href={`mailto:${vendor.contact_email}`} className="text-blue-600 hover:underline">
                      {vendor.contact_email}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </dt>
                <dd className="text-sm text-gray-900">
                  {vendor.contact_phone ? (
                    <a href={`tel:${vendor.contact_phone}`} className="text-blue-600 hover:underline">
                      {vendor.contact_phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Products from this Vendor</h2>
          <VendorProductsList vendorId={vendor.id} />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${vendor.vendor_name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

function VendorProductsList({ vendorId }: { vendorId: string }) {
  const [costs, setCosts] = useState<ProductVendorCost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorProducts()
  }, [vendorId])

  async function fetchVendorProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_vendor_costs')
        .select(`
          *,
          product:products(*)
        `)
        .eq('vendor_id', vendorId)
        .eq('is_current', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCosts(data || [])
    } catch (error: any) {
      console.error('Error fetching vendor products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading products...</div>
  }

  if (costs.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No products linked to this vendor yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">EXW</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">FOB</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">DDP</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {costs.map((cost) => (
            <tr key={cost.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {(cost as any).product?.item_number || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {(cost as any).product?.item_description || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {cost.exw_cost_per_case ? `$${cost.exw_cost_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {cost.fob_cost_per_case ? `$${cost.fob_cost_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {cost.ddp_cost_per_case ? `$${cost.ddp_cost_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <Link href={`/products/${cost.product_id}`} className="text-blue-600 hover:text-blue-900">
                  View Product
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: any }) {
  const displayValue = value !== null && value !== undefined && value !== '' ? value : '-'

  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{displayValue}</dd>
    </div>
  )
}
