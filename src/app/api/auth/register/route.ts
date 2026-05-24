import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIP } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Максимум 5 регистраций с одного IP за 15 минут
const limiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 })

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Пароль минимум 8 символов'),
  name: z.string().optional(),
  company: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getIP(req)
  const { ok, retryAfter } = limiter(ip)
  if (!ok) {
    return NextResponse.json(
      { error: `Слишком много попыток. Подождите ${retryAfter} секунд.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Email уже используется' }, { status: 400 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, name: data.name, company: data.company },
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
