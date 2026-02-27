import { DbLike } from '../lib/db'

export type CaseDiscussionRecord = {
    id: string
    screeningId: string
    userId: string
    message: string
    createdAt: string
    // Joined fields
    userName?: string
    userRole?: string
}

export type CreateCaseDiscussionInput = {
    screeningId: string
    userId: string
    message: string
}

export class CaseDiscussionRepository {
    constructor(private readonly db: DbLike) { }

    async create(input: CreateCaseDiscussionInput): Promise<CaseDiscussionRecord> {
        const result = await this.db.query<CaseDiscussionRecord>(
            `
      INSERT INTO case_discussions (screening_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        screening_id as "screeningId",
        user_id as "userId",
        message,
        created_at as "createdAt"
      `,
            [input.screeningId, input.userId, input.message]
        )
        return result.rows[0]
    }

    async listByScreening(screeningId: string, limit = 100, offset = 0): Promise<CaseDiscussionRecord[]> {
        const result = await this.db.query<CaseDiscussionRecord>(
            `
      SELECT
        cd.id,
        cd.screening_id as "screeningId",
        cd.user_id as "userId",
        cd.message,
        cd.created_at as "createdAt",
        u.full_name as "userName",
        u.role as "userRole"
      FROM case_discussions cd
      JOIN users u ON cd.user_id = u.id
      WHERE cd.screening_id = $1
      ORDER BY cd.created_at ASC
      LIMIT $2 OFFSET $3
      `,
            [screeningId, limit, offset]
        )
        return result.rows
    }

    async delete(id: string): Promise<void> {
        await this.db.query('DELETE FROM case_discussions WHERE id = $1', [id])
    }

    async countByScreening(screeningId: string): Promise<number> {
        const result = await this.db.query<{ count: string }>(
            'SELECT COUNT(*)::text as count FROM case_discussions WHERE screening_id = $1',
            [screeningId]
        )
        return parseInt(result.rows[0]?.count || '0', 10)
    }
}
