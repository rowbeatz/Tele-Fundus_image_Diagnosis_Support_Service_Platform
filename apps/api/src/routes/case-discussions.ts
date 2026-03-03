import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { CaseDiscussionRepository } from '../repositories/case-discussion-repository'

type AuthUser = { id: string; role: string; email?: string; fullName?: string }


const canAccessScreening = async (db: ReturnType<typeof getDb>, screeningId: string, user: AuthUser) => {
    const result = await db.query(
        `
        SELECT 1
        FROM screenings s
        JOIN client_orders co ON s.client_order_id = co.id
        LEFT JOIN assignments a ON a.screening_id = s.id AND a.is_current = true
        JOIN users u ON u.id = $2
        WHERE s.id = $1
          AND (
              u.role IN ('admin', 'operator')
              OR (u.role = 'client' AND u.organization_id = co.organization_id)
              OR (u.role = 'physician' AND u.physician_id = a.physician_id)
          )
        LIMIT 1
        `,
        [screeningId, user.id]
    )

    return (result.rowCount || 0) > 0
}

export const caseDiscussionsRoutes = new Hono()
    .use('*', requireAuth)

    // List messages for a screening
    .get('/:screeningId', async (ctx) => {
        const screeningId = ctx.req.param('screeningId')
        const limit = parseInt(ctx.req.query('limit') || '100', 10)
        const offset = parseInt(ctx.req.query('offset') || '0', 10)
        const db = getDb()
        const repo = new CaseDiscussionRepository(db)
        const user = ctx.get('user') as AuthUser

        if (!(await canAccessScreening(db, screeningId, user))) {
            return ctx.json({ success: false, error: 'Forbidden for this screening' }, 403)
        }

        const messages = await repo.listByScreening(screeningId, limit, offset)
        const count = await repo.countByScreening(screeningId)

        return ctx.json({ success: true, messages, total: count })
    })

    // Post a new message
    .post(
        '/:screeningId',
        zValidator('json', z.object({ message: z.string().min(1) })),
        async (ctx) => {
            const screeningId = ctx.req.param('screeningId')
            const { message } = ctx.req.valid('json')
            const user = ctx.get('user') as AuthUser
            const db = getDb()
            const repo = new CaseDiscussionRepository(db)

            if (!(await canAccessScreening(db, screeningId, user))) {
                return ctx.json({ success: false, error: 'Forbidden for this screening' }, 403)
            }

            const created = await repo.create({
                screeningId,
                userId: user.id as string,
                message,
            })

            // Return with user info
            return ctx.json({
                success: true,
                message: {
                    ...created,
                    userName: user.fullName || user.email,
                    userRole: user.role,
                },
            })
        }
    )

    // Delete a message (only own messages)
    .delete('/:screeningId/:messageId', async (ctx) => {
        const screeningId = ctx.req.param('screeningId')
        const messageId = ctx.req.param('messageId')
        const db = getDb()
        const repo = new CaseDiscussionRepository(db)
        const user = ctx.get('user') as AuthUser

        if (!(await canAccessScreening(db, screeningId, user))) {
            return ctx.json({ success: false, error: 'Forbidden for this screening' }, 403)
        }

        const deleted = await repo.deleteOwnedMessage(messageId, user.id, screeningId)
        if (!deleted) {
            return ctx.json({ success: false, error: 'Message not found or not owned by user' }, 404)
        }

        return ctx.json({ success: true })
    })
