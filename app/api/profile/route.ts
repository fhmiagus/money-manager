import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, currentPassword, newPassword, image } = body

  if (image !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image }
    })
    return NextResponse.json({ success: true })
  }

  if (name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name }
    })
    return NextResponse.json({ success: true })
  }

  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return NextResponse.json({ error: 'Password saat ini salah!' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true }
  })

  return NextResponse.json(user)
}