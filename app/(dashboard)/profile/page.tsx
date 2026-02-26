'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { User, Mail, Lock, Save, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')
  const [nameForm, setNameForm] = useState({ name: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (session?.user?.name) {
      setNameForm({ name: session.user.name })
    }
  }, [session])

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.image) setAvatarUrl(data.image)
      })
  }, [])

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploadLoading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (error) {
      showMessage('error', 'Gagal upload foto!')
      setUploadLoading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUrl }),
    })

    setAvatarUrl(imageUrl)
    await update({ image: imageUrl })
    setUploadLoading(false)
    showMessage('success', 'Foto profil berhasil diupdate!')
  }

  const handleUpdateName = async () => {
    if (!nameForm.name.trim()) return
    setLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameForm.name }),
    })
    setLoading(false)
    if (res.ok) {
      await update({ name: nameForm.name })
      showMessage('success', 'Nama berhasil diupdate!')
    } else {
      showMessage('error', 'Gagal update nama!')
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showMessage('error', 'Harap isi semua field!'); return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Password baru tidak cocok!'); return
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password minimal 6 karakter!'); return
    }
    setLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      showMessage('success', 'Password berhasil diubah!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      showMessage('error', data.error || 'Gagal update password!')
    }
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-500">Kelola informasi akunmu</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm card-shadow flex items-center gap-4">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {uploadLoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-3 h-3 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadAvatar}
          />
        </div>

        <div>
          <p className="text-lg font-bold text-gray-900">{session?.user?.name}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-500 mt-1 hover:underline"
          >
            Ganti foto profil
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" />Informasi Akun
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'password'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Lock className="w-4 h-4" />Ganti Password
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm card-shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{session?.user?.email}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
          </div>
          <button
            onClick={handleUpdateName}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm card-shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
            <input
              type="password"
              placeholder="Min. 6 karakter"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              placeholder="Ulangi password baru"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </div>
      )}
    </div>
  )
}