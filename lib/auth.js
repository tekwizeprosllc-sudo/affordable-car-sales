import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE = 'acs_admin'

function secret() {
  return process.env.ADMIN_PASSWORD || 'changeme'
}

function token() {
  return crypto.createHash('sha256').update(`acs::${secret()}`).digest('hex')
}

export function verifyPassword(password) {
  const expected = Buffer.from(secret())
  const given = Buffer.from(String(password || ''))
  if (expected.length !== given.length) return false
  return crypto.timingSafeEqual(expected, given)
}

export function sessionCookie() {
  return {
    name: COOKIE,
    value: token(),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === 'production',
  }
}

export function isAuthed() {
  return cookies().get(COOKIE)?.value === token()
}

export function clearedCookie() {
  return { name: COOKIE, value: '', path: '/', maxAge: 0 }
}
