import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { CaseDiscussionRepository } from '../repositories/case-discussion-repository'

type AuthUser = { id: string; role: string; email?: string; fullName?: string }

export const caseDiscussionsRoutes = new Hono()
    .use('*', requireAuth)

    // List messages for a screening
    .get('/:screeningId', async (ctx) => {
        const screeningId = ctx.req.param('screeningId')
        const limit = parseInt(ctx.req.query('limit') || '100', 10)
        const offset = parseInt(ctx.req.query('offset') || '0', 10)
        const db = getDb()
        const repo = new CaseDiscussionRepository(db)

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
        const messageId = ctx.req.param('messageId')
        const db = getDb()
        const repo = new CaseDiscussionRepository(db)

        await repo.delete(messageId)
        return ctx.json({ success: true })
    })
