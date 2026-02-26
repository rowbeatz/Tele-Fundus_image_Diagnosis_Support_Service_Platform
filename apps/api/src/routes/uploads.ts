import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { S3CompatibleStorageService } from '../lib/s3-storage'
import { ImageRepository } from '../repositories/image-repository'
import { pool } from '../lib/db'

const createUploadSchema = z.object({
  screeningId: z.string().uuid(),
  originalFilename: z.string().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png']),
  fileSizeBytes: z.number().int().positive().max(50000000),
  sha256Hash: z.string().length(64).optional(),
})

export function createUploadsRouter(bucketName: string, endpointBaseUrl?: string) {
  const uploadRoutes = new Hono()
  const storage = new S3CompatibleStorageService(bucketName, endpointBaseUrl)
  const imageRepo = new ImageRepository(pool)

  // NOTE: In MVP, use a dummy requireAuth middleware or leave it open if not implemented globally yet
  // uploadRoutes.use('*', requireAuth)

  uploadRoutes.post('/signed-url', zValidator('json', createUploadSchema), async (c) => {
    const body = c.req.valid('json')

    // Task 6: Duplicate image check
    if (body.sha256Hash) {
      const existing = await imageRepo.findByHash(body.sha256Hash)
      if (existing) {
        return c.json({ code: 'CONFLICT', message: 'Image already exists' }, 409)
      }
    }

    const signed = await storage.createSignedUploadUrl({
      screeningId: body.screeningId,
      originalFilename: body.originalFilename,
      mimeType: body.mimeType,
    })

    return c.json(signed)
  })

  return uploadRoutes
}
