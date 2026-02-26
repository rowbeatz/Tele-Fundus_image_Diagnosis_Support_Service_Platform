export type SignedUploadResult = {
  objectKey: string
  uploadUrl: string
  method: 'PUT'
  headers: Record<string, string>
  expiresInSeconds: number
}

export interface ObjectStorage {
  createSignedUploadUrl(input: {
    screeningId: string
    originalFilename: string
    mimeType: string
  }): Promise<SignedUploadResult>

  getPublicOrSignedDownloadUrl(objectKey: string): Promise<string>
}
