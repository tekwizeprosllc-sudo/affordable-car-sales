import { NextResponse } from 'next/server'
import { verifyPassword, sessionCookie, clearedCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}))
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(sessionCookie())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearedCookie())
  return res
}
