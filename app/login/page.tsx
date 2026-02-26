'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegistered, setShowRegistered] = useState(!!registered)

  // Hapus query param dari URL setelah 3 detik
  useEffect(() => {
    if (registered) {
      const timer = setTimeout(() => {
        setShowRegistered(false)
        router.replace('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [registered, router])

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Harap isi semua field!'); return }
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email atau password salah!')
    } else {
      router.push('/')
      router.refresh()
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
          <h1 className="text-2xl font-bold text-white">Money Manager</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Masuk ke akunmu</p>
        </div>

        {/* Notifikasi register berhasil - hilang otomatis */}
        {showRegistered && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-green-400"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            Akun berhasil dibuat! Silakan masuk.
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ❌ {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
          <input type="email" placeholder="nama@email.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            <button onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 0 20px rgba(102,126,234,0.4)', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}