import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: any = { userId: session.user.id }

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amount, type, categoryId, description, date } = body

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date: new Date(date),
      userId: session.user.id,
    },
    include: { category: true },
  })

  return NextResponse.json(transaction)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()
  const { amount, type, categoryId, description, date } = body

  await prisma.transaction.updateMany({
    where: { id: id!, userId: session.user.id },
    data: {
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date: new Date(date),
    },
  })

  const transaction = await prisma.transaction.findFirst({
    where: { id: id!, userId: session.user.id },
    include: { category: true },
  })

  return NextResponse.json(transaction)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await prisma.transaction.deleteMany({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}