import { Hono } from 'hono'
import { parseCsv } from '../utils/csv'

export const importsRouter = new Hono()

importsRouter.post('/screenings/csv', async (c) => {
  const body = await c.req.json<{ csv: string }>()
  if (!body.csv) return c.json({ code: 'INVALID_REQUEST' }, 400)

  const rows = parseCsv(body.csv)
  return c.json({ count: rows.length, rows })
})
