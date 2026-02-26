'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, Check, StickyNote } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  { label: 'Putih', value: '#ffffff' },
  { label: 'Kuning', value: '#fef9c3' },
  { label: 'Hijau', value: '#dcfce7' },
  { label: 'Biru', value: '#dbeafe' },
  { label: 'Merah Muda', value: '#fce7f3' },
  { label: 'Ungu', value: '#f3e8ff' },
  { label: 'Orange', value: '#ffedd5' },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [form, setForm] = useState({ title: '', content: '', color: '#fef9c3' })

  const fetchNotes = () => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(setNotes)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const openAddModal = () => {
    setEditingNote(null)
    setForm({ title: '', content: '', color: '#fef9c3' })
    setShowModal(true)
  }

  const openEditModal = (note: Note) => {
    setEditingNote(note)
    setForm({ title: note.title, content: note.content, color: note.color })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('Judul tidak boleh kosong!')
      return
    }

    if (editingNote) {
      await fetch(`/api/notes?id=${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setShowModal(false)
    fetchNotes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus catatan ini?')) return
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
    fetchNotes()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catatan</h1>
          <p className="text-gray-500">Tulis catatan, target, atau reminder keuanganmu</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Catatan
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-6">
        <div className="text-sm">
          <span className="text-gray-500">Total Catatan: </span>
          <span className="font-semibold text-gray-900">{notes.length}</span>
        </div>
        {notes.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Terakhir diupdate: </span>
            <span className="font-semibold text-gray-900">{formatDate(notes[0].updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada catatan</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Catatan" untuk mulai menulis</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-3 group relative"
              style={{ backgroundColor: note.color }}
            >
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(note)}
                  className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="pr-16">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{note.title}</h3>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1 leading-relaxed">
                {note.content}
              </p>

              <p className="text-xs text-gray-400 mt-auto">
                {formatDate(note.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingNote ? 'Edit Catatan' : 'Tambah Catatan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Judul */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
              <input
                type="text"
                placeholder="Contoh: Target bulan ini"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Isi */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Isi Catatan</label>
              <textarea
                placeholder="Tulis catatanmu di sini..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Warna */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna Catatan</label>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className="w-8 h-8 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: c.value,
                      borderColor: form.color === c.value ? '#3b82f6' : '#e5e7eb',
                      transform: form.color === c.value ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={c.label}
                  >
                    {form.color === c.value && (
                      <Check className="w-3 h-3 text-blue-600 mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div
              className="rounded-xl p-3 mb-6 border border-gray-200"
              style={{ backgroundColor: form.color }}
            >
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <p className="text-sm font-semibold text-gray-900">{form.title || 'Judul catatan'}</p>
              <p className="text-xs text-gray-600 mt-1">{form.content || 'Isi catatan...'}</p>
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
                {editingNote ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}