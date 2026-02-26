import { ImageRepository } from '../repositories/image-repository'

export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async createMetadata(input: {
    screeningId: string
    eyeSide: 'OD' | 'OS' | 'UNKNOWN'
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
    createdBy: string
  }) {
    if (input.sha256Hash) {
      const duplicate = await this.imageRepository.findByHash(input.sha256Hash)
      if (duplicate) {
        throw new Error('Duplicate image detected by sha256 hash')
      }
    }

    return this.imageRepository.create({
      screeningId: input.screeningId,
      eyeSide: input.eyeSide,
      imageType: input.imageType,
      originalFilename: input.originalFilename,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      widthPx: input.widthPx ?? null,
      heightPx: input.heightPx ?? null,
      sha256Hash: input.sha256Hash ?? null,
      isPrimary: input.isPrimary,
      sortOrder: input.sortOrder,
      createdBy: input.createdBy,
    })
  }
}
