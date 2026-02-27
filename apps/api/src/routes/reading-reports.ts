import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { ReadingReportRepository } from '../repositories/reading-report-repository'
import { ReadingRepository } from '../repositories/reading-repository'

type AuthUser = { id: string; role: string; physicianId?: string; email?: string; fullName?: string }

export const readingReportsRoutes = new Hono()
    .use('*', requireAuth)

    // Get report for a reading
    .get('/:readingId', async (ctx) => {
        const readingId = ctx.req.param('readingId')
        const db = getDb()
        const repo = new ReadingReportRepository(db)

        const report = await repo.findByReadingId(readingId)
        return ctx.json({ success: true, report })
    })

    // Create or update a report (save draft)
    .put(
        '/:readingId',
        zValidator(
            'json',
            z.object({
                screeningId: z.string(),
                findingsRightJson: z.string().optional(),
                findingsLeftJson: z.string().optional(),
                judgmentCode: z.string().optional(),
                judgmentLabel: z.string().optional(),
                referralRequired: z.boolean().optional(),
                referralDestination: z.string().optional(),
                referralReason: z.string().optional(),
                reportText: z.string().optional(),
                templateId: z.string().optional(),
            })
        ),
        async (ctx) => {
            const readingId = ctx.req.param('readingId')
            const body = ctx.req.valid('json')
            const user = ctx.get('user') as AuthUser
            const db = getDb()
            const repo = new ReadingReportRepository(db)

            // Check if report already exists
            const existing = await repo.findByReadingId(readingId)

            let report
            if (existing) {
                // Update existing
                report = await repo.update(existing.id, {
                    findingsRightJson: body.findingsRightJson,
                    findingsLeftJson: body.findingsLeftJson,
                    judgmentCode: body.judgmentCode,
                    judgmentLabel: body.judgmentLabel,
                    referralRequired: body.referralRequired,
                    referralDestination: body.referralDestination,
                    referralReason: body.referralReason,
                    reportText: body.reportText,
                    templateId: body.templateId,
                })
            } else {
                // Create new
                report = await repo.create({
                    readingId,
                    screeningId: body.screeningId,
                    physicianId: user.physicianId || user.id,
                    findingsRightJson: body.findingsRightJson,
                    findingsLeftJson: body.findingsLeftJson,
                    judgmentCode: body.judgmentCode,
                    judgmentLabel: body.judgmentLabel,
                    referralRequired: body.referralRequired,
                    referralDestination: body.referralDestination,
                    referralReason: body.referralReason,
                    reportText: body.reportText,
                    templateId: body.templateId,
                })
            }

            return ctx.json({ success: true, report })
        }
    )

    // Submit report (finalize)
    .post(
        '/:readingId/submit',
        zValidator(
            'json',
            z.object({
                screeningId: z.string(),
                findingsRightJson: z.string().optional(),
                findingsLeftJson: z.string().optional(),
                judgmentCode: z.string().min(1, 'Judgment code is required'),
                judgmentLabel: z.string().optional(),
                referralRequired: z.boolean().optional(),
                reportText: z.string().optional(),
            })
        ),
        async (ctx) => {
            const readingId = ctx.req.param('readingId')
            const body = ctx.req.valid('json')
            const user = ctx.get('user') as AuthUser
            const db = getDb()
            const reportRepo = new ReadingReportRepository(db)
            const readingRepo = new ReadingRepository(db)

            // Create or update report
            let report = await reportRepo.findByReadingId(readingId)
            if (report) {
                report = await reportRepo.update(report.id, {
                    findingsRightJson: body.findingsRightJson,
                    findingsLeftJson: body.findingsLeftJson,
                    judgmentCode: body.judgmentCode,
                    judgmentLabel: body.judgmentLabel,
                    referralRequired: body.referralRequired,
                    reportText: body.reportText,
                    status: 'submitted',
                })
            } else {
                report = await reportRepo.create({
                    readingId,
                    screeningId: body.screeningId,
                    physicianId: user.physicianId || user.id,
                    findingsRightJson: body.findingsRightJson,
                    findingsLeftJson: body.findingsLeftJson,
                    judgmentCode: body.judgmentCode,
                    judgmentLabel: body.judgmentLabel,
                    referralRequired: body.referralRequired,
                    reportText: body.reportText,
                })
                report = await reportRepo.update(report.id, { status: 'submitted' })
            }

            // Also update reading status
            await readingRepo.submit(readingId)

            return ctx.json({ success: true, report })
        }
    )
