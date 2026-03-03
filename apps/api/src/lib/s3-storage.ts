import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'node:crypto'
import type { ObjectStorage, SignedUploadResult } from './storage'

export class S3CompatibleStorageService implements ObjectStorage {
  private readonly client: S3Client

  constructor(
    regionOrBucket: string,
    bucketNameOrEndpoint?: string,
    endpointUrl?: string,
  ) {
    // Support both (bucketName, endpoint?) and (region, bucketName, endpoint?) signatures
    const hasThreeArgs = endpointUrl !== undefined || (bucketNameOrEndpoint && !bucketNameOrEndpoint.startsWith('http'))
    const bucketName = hasThreeArgs ? (bucketNameOrEndpoint || regionOrBucket) : regionOrBucket
    const endpoint = hasThreeArgs ? endpointUrl : bucketNameOrEndpoint

    this.client = new S3Client({
      region: hasThreeArgs ? regionOrBucket : (process.env.AWS_REGION || 'us-east-1'),
      endpoint: endpoint || process.env.S3_ENDPOINT,
      forcePathStyle: true,
    })
    this._bucketName = bucketName
  }

  private readonly _bucketName: string

  async createSignedUploadUrl(input: {
    screeningId: string
    originalFilename: string
    mimeType: string
  }): Promise<SignedUploadResult> {
    const objectKey = `screenings/${input.screeningId}/${crypto.randomUUID()}-${input.originalFilename}`

    const command = new PutObjectCommand({
      Bucket: this._bucketName,
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
    return this.generatePresignedGetUrl(objectKey, 3600)
  }

  /**
   * Generate a presigned GET URL for the given object key.
   * For demo images (keys starting with 'demo/'), returns a local path
   * so they can be served as static assets without S3.
   */
  async generatePresignedGetUrl(objectKey: string, _expiresIn?: number): Promise<string> {
    // Demo images are served from the web app's public folder
    if (objectKey.startsWith('demo/')) {
      return `/${objectKey}`
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this._bucketName,
        Key: objectKey,
      })
      return await getSignedUrl(this.client, command, { expiresIn: _expiresIn || 3600 })
    } catch {
      // If S3 fails, return the key as a relative path
      return `/${objectKey}`
    }
  }
}
