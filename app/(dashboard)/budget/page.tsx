'use client'

import { useEffect, useState } from 'react'
import { Plus, Target, Trash2, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

interface Budget {
  id: string
  amount: number
  month: number
  year: number
  category: Category
}

interface Transaction {
  id: string
  amount: number
  type: string
  categoryId: string
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function BudgetPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '' })
  const [notifications, setNotifications] = useState<{ message: string; type: 'warning' | 'danger' }[]>([])
  const [showNotif, setShowNotif] = useState(true)

  const fetchData = () => {
    fetch(`/api/budgets?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(setBudgets)

    fetch(`/api/transactions?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(setTransactions)
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.filter((c: Category) => c.type === 'expense')))
  }, [])

  useEffect(() => {
    fetchData()
    setShowNotif(true)
  }, [month, year])

  const getSpent = (categoryId: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Generate notifikasi setiap kali budgets/transactions berubah
  useEffect(() => {
    if (budgets.length === 0) return

    const msgs: { message: string; type: 'warning' | 'danger' }[] = []

    budgets.forEach(budget => {
      const spent = getSpent(budget.category.id)
      const percentage = (spent / budget.amount) * 100

      if (percentage >= 100) {
        msgs.push({
          message: `🚨 Budget ${budget.category.icon} ${budget.category.name} sudah melebihi batas! (${Math.round(percentage)}% terpakai)`,
          type: 'danger'
        })
      } else if (percentage >= 80) {
        msgs.push({
          message: `⚠️ Budget ${budget.category.icon} ${budget.category.name} hampir habis! (${Math.round(percentage)}% terpakai)`,
          type: 'warning'
        })
      }
    })

    setNotifications(msgs)
  }, [budgets, transactions])

  const handleSubmit = async () => {
    if (!form.categoryId || !form.amount) {
      alert('Harap isi semua field!')
      return
    }

    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, month, year }),
    })

    setForm({ categoryId: '', amount: '' })
    setShowModal(false)
    fetchData()
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Hapus budget ini?')) return
    await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + getSpent(b.category.id), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-500">Atur anggaran pengeluaranmu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Budget
        </button>
      </div>

      {/* Notifikasi */}
      {showNotif && notifications.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Peringatan Budget</p>
            <button
              onClick={() => setShowNotif(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {notifications.map((notif, i) => (
            <div
              key={i}
              className={`px-4 py-3 rounded-xl text-sm font-medium border ${
                notif.type === 'danger'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              {notif.message}
            </div>
          ))}
        </div>
      )}

      {/* Filter Bulan */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-4">
        <select
          value={month}
          onChange={e => setMonth(parseInt(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-6">
          <div className="text-sm">
            <span className="text-gray-500">Total Budget: </span>
            <span className="font-semibold text-blue-600">{formatRupiah(totalBudget)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Terpakai: </span>
            <span className="font-semibold text-red-600">{formatRupiah(totalSpent)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Sisa: </span>
            <span className="font-semibold text-green-600">{formatRupiah(totalBudget - totalSpent)}</span>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada budget</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Budget" untuk mulai mengatur anggaran</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map(budget => {
            const spent = getSpent(budget.category.id)
            const percentage = Math.min((spent / budget.amount) * 100, 100)
            const isOver = spent > budget.amount
            const isNear = !isOver && (spent / budget.amount) * 100 >= 80
            const remaining = budget.amount - spent

            return (
              <div
                key={budget.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm ${
                  isOver ? 'border-red-200' : isNear ? 'border-orange-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                      {budget.category.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{budget.category.name}</p>
                      <p className="text-xs text-gray-400">Budget: {formatRupiah(budget.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                        Melebihi!
                      </span>
                    )}
                    {isNear && (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">
                        Hampir habis
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Terpakai: {formatRupiah(spent)}</span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isOver ? 'bg-red-500' :
                        isNear ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <p className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining >= 0 ? `Sisa ${formatRupiah(remaining)}` : `Lebih ${formatRupiah(Math.abs(remaining))}`}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Tambah Budget */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Budget</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Budget (Rp) untuk {MONTHS[month - 1]} {year}
              </label>
              <input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}