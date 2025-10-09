'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Customer, ProductCustomerPricing } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ArrowLeft, Edit, Trash2, Users, Mail, Phone, Package } from 'lucide-react'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (error: any) {
      console.error('Error fetching customer:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)

      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', params.id)

      if (error) throw error

      router.push('/customers')
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      setError(error.message)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading customer...</div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Customer not found'}</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{customer.customer_name}</h1>
                  <p className="text-sm text-gray-600">
                    {customer.customer_code || 'No code'} • {customer.region || 'No region'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/customers/${customer.id}/edit`}>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <dl className="space-y-4">
              <InfoField label="Customer Name" value={customer.customer_name} />
              <InfoField label="Customer Code" value={customer.customer_code} />
              <InfoField label="Region" value={customer.region} />
              <InfoField label="Warehouse Zip Code" value={customer.warehouse_zip_code} />
              <InfoField label="Payment Terms" value={customer.payment_terms} />
              <InfoField label="Sales Broker" value={customer.sales_broker_name} />
            </dl>
          </div>

          {/* Contact & Volume Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <Users size={16} />
                    Contact Person
                  </dt>
                  <dd className="text-sm text-gray-900">{customer.contact_person || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {customer.contact_email ? (
                      <a href={`mailto:${customer.contact_email}`} className="text-blue-600 hover:underline">
                        {customer.contact_email}
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
                    {customer.contact_phone ? (
                      <a href={`tel:${customer.contact_phone}`} className="text-blue-600 hover:underline">
                        {customer.contact_phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume Information</h2>
              <dl className="space-y-4">
                <InfoField label="Annual Volume (cases)" value={customer.annual_volume_cases?.toLocaleString()} />
                <InfoField label="Monthly Volume (cases)" value={customer.monthly_volume_cases?.toLocaleString()} />
              </dl>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Products for this Customer</h2>
          <CustomerProductsList customerId={customer.id} />
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.customer_name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}

function CustomerProductsList({ customerId }: { customerId: string }) {
  const [pricing, setPricing] = useState<ProductCustomerPricing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerProducts()
  }, [customerId])

  async function fetchCustomerProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_customer_pricing')
        .select(`
          *,
          product:products(*)
        `)
        .eq('customer_id', customerId)
        .eq('is_current', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPricing(data || [])
    } catch (error: any) {
      console.error('Error fetching customer products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading products...</div>
  }

  if (pricing.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No products priced for this customer yet.</p>
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
          {pricing.map((price) => (
            <tr key={price.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {(price as any).product?.item_number || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {(price as any).product?.item_description || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {price.exw_price_per_case ? `$${price.exw_price_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {price.fob_price_per_case ? `$${price.fob_price_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {price.ddp_price_per_case ? `$${price.ddp_price_per_case.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <Link href={`/products/${price.product_id}`} className="text-blue-600 hover:text-blue-900">
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
