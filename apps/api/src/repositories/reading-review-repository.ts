import { DbLike } from '../lib/db'

export type ReadingReviewRecord = {
  id: string
  readingId: string
  reviewedBy: string
  status: string
  checklistJson?: string | null
  reviewComment?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export type CreateReadingReviewInput = {
  readingId: string
  reviewedBy: string
  status: string
  checklistJson?: string | null
  reviewComment?: string | null
}

export class ReadingReviewRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateReadingReviewInput): Promise<ReadingReviewRecord> {
    const result = await this.db.query<ReadingReviewRecord>(
      `
      insert into reading_reviews (
        reading_id, reviewed_by, status, checklist_json, review_comment, reviewed_at
      ) values (
        $1, $2, $3, $4::jsonb, $5, now()
      ) returning
        id,
        reading_id as "readingId",
        reviewed_by as "reviewedBy",
        status,
        checklist_json::text as "checklistJson",
        review_comment as "reviewComment",
        reviewed_at as "reviewedAt",
        created_at as "createdAt"
      `,
      [
        input.readingId,
        input.reviewedBy,
        input.status,
        input.checklistJson ?? null,
        input.reviewComment ?? null,
      ]
    )
    return result.rows[0]
  }

  async findByReadingId(readingId: string): Promise<ReadingReviewRecord[]> {
    const result = await this.db.query<ReadingReviewRecord>(
      `
      select
        id,
        reading_id as "readingId",
        reviewed_by as "reviewedBy",
        status,
        checklist_json::text as "checklistJson",
        review_comment as "reviewComment",
        reviewed_at as "reviewedAt",
        created_at as "createdAt"
      from reading_reviews
      where reading_id = $1
      order by created_at desc
      `,
      [readingId]
    )
    return result.rows
  }
}
