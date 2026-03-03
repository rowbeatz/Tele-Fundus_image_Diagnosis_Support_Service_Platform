/**
 * Public Screenings API Routes
 * 
 * Provides screening list, detail, save/confirm endpoints
 * for the frontend to consume real database data.
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../lib/db'
import { ScreeningRepository } from '../repositories/screening-repository'
import { ExamineeRepository } from '../repositories/examinee-repository'

export const screeningsRoutes = new Hono()

    // GET /screenings — full list for dashboard/screening pages
    .get('/', async (ctx) => {
        const db = getDb()
        const repo = new ScreeningRepository(db)
        const screenings = await repo.findAllRich()
        return ctx.json({ screenings })
    })

    // GET /screenings/:id — single screening detail
    .get('/:id', async (ctx) => {
        const id = ctx.req.param('id')
        const db = getDb()
        const screeningRepo = new ScreeningRepository(db)
        const screening = await screeningRepo.findById(id)
        if (!screening) return ctx.json({ error: 'Not found' }, 404)

        // Also fetch examinee details
        const examineeRepo = new ExamineeRepository(db)
        const examinee = await examineeRepo.findById(screening.examineeId)

        return ctx.json({ screening, examinee })
    })

    // PUT /screenings/:id/status — save (draft) or confirm
    .put(
        '/:id/status',
        zValidator('json', z.object({
            status: z.enum(['draft', 'saved', 'confirmed', 'submitted', 'completed']),
        })),
        async (ctx) => {
            const id = ctx.req.param('id')
            const { status } = ctx.req.valid('json')
            const db = getDb()
            const repo = new ScreeningRepository(db)

            const existing = await repo.findById(id)
            if (!existing) return ctx.json({ error: 'Not found' }, 404)

            await repo.updateStatus(id, status)
            return ctx.json({ success: true, id, status })
        }
    )

    // POST /screenings — create new screening (for uploads page)
    .post(
        '/',
        zValidator('json', z.object({
            examineeId: z.string(),
            clientOrderId: z.string(),
            screeningDate: z.string(),
            urgencyFlag: z.boolean().optional(),
            bloodPressureSystolic: z.number().optional(),
            bloodPressureDiastolic: z.number().optional(),
            hasDiabetes: z.boolean().optional(),
            hasHypertension: z.boolean().optional(),
            hasDyslipidemia: z.boolean().optional(),
            smokingStatus: z.string().optional(),
            specialNotes: z.string().optional(),
        })),
        async (ctx) => {
            const body = ctx.req.valid('json')
            const db = getDb()
            const repo = new ScreeningRepository(db)
            const screening = await repo.create(body)
            return ctx.json({ screening }, 201)
        }
    )
