import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const today = now.getDate()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const recurringList = await prisma.recurringTransaction.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      dayOfMonth: today,
    },
    include: { category: true },
  })

  if (recurringList.length === 0) {
    return NextResponse.json({ message: 'Tidak ada transaksi recurring hari ini', count: 0 })
  }

  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  let created = 0

  for (const rec of recurringList) {
    const existing = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        categoryId: rec.categoryId,
        description: `[Otomatis] ${rec.description || rec.category.name}`,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    if (!existing) {
      await prisma.transaction.create({
        data: {
          amount: rec.amount,
          type: rec.type,
          categoryId: rec.categoryId,
          description: `[Otomatis] ${rec.description || rec.category.name}`,
          date: now,
          userId: session.user.id,
        },
      })
      created++
    }
  }

  return NextResponse.json({ message: `${created} transaksi berhasil dibuat`, count: created })
}