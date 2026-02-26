import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'node:crypto'
import type { ObjectStorage, SignedUploadResult } from './storage'

export class S3CompatibleStorageService implements ObjectStorage {
  private readonly client: S3Client

  constructor(
    private readonly bucketName: string,
    private readonly endpointBaseUrl?: string,
  ) {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT, // Optional for custom S3 like MinIO/R2
      forcePathStyle: true,
    })
  }

  async createSignedUploadUrl(input: {
    screeningId: string
    originalFilename: string
    mimeType: string
  }): Promise<SignedUploadResult> {
    const objectKey = `screenings/${input.screeningId}/${crypto.randomUUID()}-${input.originalFilename}`

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: input.mimeType,
    })

    const expiresInSeconds = 300
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds })

    return {
      objectKey,
      uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': input.mimeType,
      },
      expiresInSeconds,
    }
  }

  async getPublicOrSignedDownloadUrl(objectKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    })

    // Optionally return public URL if bucket is public,
    // here we return a signed url for reading.
    return getSignedUrl(this.client, command, { expiresIn: 3600 })
  }
}
