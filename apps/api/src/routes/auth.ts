import { Hono } from 'hono'
import { rateLimit } from '../middleware/rate-limit'
import type { Mailer } from '../infra/mail/mailer'
import type { SessionStore } from '../infra/auth/session-store'

export function createAuthRouter(deps: { sessionStore: SessionStore; mailer: Mailer }) {
  const auth = new Hono()

  auth.post('/login', rateLimit({ keyPrefix: 'login', windowMs: 60_000, maxRequests: 10 }), async (c) => {
    const body = await c.req.json<{ userId: string; password: string }>()
    if (!body.userId || !body.password) {
      return c.json({ code: 'INVALID_REQUEST' }, 400)
    }

    // MVP skeleton: 認証検証は省略
    const sessionId = crypto.randomUUID()
    await deps.sessionStore.set(sessionId, {
      userId: body.userId,
      role: 'operator',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 8
    })

    c.header('set-cookie', `sid=${sessionId}; HttpOnly; Path=/; SameSite=Lax`)
    return c.json({ sessionId })
  })

  auth.post('/password-reset/request', async (c) => {
    const body = await c.req.json<{ email: string }>()
    if (!body.email) return c.json({ code: 'INVALID_REQUEST' }, 400)

    await deps.mailer.send({
      to: body.email,
      subject: 'Password reset request',
      text: 'Reset token: <replace-me>'
    })

    return c.json({ ok: true })
  })

  return auth
}
