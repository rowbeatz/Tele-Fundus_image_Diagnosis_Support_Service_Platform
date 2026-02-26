import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { pool } from '../lib/db'
import { ExamineeRepository } from '../repositories/examinee-repository'
import { ScreeningRepository } from '../repositories/screening-repository'

export const importsRouter = new Hono()

const importCsvSchema = z.object({
  clientOrderId: z.string().uuid(),
  organizationId: z.string().uuid(),
  rows: z.array(
    z.object({
      externalExamineeId: z.string().optional(),
      displayName: z.string(),
      sex: z.string().optional(),
      birthDate: z.string().optional(),
      age: z.number().int().optional(),
      screeningDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
      urgencyFlag: z.boolean().default(false),
      bloodPressureSystolic: z.number().int().min(0).max(400).optional(),
      bloodPressureDiastolic: z.number().int().min(0).max(300).optional(),
      hasDiabetes: z.boolean().optional(),
      hasHypertension: z.boolean().optional(),
      hasDyslipidemia: z.boolean().optional(),
      smokingStatus: z.string().max(50).optional(),
      questionnaireText: z.string().max(5000).optional(),
      specialNotes: z.string().max(5000).optional(),
    }),
  ).min(1).max(5000),
})

// MVP: dummy get user
// importRoutes.use('*', requireAuth)

importsRouter.post('/screenings/csv', zValidator('json', importCsvSchema), async (c) => {
  const body = c.req.valid('json')
  
  const examineeRepo = new ExamineeRepository(pool)
  const screeningRepo = new ScreeningRepository(pool)

  const items = []
  const errors = []

  let rowNumber = 1
  for (const row of body.rows) {
    try {
      let examinee = null
      
      // Attempt lookup if external ID is provided
      if (row.externalExamineeId) {
        examinee = await examineeRepo.findByExternalId(body.organizationId, row.externalExamineeId)
      }

      if (!examinee) {
        examinee = await examineeRepo.create({
          organizationId: body.organizationId,
          externalExamineeId: row.externalExamineeId,
          displayName: row.displayName || 'Unknown',
          sex: row.sex,
          birthDate: row.birthDate,
          age: row.age,
        })
      }

      const screening = await screeningRepo.create({
        clientOrderId: body.clientOrderId,
        examineeId: examinee.id,
        screeningDate: row.screeningDate,
        urgencyFlag: row.urgencyFlag,
        bloodPressureSystolic: row.bloodPressureSystolic,
        bloodPressureDiastolic: row.bloodPressureDiastolic,
        hasDiabetes: row.hasDiabetes,
        hasHypertension: row.hasHypertension,
        hasDyslipidemia: row.hasDyslipidemia,
        smokingStatus: row.smokingStatus,
        questionnaireText: row.questionnaireText,
        specialNotes: row.specialNotes,
      })

      items.push({ rowNumber, examineeId: examinee.id, screeningId: screening.id, status: 'submitted' })
    } catch (err: unknown) {
      errors.push({ rowNumber, message: err instanceof Error ? err.message : 'Unknown error' })
    }
    rowNumber++
  }

  return c.json({
    importedCount: items.length,
    items,
    errors,
  })
})
