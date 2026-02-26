'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, Check, PiggyBank } from 'lucide-react'

interface SavingGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  icon: string
  color: string
  isCompleted: boolean
  createdAt: string
}

const formatRupiah = (amount: number) => {
  return 'Rp' + amount.toLocaleString('id-ID')
}

const GOAL_ICONS = ['🎯', '🏠', '✈️', '💻', '📱', '🚗', '💍', '🎓', '👶', '💰', '🏖️', '🛍️']
const GOAL_COLORS = [
  '#3b82f6', '#22c55e', '#ef4444', '#f97316',
  '#8b5cf6', '#06b6d4', '#eab308', '#ec4899'
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null)
  const [topupGoal, setTopupGoal] = useState<SavingGoal | null>(null)
  const [topupAmount, setTopupAmount] = useState('')
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    icon: '🎯',
    color: '#3b82f6',
  })

  const fetchGoals = () => {
    fetch('/api/goals')
      .then(res => res.json())
      .then(setGoals)
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const openAddModal = () => {
    setEditingGoal(null)
    setForm({ title: '', targetAmount: '', currentAmount: '0', deadline: '', icon: '🎯', color: '#3b82f6' })
    setShowModal(true)
  }

  const openEditModal = (goal: SavingGoal) => {
    setEditingGoal(goal)
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      icon: goal.icon,
      color: goal.color,
    })
    setShowModal(true)
  }

  const openTopupModal = (goal: SavingGoal) => {
    setTopupGoal(goal)
    setTopupAmount('')
    setShowTopupModal(true)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.targetAmount) {
      alert('Harap isi judul dan target!')
      return
    }

    if (editingGoal) {
      await fetch(`/api/goals?id=${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isCompleted: parseFloat(form.currentAmount) >= parseFloat(form.targetAmount)
        }),
      })
    } else {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setShowModal(false)
    fetchGoals()
  }

  const handleTopup = async () => {
    if (!topupGoal || !topupAmount) return
    const newAmount = topupGoal.currentAmount + parseFloat(topupAmount)
    const isCompleted = newAmount >= topupGoal.targetAmount

    await fetch(`/api/goals?id=${topupGoal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: topupGoal.title,
        targetAmount: topupGoal.targetAmount,
        currentAmount: newAmount,
        deadline: topupGoal.deadline,
        icon: topupGoal.icon,
        color: topupGoal.color,
        isCompleted,
      }),
    })

    setShowTopupModal(false)
    fetchGoals()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus target ini?')) return
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    fetchGoals()
  }

  const activeGoals = goals.filter(g => !g.isCompleted)
  const completedGoals = goals.filter(g => g.isCompleted)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Target Tabungan</h1>
          <p className="text-gray-500">Tetapkan dan capai target keuanganmu</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Target
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Target</p>
          <p className="text-xl font-bold text-gray-900">{goals.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Sedang Berjalan</p>
          <p className="text-xl font-bold text-blue-600">{activeGoals.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Terkumpul</p>
          <p className="text-xl font-bold text-green-600">{formatRupiah(totalSaved)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Target</p>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(totalTarget)}</p>
        </div>
      </div>

      {/* Active Goals */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada target tabungan</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Target" untuk mulai menabung</p>
        </div>
      ) : (
        <>
          {/* Active */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Sedang Berjalan</h2>
              <div className="grid grid-cols-2 gap-4">
                {activeGoals.map(goal => {
                  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  const remaining = goal.targetAmount - goal.currentAmount
                  const daysLeft = goal.deadline
                    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null

                  return (
                    <div key={goal.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: goal.color + '20' }}
                          >
                            {goal.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{goal.title}</p>
                            {daysLeft !== null && (
                              <p className={`text-xs ${daysLeft < 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Sudah lewat deadline!'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(goal)} className="text-gray-300 hover:text-blue-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(goal.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{formatRupiah(goal.currentAmount)} terkumpul</span>
                          <span>{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-400">Target: {formatRupiah(goal.targetAmount)}</span>
                          <span className="text-gray-500 font-medium">Kurang {formatRupiah(remaining)}</span>
                        </div>
                      </div>

                      {/* Topup Button */}
                      <button
                        onClick={() => openTopupModal(goal)}
                        className="w-full mt-2 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: goal.color }}
                      >
                        + Tambah Tabungan
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">✅ Tercapai</h2>
              <div className="grid grid-cols-2 gap-4">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm opacity-75">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                          {goal.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{goal.title}</p>
                          <p className="text-xs text-green-600 font-medium">Target tercapai! 🎉</p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(goal.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-3">
                      <div className="h-3 rounded-full bg-green-500 w-full" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">{formatRupiah(goal.targetAmount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingGoal ? 'Edit Target' : 'Tambah Target Tabungan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Icon */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                      form.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Warna */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className="w-8 h-8 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#1d4ed8' : 'transparent',
                      transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    {form.color === color && <Check className="w-3 h-3 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Judul */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Target</label>
              <input
                type="text"
                placeholder="Contoh: Beli Laptop"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Target Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={form.targetAmount}
                onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Current Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sudah Terkumpul (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={form.currentAmount}
                onChange={e => setForm({ ...form, currentAmount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Deadline */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (opsional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                {editingGoal ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Topup */}
      {showTopupModal && topupGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Tambah Tabungan</h2>
              <button onClick={() => setShowTopupModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Target: {topupGoal.title}</p>
              <p className="text-sm text-gray-500">Terkumpul: <span className="font-semibold text-gray-900">{formatRupiah(topupGoal.currentAmount)}</span></p>
              <p className="text-sm text-gray-500">Target: <span className="font-semibold text-gray-900">{formatRupiah(topupGoal.targetAmount)}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Tambahan (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleTopup}
                className="flex-1 py-2 text-white rounded-xl text-sm font-medium"
                style={{ backgroundColor: topupGoal.color }}
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