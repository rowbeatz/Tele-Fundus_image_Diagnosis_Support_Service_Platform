import { DbLike } from '../lib/db'

export type ImageRecord = {
  id: string
  screeningId: string
  eyeSide: string
  imageType: string
  originalFilename: string
  storageKey: string
  mimeType: string
  fileSizeBytes: number
  widthPx?: number | null
  heightPx?: number | null
  sha256Hash?: string | null
  isPrimary: boolean
  sortOrder: number
  annotationsJson?: string | null
  createdBy: string
  createdAt: string
}

export type CreateImageInput = Omit<ImageRecord, 'id' | 'createdAt' | 'annotationsJson'>

export class ImageRepository {
  constructor(private readonly db: DbLike) { }

  async findByScreeningId(screeningId: string): Promise<ImageRecord[]> {
    const result = await this.db.query<ImageRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        eye_side as "eyeSide",
        image_type as "imageType",
        original_filename as "originalFilename",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size_bytes as "fileSizeBytes",
        width_px as "widthPx",
        height_px as "heightPx",
        sha256_hash as "sha256Hash",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson",
        created_by as "createdBy",
        created_at as "createdAt"
      from images
      where screening_id = $1
      order by sort_order asc, created_at asc
      `,
      [screeningId],
    )

    return result.rows
  }

  async findById(id: string): Promise<ImageRecord | null> {
    const result = await this.db.query<ImageRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        eye_side as "eyeSide",
        image_type as "imageType",
        original_filename as "originalFilename",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size_bytes as "fileSizeBytes",
        width_px as "widthPx",
        height_px as "heightPx",
        sha256_hash as "sha256Hash",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson",
        created_by as "createdBy",
        created_at as "createdAt"
      from images
      where id = $1
      limit 1
      `,
      [id]
    )
    return result.rows[0] ?? null
  }

  async findByHash(sha256Hash: string): Promise<ImageRecord | null> {
    const result = await this.db.query<ImageRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        eye_side as "eyeSide",
        image_type as "imageType",
        original_filename as "originalFilename",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size_bytes as "fileSizeBytes",
        width_px as "widthPx",
        height_px as "heightPx",
        sha256_hash as "sha256Hash",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson",
        created_by as "createdBy",
        created_at as "createdAt"
      from images where sha256_hash = $1 limit 1
      `,
      [sha256Hash]
    )
    return result.rows[0] ?? null
  }

  async create(input: CreateImageInput): Promise<ImageRecord> {
    const result = await this.db.query<ImageRecord>(
      `
      insert into images (
        screening_id, eye_side, image_type, original_filename,
        storage_key, mime_type, file_size_bytes, width_px,
        height_px, sha256_hash, is_primary, sort_order, created_by
      ) values (
        $1, $2, coalesce($3, 'fundus_color'), $4,
        $5, $6, $7, $8,
        $9, $10, coalesce($11, false), coalesce($12, 0), $13
      ) returning
        id,
        screening_id as "screeningId",
        eye_side as "eyeSide",
        image_type as "imageType",
        original_filename as "originalFilename",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size_bytes as "fileSizeBytes",
        width_px as "widthPx",
        height_px as "heightPx",
        sha256_hash as "sha256Hash",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson",
        created_by as "createdBy",
        created_at as "createdAt"
      `,
      [
        input.screeningId,
        input.eyeSide,
        input.imageType,
        input.originalFilename,
        input.storageKey,
        input.mimeType,
        input.fileSizeBytes,
        input.widthPx,
        input.heightPx,
        input.sha256Hash,
        input.isPrimary,
        input.sortOrder,
        input.createdBy,
      ]
    )

    return result.rows[0]
  }
  async updateAnnotations(id: string, annotationsJson: string | null): Promise<ImageRecord> {
    const result = await this.db.query<ImageRecord>(
      `
      update images
      set annotations_json = $2::jsonb, updated_at = now()
      where id = $1
      returning
        id,
        screening_id as "screeningId",
        eye_side as "eyeSide",
        image_type as "imageType",
        original_filename as "originalFilename",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size_bytes as "fileSizeBytes",
        width_px as "widthPx",
        height_px as "heightPx",
        sha256_hash as "sha256Hash",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson",
        created_by as "createdBy",
        created_at as "createdAt"
      `,
      [id, annotationsJson]
    )
    return result.rows[0]
  }

}
