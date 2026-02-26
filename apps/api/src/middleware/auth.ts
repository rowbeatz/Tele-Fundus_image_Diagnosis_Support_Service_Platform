import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

export const requireAuth = async (c: Context, next: Next) => {
    const sessionId = getCookie(c, 'sid')
    if (!sessionId) {
        return c.json({ error: 'Unauthorized: No session' }, 401)
    }

    // In a real app, we'd verify the session in the session store (Redis/DB)
    // For MVP/Demo, we assume the session is valid if the cookie exists
    // and we'd ideally set the user context:
    // const session = await deps.sessionStore.get(sessionId)
    // if (!session) return c.json({ error: 'Unauthorized: Invalid session' }, 401)
    // c.set('user', session)

    // Mocking user for now to unblock routes
    c.set('user', { id: 'admin-1', role: 'admin' })

    await next()
}
