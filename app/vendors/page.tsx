'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Vendor } from '@/lib/types'
import { Building2, Plus, Search, Edit, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/Navigation'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('vendor_name', { ascending: true })

      if (error) throw error

      setVendors(data || [])
    } catch (error: any) {
      console.error('Error fetching vendors:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchTerm.toLowerCase()
    return (
      vendor.vendor_name?.toLowerCase().includes(searchLower) ||
      vendor.vendor_code?.toLowerCase().includes(searchLower) ||
      vendor.country_origin?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                <p className="text-sm text-gray-600">Manage supplier information and costs</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="secondary">Back to Products</Button>
              </Link>
              <Link href="/vendors/add">
                <Button variant="primary">
                  <Plus size={20} className="mr-2" />
                  Add Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by vendor name, code, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Vendors</div>
            <div className="text-3xl font-bold text-gray-900">{vendors.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">International</div>
            <div className="text-3xl font-bold text-blue-600">
              {vendors.filter(v => v.country_origin && v.country_origin !== 'USA').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Domestic</div>
            <div className="text-3xl font-bold text-green-600">
              {vendors.filter(v => v.country_origin === 'USA').length}
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Vendors</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading vendors...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchVendors} variant="primary">
                Retry
              </Button>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-6">
                {vendors.length === 0
                  ? "Get started by adding your first vendor."
                  : "No vendors match your search criteria."}
              </p>
              {vendors.length === 0 && (
                <Link href="/vendors/add">
                  <Button variant="primary">
                    <Plus size={20} className="mr-2" />
                    Add First Vendor
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.vendor_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vendor.vendor_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.country_origin || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vendor.facility_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vendor.contact_person || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vendors/${vendor.id}`}>
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye size={18} />
                            </button>
                          </Link>
                          <Link href={`/vendors/${vendor.id}/edit`}>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit size={18} />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
