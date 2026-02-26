import { Context, Next } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

// HIPAA / ISO 27001 requires strict transport security and modern browser protections
export const securityHeadersMiddleware = secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        // Viewer canvas might need specifically tuned domains depending on S3/CDN map
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.amazonaws.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
    },
})

// Role Based Access Control for PHI and Accounting
export const requireRole = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user')
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        if (!allowedRoles.includes(user.role)) {
            // Log unauthorized access attempts strictly for HIPAA
            console.warn(`[SECURITY] Unauthorized RBAC access attempt by user ${user.id} to ${c.req.path}. Required: ${allowedRoles.join(',')}, Actual: ${user.role}`)
            return c.json({ error: 'Forbidden: Insufficient privileges' }, 403)
        }

        await next()
    }
}
