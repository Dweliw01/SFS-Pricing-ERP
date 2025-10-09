'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Building2, Users, DollarSign } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Products', icon: Package },
    { href: '/vendors', label: 'Vendors', icon: Building2 },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/import-costs', label: 'Import Costs', icon: DollarSign }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
