import { createHash, randomBytes } from 'node:crypto'

export function generateResetToken() {
  return randomBytes(32).toString('hex')
}

export function hashResetToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function buildResetExpiry(hours = 2) {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now.toISOString()
}
