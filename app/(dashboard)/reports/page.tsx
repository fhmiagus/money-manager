'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'

interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

interface CategoryData {
  name: string
  icon: string
  total: number
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function ReportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [topExpenses, setTopExpenses] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllMonths = async () => {
      setLoading(true)
      const results: MonthlyData[] = []
      const categoryMap: Record<string, CategoryData> = {}

      for (let m = 1; m <= 12; m++) {
        const res = await fetch(`/api/transactions?month=${m}&year=${year}`)
        const transactions = await res.json()

        const income = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        const expense = transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + t.amount, 0)

        results.push({
          month: MONTHS[m - 1],
          income,
          expense,
          balance: income - expense,
        })

        // Hitung per kategori
        transactions
          .filter((t: any) => t.type === 'expense')
          .forEach((t: any) => {
            const key = t.category.name
            if (!categoryMap[key]) {
              categoryMap[key] = { name: key, icon: t.category.icon, total: 0 }
            }
            categoryMap[key].total += t.amount
          })
      }

      setMonthlyData(results)
      setTopExpenses(
        Object.values(categoryMap)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      )
      setLoading(false)
    }

    fetchAllMonths()
  }, [year])

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0)
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0)
  const totalBalance = totalIncome - totalExpense
  const avgExpense = totalExpense / 12

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Memuat laporan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500">Ringkasan keuangan tahunan</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Pemasukan</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-green-600">{formatRupiah(totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">Tahun {year}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Pengeluaran</span>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">Tahun {year}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Saldo Akhir</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatRupiah(totalBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tahun {year}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Rata-rata Pengeluaran</span>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-orange-600">{formatRupiah(avgExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">Per bulan</p>
        </div>
      </div>

      {/* Bar Chart Bulanan */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Pemasukan vs Pengeluaran per Bulan</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000000}jt`} />
            <Tooltip formatter={(value: any) => formatRupiah(value)} />
            <Legend />
            <Bar dataKey="income" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart Saldo */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Tren Saldo Bulanan</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000000}jt`} />
            <Tooltip formatter={(value: any) => formatRupiah(value)} />
            <Line
              type="monotone"
              dataKey="balance"
              name="Saldo"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Pengeluaran Kategori */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Top 5 Kategori Pengeluaran</h2>
        {topExpenses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Belum ada data pengeluaran</p>
        ) : (
          <div className="space-y-4">
            {topExpenses.map((cat, i) => {
              const percentage = (cat.total / totalExpense) * 100
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatRupiah(cat.total)}</span>
                      <span className="text-xs text-gray-400 ml-2">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}