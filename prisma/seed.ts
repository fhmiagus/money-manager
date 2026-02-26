import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Gaji', type: 'income', icon: '💼', color: '#22c55e' },
    { name: 'Freelance', type: 'income', icon: '💻', color: '#16a34a' },
    { name: 'Investasi', type: 'income', icon: '📈', color: '#15803d' },
    { name: 'Bonus', type: 'income', icon: '🎁', color: '#166534' },
    { name: 'Makan & Minum', type: 'expense', icon: '🍜', color: '#ef4444' },
    { name: 'Transport', type: 'expense', icon: '🚗', color: '#f97316' },
    { name: 'Belanja', type: 'expense', icon: '🛍️', color: '#eab308' },
    { name: 'Hiburan', type: 'expense', icon: '🎮', color: '#8b5cf6' },
    { name: 'Kesehatan', type: 'expense', icon: '💊', color: '#06b6d4' },
    { name: 'Tagihan', type: 'expense', icon: '📱', color: '#64748b' },
    { name: 'Pendidikan', type: 'expense', icon: '📚', color: '#f59e0b' },
    { name: 'Lainnya', type: 'expense', icon: '📦', color: '#6b7280' },
  ]

  for (const category of categories) {
    await prisma.category.create({ data: category })
  }

  console.log('✅ Seed kategori selesai!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())