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

  auth.post('/login', rateLimit({ keyPrefix: 'login', windowMs: 60_000, maxRequests: 10 }), async (c) => {
    const body = await c.req.json<{ userId: string; password: string }>()
    if (!body.userId || !body.password) {
      return c.json({ code: 'INVALID_REQUEST' }, 400)
    }

    // MVP skeleton: authentication validation relies on stored procedures or simpler verify logic
    // We mock login verification for now
    const sessionId = crypto.randomUUID()
    await deps.sessionStore.set(sessionId, {
      userId: body.userId,
      role: 'operator',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 8
    })

    c.header('set-cookie', \`sid=\${sessionId}; HttpOnly; Path=/; SameSite=Lax\`)
    return c.json({ sessionId })
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
        text: \`Reset token: \${rawToken}\`
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
