import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      month: parseInt(month!),
      year: parseInt(year!),
    },
    include: { category: true },
  })

  return NextResponse.json(budgets)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { categoryId, amount, month, year } = body

  const budget = await prisma.budget.upsert({
    where: {
      categoryId_month_year_userId: {
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
        userId: session.user.id,
      },
    },
    update: { amount: parseFloat(amount) },
    create: {
      categoryId,
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year),
      userId: session.user.id,
    },
    include: { category: true },
  })

  return NextResponse.json(budget)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await prisma.budget.deleteMany({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}