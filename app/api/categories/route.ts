import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, type, icon, color } = body

  const category = await prisma.category.create({
    data: { name, type, icon: icon || '📦', color: color || '#6b7280' },
  })

  return NextResponse.json(category)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()
  const { name, type, icon, color } = body

  const category = await prisma.category.update({
    where: { id: id! },
    data: { name, type, icon, color },
  })

  return NextResponse.json(category)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id!, userId: session.user.id },
  })

  if (transactionCount > 0) {
    return NextResponse.json(
      { error: 'Kategori masih digunakan oleh transaksi, tidak bisa dihapus!' },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: id! } })
  return NextResponse.json({ success: true })
}