'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  date: string
  category: {
    name: string
    icon: string
    color: string
  }
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  useEffect(() => {
    fetch(`/api/transactions?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data)
        setLoading(false)
      })
  }, [month, year])

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Data untuk pie chart kategori pengeluaran
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const key = t.category.name
      acc[key] = (acc[key] || 0) + t.amount
      return acc
    }, {})

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#64748b', '#f59e0b']

  // Data untuk bar chart harian
  const dailyData = transactions.reduce((acc: any, t) => {
    const day = new Date(t.date).getDate()
    if (!acc[day]) acc[day] = { day: `${day}`, income: 0, expense: 0 }
    if (t.type === 'income') acc[day].income += t.amount
    else acc[day].expense += t.amount
    return acc
  }, {})

  const barData = Object.values(dailyData).slice(0, 10)

  const recentTransactions = [...transactions].slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">{MONTHS[month - 1]} {year}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Saldo</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(balance)}</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Pemasukan</span>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatRupiah(totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Pengeluaran</span>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Transaksi Harian</h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada transaksi bulan ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData as any}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value: any) => formatRupiah(value)} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada pengeluaran bulan ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatRupiah(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Transaksi Terbaru</h2>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Belum ada transaksi. Tambahkan transaksi pertamamu!
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                    {t.category.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description || t.category.name}</p>
                    <p className="text-xs text-gray-400">{t.category.name} • {new Date(t.date).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {t.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}