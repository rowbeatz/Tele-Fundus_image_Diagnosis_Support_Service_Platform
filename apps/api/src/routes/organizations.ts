import { Hono } from 'hono'
import { getDb } from '../lib/db'

export const organizationsRoutes = new Hono()

    .get('/', async (ctx) => {
        const db = getDb()
        const result = await db.query(
            `
      select
        id,
        code,
        name,
        billing_name as "billingName",
        contact_name as "contactName",
        email,
        phone,
        address,
        status,
        created_at as "createdAt"
      from organizations
      where deleted_at is null
      order by name asc
      `
        )
        return ctx.json(result.rows)
    })
