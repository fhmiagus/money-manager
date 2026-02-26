'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, Download, Pencil } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  date: string
  categoryId: string
  category: Category
}

const formatRupiah = (amount: number) => {
  return 'Rp' + amount.toLocaleString('id-ID')
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function TransactionsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const fetchTransactions = () => {
    setLoading(true)
    fetch(`/api/transactions?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [month, year])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const displayedTransactions = transactions.filter(t => {
    const matchSearch = search === '' ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === '' || t.categoryId === filterCategory
    const matchType = filterType === '' || t.type === filterType
    return matchSearch && matchCategory && matchType
  })

  const openAddModal = () => {
    setEditingTransaction(null)
    setForm({
      type: 'expense',
      amount: '',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowModal(true)
  }

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t)
    setForm({
      type: t.type,
      amount: t.amount.toString(),
      categoryId: t.categoryId,
      description: t.description || '',
      date: new Date(t.date).toISOString().split('T')[0],
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.categoryId || !form.date) {
      alert('Harap isi semua field!')
      return
    }

    if (editingTransaction) {
      // Edit
      await fetch(`/api/transactions?id=${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      // Tambah baru
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setShowModal(false)
    fetchTransactions()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
    fetchTransactions()
  }

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Kategori', 'Deskripsi', 'Tipe', 'Jumlah']
    const rows = displayedTransactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.category.name,
      t.description || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transaksi-${MONTHS[month - 1]}-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-500">Catat pemasukan dan pengeluaranmu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
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

          <div className="ml-auto flex gap-6 text-sm">
            <span className="text-gray-500">Pemasukan: <span className="font-semibold text-green-600">{formatRupiah(totalIncome)}</span></span>
            <span className="text-gray-500">Pengeluaran: <span className="font-semibold text-red-600">{formatRupiah(totalExpense)}</span></span>
            <span className="text-gray-500">Saldo: <span className="font-semibold text-blue-600">{formatRupiah(totalIncome - totalExpense)}</span></span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List Transaksi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : displayedTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">Tidak ada transaksi</p>
            <p className="text-sm">Coba ubah filter atau tambah transaksi baru</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.category.icon}</span>
                      <span className="text-sm text-gray-700">{t.category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tambah/Edit Transaksi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, type: 'expense', categoryId: '' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setForm({ ...form, type: 'income', categoryId: '' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih kategori</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Makan siang di kantor"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
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
                {editingTransaction ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}