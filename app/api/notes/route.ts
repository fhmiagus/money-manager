import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, content, color } = body

  const note = await prisma.note.create({
    data: {
      title,
      content,
      color: color || '#ffffff',
      userId: session.user.id,
    },
  })

  return NextResponse.json(note)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()
  const { title, content, color } = body

  await prisma.note.updateMany({
    where: { id: id!, userId: session.user.id },
    data: { title, content, color },
  })

  const note = await prisma.note.findFirst({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json(note)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  await prisma.note.deleteMany({
    where: { id: id!, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}