import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { ImageRepository } from '../repositories/image-repository'
import { ScreeningRepository } from '../repositories/screening-repository'
import { S3CompatibleStorageService } from '../lib/s3-storage'

export const createViewerRoutes = (bucketName: string, endpoint?: string) => {
  const router = new Hono().use('*', requireAuth)

  // Dependency inj
  const storageService = new S3CompatibleStorageService(
    process.env.AWS_REGION || 'ap-northeast-1',
    bucketName,
    endpoint
  )

  // 1. Get high-speed access to a specific image
  router.get('/:imageId/signed-url', async (ctx) => {
    const imageId = ctx.req.param('imageId')
    const db = getDb()
    const imageRepo = new ImageRepository(db)

    const image = await imageRepo.findById(imageId)
    if (!image) {
      return ctx.json({ error: 'Image not found' }, 404)
    }

    // Generate a GET presigned URL valid for 1 hour
    const url = await storageService.generatePresignedGetUrl(image.storageKey, 3600)
    
    return ctx.json({
      success: true,
      url,
      mimeType: image.mimeType,
      annotationsJson: image.annotationsJson ? JSON.parse(image.annotationsJson) : null
    })
  })

  // 2. Save Annotations back to the Image
  router.put(
    '/:imageId/annotations',
    zValidator(
      'json',
      z.object({
        annotationsJson: z.string() // stringified JSON array of markings
      })
    ),
    async (ctx) => {
      const imageId = ctx.req.param('imageId')
      const { annotationsJson } = ctx.req.valid('json')
      const db = getDb()
      const imageRepo = new ImageRepository(db)

      const image = await imageRepo.findById(imageId)
      if (!image) {
        return ctx.json({ error: 'Image not found' }, 404)
      }

      await imageRepo.updateAnnotations(imageId, annotationsJson)

      return ctx.json({ success: true, message: 'Annotations saved.' })
    }
  )

  // 3. Fetch Examinee's History for Two-up (Past Comparison) Viewer Mode
  router.get('/examinees/:examineeId/history', async (ctx) => {
    const examineeId = ctx.req.param('examineeId')
    const db = getDb()

    // Query to find all past completed screenings for this examinee
    const result = await db.query<{
      screeningId: string
      screeningDate: string
      imageId: string
      eyeSide: string
      storageKey: string
    }>(
      `
      select
        s.id as "screeningId",
        to_char(s.screening_date, 'YYYY-MM-DD') as "screeningDate",
        i.id as "imageId",
        i.eye_side as "eyeSide",
        i.storage_key as "storageKey"
      from screenings s
      join images i on s.id = i.screening_id
      where s.examinee_id = $1 and s.status in ('qc_completed', 'submitted', 'reading_assigned')
      order by s.screening_date desc
      `,
      [examineeId]
    )

    // Group by screening
    const history = []
    const mapped = new Map<string, any>()

    for (const row of result.rows) {
      if (!mapped.has(row.screeningId)) {
        const entry = {
          screeningId: row.screeningId,
          screeningDate: row.screeningDate,
          images: [] as any[]
        }
        mapped.set(row.screeningId, entry)
        history.push(entry)
      }

      // Generate fast URLs for thumbnails/past views
      const url = await storageService.generatePresignedGetUrl(row.storageKey, 3600)
      mapped.get(row.screeningId).images.push({
        imageId: row.imageId,
        eyeSide: row.eyeSide,
        url
      })
    }

    return ctx.json({ success: true, history })
  })

  return router
}
