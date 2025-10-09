'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

interface Filters {
  status: string[]
  productType: string[]
  category: string[]
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: Filters
  onApplyFilters: (filters: Filters) => void
  categories: string[]
}

export function FilterModal({ isOpen, onClose, filters, onApplyFilters, categories }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  const toggleFilter = (type: keyof Filters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const handleClear = () => {
    const emptyFilters = { status: [], productType: [], category: [] }
    setLocalFilters(emptyFilters)
    onApplyFilters(emptyFilters)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Products" size="md">
      <div className="space-y-6">
        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            {[
              { value: 'C', label: 'Current' },
              { value: 'N', label: 'New' },
              { value: 'T', label: 'Temporary' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.status.includes(option.value)}
                  onChange={() => toggleFilter('status', option.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Product Type</h3>
          <div className="space-y-2">
            {[
              { value: 'I', label: 'International' },
              { value: 'D', label: 'Domestic' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.productType.includes(option.value)}
                  onChange={() => toggleFilter('productType', option.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.category.includes(category)}
                    onChange={() => toggleFilter('category', category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
