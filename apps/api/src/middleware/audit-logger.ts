import { Context, Next } from 'hono'
import { pool } from '../lib/db'

export const auditLogger = async (c: Context, next: Next) => {
  const startedAt = Date.now()
  await next()
  const durationMs = Date.now() - startedAt

  const method = c.req.method
  const url = new URL(c.req.url)
  const path = url.pathname

  // We want to log READs for PHI routes as well per HIPAA requirements
  const phiRoutes = ['/examinees', '/screenings', '/viewer', '/images', '/ops-screenings', '/ops-readings']
  const isPhiRoute = phiRoutes.some(r => path.startsWith(r))

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || isPhiRoute) {
    const user = c.get('user') as { id?: string } | undefined

    let action = 'READ'
    if (method === 'POST') action = 'CREATE'
    if (method === 'PUT' || method === 'PATCH') action = 'UPDATE'
    if (method === 'DELETE') action = 'DELETE'
    if (path.includes('export') || path.includes('fhir')) action = 'EXPORT'

    const ipAddress = c.req.header('x-forwarded-for') || undefined
    const userAgent = c.req.header('user-agent') || undefined
    const status = c.res.status

    const resourceType = path.split('/')[1] || 'unknown'
    const resourceId = path.split('/')[2] || 'collection'

    // Send the log asynchronously to avoid blocking the response
    if (user?.id) {
      pool.query(
        `
        insert into audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
        values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          user.id,
          action,
          resourceType,
          resourceId,
          JSON.stringify({ path, status, durationMs }),
          ipAddress,
          userAgent
        ]
      ).catch(err => {
        console.error('Failed to write audit log:', err)
      })
    }
  } else {
    // For GETs on non-PHI, we just console.log the duration
    const user = c.get('user') as { id?: string } | undefined
    console.log('[audit]', JSON.stringify({
      userId: user?.id ?? null,
      action: `${method} ${path}`,
      targetType: 'http_request',
      status: c.res.status,
      durationMs,
      createdAt: new Date().toISOString(),
    }))
  }
}
