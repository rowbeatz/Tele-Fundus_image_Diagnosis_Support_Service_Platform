import { Hono } from 'hono'
import { getDb } from '../lib/db'
import { requireAuth } from '../middleware/auth'

export const physiciansRoutes = new Hono<{ Variables: { user: { id: string, role: string } } }>()
    .use('*', requireAuth)

    .get('/', async (ctx) => {
        const db = getDb()
        const result = await db.query(
            `
      select
        id,
        name,
        specialty,
        status,
        created_at as "createdAt"
      from physicians
      where deleted_at is null
      order by name asc
      `
        )
        return ctx.json(result.rows)
    })
