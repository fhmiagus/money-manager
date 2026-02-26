import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goals = await prisma.savingGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(goals)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, targetAmount, deadline, icon, color } = body

  const goal = await prisma.savingGoal.create({
    data: {
      title,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline ? new Date(deadline) : null,
      icon: icon || '🎯',
      color: color || '#3b82f6',
      userId: session.user.id,
    },
  })

  return NextResponse.json(goal)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()
  const { title, targetAmount, currentAmount, deadline, icon, color, isCompleted } = body

  await prisma.savingGoal.updateMany({
    where: { id: id!, userId: session.user.id },
    data: {
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: deadline ? new Date(deadline) : null,
      icon,
      color,
      isCompleted,
    },
  })

  const goal = await prisma.savingGoal.findFirst({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json(goal)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await prisma.savingGoal.deleteMany({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}