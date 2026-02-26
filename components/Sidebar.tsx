'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
  LayoutDashboard, ArrowLeftRight, Target, TrendingUp,
  BarChart2, RepeatIcon, StickyNote, PiggyBank, Tag,
  ChevronRight, LogOut, User
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-400' },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight, color: 'from-violet-500 to-purple-400' },
  { href: '/budget', label: 'Budget', icon: Target, color: 'from-orange-500 to-amber-400' },
  { href: '/reports', label: 'Laporan', icon: BarChart2, color: 'from-green-500 to-emerald-400' },
  { href: '/recurring', label: 'Transaksi Rutin', icon: RepeatIcon, color: 'from-pink-500 to-rose-400' },
  { href: '/notes', label: 'Catatan', icon: StickyNote, color: 'from-yellow-500 to-amber-400' },
  { href: '/goals', label: 'Target Tabungan', icon: PiggyBank, color: 'from-teal-500 to-cyan-400' },
  { href: '/categories', label: 'Kategori', icon: Tag, color: 'from-indigo-500 to-blue-400' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.image) setAvatarUrl(data.image)
        })
        .catch(() => {})
    }
  }, [session?.user?.id])

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 0 20px rgba(102,126,234,0.5)',
            }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Money Manager</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Kelola keuanganmu</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mounted && navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                }
              }}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-linear-to-br ${item.color}`}
                style={{
                  opacity: isActive ? 1 : 0.7,
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

        {/* User Card */}
        <Link
          href="/profile"
          className="rounded-xl p-3 flex items-center gap-3 mb-2 transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          {/* Avatar */}
          {mounted && avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {mounted ? initials : 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {mounted && session?.user?.name ? session.user.name : 'Loading...'}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {mounted && session?.user?.email ? session.user.email : ''}
            </p>
          </div>
          <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </Link>

        {/* Tombol Logout */}
        <button
          onClick={() => {
            if (confirm('Yakin ingin keluar?')) {
              signOut({ callbackUrl: '/login' })
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            e.currentTarget.style.color = 'rgba(239,68,68,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>

        <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 Money Manager</p>
      </div>
    </aside>
  )
}