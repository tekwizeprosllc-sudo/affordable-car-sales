import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE = 'acs_admin'

// No fallback on purpose. This used to default to a literal password that sits
// in the public repo, so a missing env var quietly left the lead desk — real
// customer names and phone numbers — open to anyone who read the source.
// Unset now means nobody gets in.
function secret() {
  return process.env.ADMIN_PASSWORD || ''
}

export function isConfigured() {
  return secret().length > 0
}

function token() {
  return crypto.createHash('sha256').update(`acs::${secret()}`).digest('hex')
}

export function verifyPassword(password) {
  if (!isConfigured()) return false
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
  if (!isConfigured()) return false
  return cookies().get(COOKIE)?.value === token()
}

export function clearedCookie() {
  return { name: COOKIE, value: '', path: '/', maxAge: 0 }
}
