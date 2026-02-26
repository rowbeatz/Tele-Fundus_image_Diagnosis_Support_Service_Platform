import { createMiddleware } from 'hono/factory'
import { pool } from '../lib/db'

export const auditLogger = createMiddleware(async (c, next) => {
  const startedAt = Date.now()
  await next()
  const durationMs = Date.now() - startedAt

  const method = c.req.method
  // Log mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const user = c.get('user') as { id?: string } | undefined
    const url = new URL(c.req.url)
    const action = \`\${method} \${url.pathname}\`
    const ipAddress = c.req.header('x-forwarded-for') || undefined
    const status = c.res.status

    // Send the log asynchronously to avoid blocking the response
    pool.query(
      \`
      insert into audit_logs (user_id, action, target_type, ip_address, after_json)
      values ($1, $2, $3, $4, $5)
      \`,
      [
        user?.id || null,
        action,
        'API_REQUEST',
        ipAddress,
        JSON.stringify({ status, durationMs }),
      ]
    ).catch(err => {
      console.error('Failed to write audit log:', err)
    })
  } else {
    // For GETs, we just console.log the duration as the template suggested for debugging
    const user = c.get('user') as { id?: string } | undefined
    console.log('[audit]', JSON.stringify({
      userId: user?.id ?? null,
      action: \`\${method} \${new URL(c.req.url).pathname}\`,
      targetType: 'http_request',
      status: c.res.status,
      durationMs,
      createdAt: new Date().toISOString(),
    }))
  }
})
