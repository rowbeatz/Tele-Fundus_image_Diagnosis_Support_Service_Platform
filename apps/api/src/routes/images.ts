import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { ImageService } from '../services/image-service'
import { ImageRepository } from '../repositories/image-repository'
import { pool } from '../lib/db'

const createImageMetadataSchema = z.object({
  screeningId: z.string().uuid(),
  eyeSide: z.enum(['OD', 'OS', 'UNKNOWN']),
  imageType: z.string().min(1).max(30).default('fundus_color'),
  originalFilename: z.string().min(1).max(255),
  storageKey: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png']),
  fileSizeBytes: z.number().int().positive().max(50000000),
  widthPx: z.number().int().positive().optional(),
  heightPx: z.number().int().positive().optional(),
  sha256Hash: z.string().length(64).optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

export const imageRoutes = new Hono()
const imageService = new ImageService(new ImageRepository(pool))

// MVP: dummy authentication wrapper
// imageRoutes.use('*', requireAuth)
// imageRoutes.use('*', requireRole(['client_admin', 'client_user', 'ops_reception', 'ops_coordinator', 'admin']))

imageRoutes.post('/', zValidator('json', createImageMetadataSchema), async (c) => {
  const body = c.req.valid('json')
  
  // mock user mapping
  const user = c.get('user') as { id: string } | undefined
  const createdBy = user?.id ?? '00000000-0000-0000-0000-000000000001'

  try {
    const record = await imageService.createMetadata({
      ...body,
      createdBy,
    })

    return c.json(record, 201)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Duplicate image detected')) {
      return c.json({ code: 'CONFLICT', message: err.message }, 409)
    }
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to create image metadata' }, 500)
  }
})
