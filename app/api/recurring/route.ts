import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(recurring)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amount, type, categoryId, description, dayOfMonth } = body

  const recurring = await prisma.recurringTransaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      dayOfMonth: parseInt(dayOfMonth),
      userId: session.user.id,
    },
    include: { category: true },
  })

  return NextResponse.json(recurring)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await prisma.recurringTransaction.deleteMany({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  await prisma.recurringTransaction.updateMany({
    where: { id: id!, userId: session.user.id },
    data: { isActive: body.isActive },
  })

  const recurring = await prisma.recurringTransaction.findFirst({
    where: { id: id!, userId: session.user.id },
    include: { category: true },
  })

  return NextResponse.json(recurring)
}