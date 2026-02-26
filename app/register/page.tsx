'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Harap isi semua field!'); return }
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok!'); return }
    if (form.password.length < 6) { setError('Password minimal 6 karakter!'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      <div className="w-full max-w-md p-8 rounded-3xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 0 30px rgba(102,126,234,0.5)' }}>
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Buat Akun</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Mulai kelola keuanganmu</p>
        </div>

        {/* Notifikasi sukses */}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-green-400"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
             Akun berhasil dibuat! Mengarahkan ke halaman login...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ❌ {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Nama</label>
          <input type="text" placeholder="Nama lengkap" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
          <input type="email" placeholder="nama@email.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            <button onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Konfirmasi Password</label>
          <input type="password" placeholder="Ulangi password" value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading || success}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 0 20px rgba(102,126,234,0.4)', opacity: loading || success ? 0.7 : 1 }}>
          {loading ? 'Mendaftar...' : success ? 'Berhasil! ✅' : 'Daftar'}
        </button>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Sudah punya akun?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}