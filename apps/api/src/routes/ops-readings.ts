import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { ReadingRepository } from '../repositories/reading-repository'
import { ReadingReviewRepository } from '../repositories/reading-review-repository'

export const opsReadingsRoutes = new Hono<{ Variables: { user: { id: string, role: string } } }>()
  .use('*', requireAuth)

  // Get readings pending QC (or previously reviewed)
  .get('/qc', async (ctx) => {
    const db = getDb()
    const result = await db.query(`
      select
        r.id,
        r.id as "readingId",
        r.screening_id as "screeningId",
        e.display_name as "patientName",
        p.name as "physicianName",
        o.name as "organizationName",
        to_char(r.submitted_at, 'YYYY-MM-DD HH24:MI') as "submittedAt",
        r.status,
        r.judgment_code as "judgmentCode",
        r.finding_text as "findingText",
        (
          select review_comment from reading_reviews
          where reading_id = r.id order by created_at desc limit 1
        ) as "reviewComment"
      from readings r
      join screenings s on s.id = r.screening_id
      join examinees e on e.id = s.examinee_id
      join assignments a on a.id = r.assignment_id
      join physicians p on p.id = a.physician_id
      join client_orders co on co.id = s.client_order_id
      join organizations o on o.id = co.organization_id
      where r.status in ('submitted', 'qc_completed')
      order by r.submitted_at desc
    `)
    // Map status 'qc_completed' -> 'approved' for the frontend QC system compatibility
    const mappedRows = result.rows.map((row: any) => ({
      ...row,
      status: row.status === 'qc_completed' ? 'approved' : 'pending' // Default 'submitted' maps to 'pending' QC
    }))

    return ctx.json(mappedRows)
  })

  // QC Complete: Mark reading as passed QC
  .post(
    '/:readingId/qc-complete',
    zValidator(
      'json',
      z.object({
        reviewComment: z.string().optional(),
        checklistJson: z.string().optional(),
      })
    ),
    async (ctx) => {
      const readingId = ctx.req.param('readingId')
      const { reviewComment, checklistJson } = ctx.req.valid('json')
      const user = ctx.get('user')

      const db = getDb()
      const readingRepo = new ReadingRepository(db)
      const reviewRepo = new ReadingReviewRepository(db)

      const reading = await readingRepo.findById(readingId)
      if (!reading) return ctx.json({ error: 'Reading not found' }, 404)

      // Create QC Log
      await reviewRepo.create({
        readingId,
        reviewedBy: user.id as string,
        status: 'passed',
        reviewComment,
        checklistJson,
      })

      // Update Reading Status
      await readingRepo.updateStatus(readingId, 'qc_completed')

      return ctx.json({ success: true, readingId })
    }
  )

  // QC Return: Reject reading and send back to physician
  .post(
    '/:readingId/qc-return',
    zValidator(
      'json',
      z.object({
        reviewComment: z.string().min(1, 'Review comment is required for returns.'),
        checklistJson: z.string().optional(),
      })
    ),
    async (ctx) => {
      const readingId = ctx.req.param('readingId')
      const { reviewComment, checklistJson } = ctx.req.valid('json')
      const user = ctx.get('user')

      const db = getDb()
      const readingRepo = new ReadingRepository(db)
      const reviewRepo = new ReadingReviewRepository(db)

      const reading = await readingRepo.findById(readingId)
      if (!reading) return ctx.json({ error: 'Reading not found' }, 404)

      // Create QC Log
      await reviewRepo.create({
        readingId,
        reviewedBy: user.id as string,
        status: 'returned',
        reviewComment,
        checklistJson,
      })

      // Update Reading Status back to drafting
      await readingRepo.updateStatus(readingId, 'draft')

      return ctx.json({ success: true, readingId })
    }
  )
