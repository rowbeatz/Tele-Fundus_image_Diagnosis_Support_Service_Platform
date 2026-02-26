import { Hono } from 'hono'
import { rateLimit } from '../middleware/rate-limit'
import type { Mailer } from '../infra/mail/mailer'
import type { SessionStore } from '../infra/auth/session-store'
import { UserRepository } from '../repositories/user-repository'
import { PasswordResetRepository } from '../repositories/password-reset-repository'
import { pool } from '../lib/db'

export function createAuthRouter(deps: { sessionStore: SessionStore; mailer: Mailer }) {
  const auth = new Hono()
  const userRepo = new UserRepository(pool)
  const passwordResetRepo = new PasswordResetRepository(pool)

  auth.get('/me', async (c) => {
    const sessionId = c.req.header('cookie')?.split(';').find(s => s.trim().startsWith('sid='))?.split('=')[1]
    if (!sessionId) return c.json({ user: null })

    const session = await deps.sessionStore.get(sessionId)
    if (!session) return c.json({ user: null })

    const user = await userRepo.findByEmail(session.userId) // In this mock session.userId is email
    if (!user) return c.json({ user: null })

    return c.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        physicianId: user.physicianId
      }
    })
  })

  auth.post('/login', rateLimit({ keyPrefix: 'login', windowMs: 60_000, maxRequests: 10 }), async (c) => {
    const body = await c.req.json<{ email: string; password: string }>()
    if (!body.email || !body.password) {
      return c.json({ code: 'INVALID_REQUEST' }, 400)
    }

    // Demo: accept any seeded user from the database
    const user = await userRepo.findByEmail(body.email)
    if (user) {
      const sessionId = crypto.randomUUID()
      await deps.sessionStore.set(sessionId, {
        userId: user.email,
        role: user.role,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 8
      })

      c.header('set-cookie', `sid=${sessionId}; HttpOnly; Path=/; SameSite=Lax`)
      return c.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          physicianId: user.physicianId
        }
      })
    }

    return c.json({ code: 'INVALID_CREDENTIALS' }, 401)
  })

  auth.post('/logout', async (c) => {
    const sessionId = c.req.header('cookie')?.split(';').find(s => s.trim().startsWith('sid='))?.split('=')[1]
    if (sessionId) {
      await deps.sessionStore.delete(sessionId)
    }
    c.header('set-cookie', 'sid=; HttpOnly; Path=/; Max-Age=0')
    return c.json({ success: true })
  })

  auth.post('/password-reset/request', async (c) => {
    const body = await c.req.json<{ email: string }>()
    if (!body.email) return c.json({ code: 'INVALID_REQUEST' }, 400)

    const user = await userRepo.findByEmail(body.email)
    if (user) {
      const rawToken = await passwordResetRepo.createToken(user.id)
      await deps.mailer.send({
        to: body.email,
        subject: 'Password reset request',
        text: `Reset token: ${rawToken}`
      })
    }

    return c.json({ ok: true })
  })

  auth.post('/password-reset/confirm', async (c) => {
    const body = await c.req.json<{ token: string; newPassword: string }>()
    if (!body.token || !body.newPassword) return c.json({ code: 'INVALID_REQUEST' }, 400)

    const userId = await passwordResetRepo.verifyAndUseToken(body.token)
    if (!userId) {
      return c.json({ code: 'INVALID_TOKEN' }, 400)
    }

    // In a full implementation, we would update the user's password hash here
    // using the UserRepository.

    return c.json({ ok: true })
  })

  return auth
}
