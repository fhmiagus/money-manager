'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, Calendar } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  icon: string
}

interface RecurringTransaction {
  id: string
  amount: number
  type: string
  description: string
  dayOfMonth: number
  isActive: boolean
  category: Category
}

const formatRupiah = (amount: number) => {
  return 'Rp' + amount.toLocaleString('id-ID')
}

export default function RecurringPage() {
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    dayOfMonth: '1',
  })

  const fetchRecurring = () => {
    fetch('/api/recurring')
      .then(res => res.json())
      .then(setRecurringList)
  }

  useEffect(() => {
    fetchRecurring()
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
  }, [])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const handleSubmit = async () => {
    if (!form.amount || !form.categoryId || !form.dayOfMonth) {
      alert('Harap isi semua field!')
      return
    }

    await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setForm({ type: 'expense', amount: '', categoryId: '', description: '', dayOfMonth: '1' })
    setShowModal(false)
    fetchRecurring()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi rutin ini?')) return
    await fetch(`/api/recurring?id=${id}`, { method: 'DELETE' })
    fetchRecurring()
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/recurring?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchRecurring()
  }

  const handleApply = async () => {
    const res = await fetch('/api/recurring/apply', { method: 'POST' })
    const data = await res.json()
    setApplyMessage(data.message)
    setTimeout(() => setApplyMessage(''), 4000)
    fetchRecurring()
  }

  const activeCount = recurringList.filter(r => r.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Rutin</h1>
          <p className="text-gray-500">Kelola transaksi yang berulang setiap bulan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Jalankan Sekarang
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Rutin
          </button>
        </div>
      </div>

      {/* Apply Message */}
      {applyMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✅ {applyMessage}
        </div>
      )}

      {/* Info Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Rutin</p>
          <p className="text-2xl font-bold text-gray-900">{recurringList.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Aktif</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Non-aktif</p>
          <p className="text-2xl font-bold text-gray-400">{recurringList.length - activeCount}</p>
        </div>
      </div>

      {/* Info cara kerja */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        💡 Transaksi rutin akan otomatis dibuat pada tanggal yang ditentukan. Klik <strong>"Jalankan Sekarang"</strong> untuk membuat transaksi hari ini secara manual.
      </div>

      {/* List */}
      {recurringList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada transaksi rutin</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Rutin" untuk mulai</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recurringList.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                        {r.category.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.description || r.category.name}</p>
                        <p className="text-xs text-gray-400">{r.category.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      r.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {r.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Setiap tanggal <span className="font-semibold">{r.dayOfMonth}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {r.type === 'income' ? '+' : '-'}{formatRupiah(r.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleToggle(r.id, r.isActive)}>
                      {r.isActive
                        ? <ToggleRight className="w-6 h-6 text-green-500 mx-auto" />
                        : <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Transaksi Rutin</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, type: 'expense', categoryId: '' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >Pengeluaran</button>
                <button
                  onClick={() => setForm({ ...form, type: 'income', categoryId: '' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >Pemasukan</button>
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
                placeholder="Contoh: Gaji bulanan"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal setiap bulan (1-28)
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={form.dayOfMonth}
                onChange={e => setForm({ ...form, dayOfMonth: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Maksimal tanggal 28 untuk menghindari masalah di bulan Februari</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >Batal</button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}