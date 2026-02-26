'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

const ICON_OPTIONS = [
  '📦', '🍜', '🚗', '🛍️', '🎮', '💊', '📱', '📚', '💼', '💻',
  '📈', '🎁', '🏠', '✈️', '⚽', '🎵', '🐶', '☕', '🍕', '💇',
  '🏋️', '📷', '🎨', '🧴', '🛒', '🔧', '💡', '🎓', '👶', '❤️',
]

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#6b7280',
  '#16a34a', '#0891b2', '#7c3aed', '#db2777', '#b45309',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: '📦',
    color: '#6b7280',
  })

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const openAddModal = () => {
    setEditingCategory(null)
    setForm({ name: '', type: 'expense', icon: '📦', color: '#6b7280' })
    setShowModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Nama kategori tidak boleh kosong!')
      return
    }

    if (editingCategory) {
      await fetch(`/api/categories?id=${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setShowModal(false)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return

    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    fetchCategories()
  }

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: category.color + '20' }}
        >
          {category.icon}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{category.name}</p>
          <p className="text-xs text-gray-400">{category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openEditModal(category)}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(category.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-500">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Kategori</p>
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pemasukan</p>
          <p className="text-2xl font-bold text-green-600">{incomeCategories.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">{expenseCategories.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pemasukan */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            Kategori Pemasukan
          </h2>
          <div className="space-y-2">
            {incomeCategories.map(c => (
              <CategoryCard key={c.id} category={c} />
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada kategori pemasukan</p>
            )}
          </div>
        </div>

        {/* Pengeluaran */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            Kategori Pengeluaran
          </h2>
          <div className="space-y-2">
            {expenseCategories.map(c => (
              <CategoryCard key={c.id} category={c} />
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada kategori pengeluaran</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tipe */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, type: 'expense' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setForm({ ...form, type: 'income' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            {/* Nama */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Bensin"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Icon */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-10 gap-1">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${
                      form.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Warna */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className="w-8 h-8 rounded-lg border-4 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#1d4ed8' : 'transparent',
                      transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>

              {/* Preview */}
              <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: form.color + '20' }}
                >
                  {form.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{form.name || 'Nama kategori'}</p>
                  <p className="text-xs text-gray-400">{form.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                {editingCategory ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}