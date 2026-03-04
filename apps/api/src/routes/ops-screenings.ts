import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { ScreeningRepository } from '../repositories/screening-repository'
import { AssignmentRepository } from '../repositories/assignment-repository'
import { ReadingRepository } from '../repositories/reading-repository'

export const opsScreeningsRoutes = new Hono<{ Variables: { user: { id: string, role: string } } }>()
  .use('*', requireAuth)

  // Reception Check: Mark a screening as ready for reading (create a draft reading if needed)
  .post(
    '/:screeningId/reception-check',
    zValidator(
      'json',
      z.object({
        isPassed: z.boolean(),
        rejectionReason: z.string().optional(),
      })
    ),
    async (ctx) => {
      const screeningId = ctx.req.param('screeningId')
      const { isPassed, rejectionReason } = ctx.req.valid('json')

      const db = getDb()
      const screeningRepo = new ScreeningRepository(db)
      const readingRepo = new ReadingRepository(db)

      const screening = await screeningRepo.findById(screeningId)
      if (!screening) return ctx.json({ error: 'Screening not found' }, 404)

      if (isPassed) {
        await screeningRepo.update(screeningId, { status: 'reading_assigned' })
      } else {
        await screeningRepo.update(screeningId, { status: 'reception_rejected' })
        // Could log rejectionReason in a notes field if added to screening table later
      }

      return ctx.json({ success: true, screeningId })
    }
  )

  // Assignment: Assign a physician to a screening
  .post(
    '/:screeningId/assign',
    zValidator(
      'json',
      z.object({
        physicianId: z.string(),
        dueAt: z.string().optional(),
        reassignReason: z.string().optional(),
      })
    ),
    async (ctx) => {
      const screeningId = ctx.req.param('screeningId')
      const { physicianId, dueAt, reassignReason } = ctx.req.valid('json')
      const user = ctx.get('user')

      const db = getDb()
      const assignmentRepo = new AssignmentRepository(db)
      const screeningRepo = new ScreeningRepository(db)

      const screening = await screeningRepo.findById(screeningId)
      if (!screening) return ctx.json({ error: 'Screening not found' }, 404)

      const assignment = await assignmentRepo.create({
        screeningId,
        physicianId,
        assignedBy: user.id as string,
        dueAt,
        reassignReason,
      })

      await screeningRepo.update(screeningId, { status: 'reading_assigned' })

      return ctx.json({ success: true, assignment })
    }
  )
