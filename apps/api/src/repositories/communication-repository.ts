import { Pool } from 'pg'

export interface MessageRecord {
    id: string
    thread_id: string
    sender_id: string
    content_text?: string
    audio_file_url?: string
    audio_transcription?: string
    viewer_annotation_json?: any
    is_deleted: boolean
    created_at: Date
}

export interface ThreadRecord {
    id: string
    screening_id: string
    title: string
    status: string
    created_at: Date
}

export interface ThreadParticipantRecord {
    thread_id: string
    user_id: string
}

export class CommunicationRepository {
    constructor(private db: Pool) { }


    async getThreadById(threadId: string): Promise<ThreadRecord | null> {
        const result = await this.db.query(
            'SELECT * FROM communication_threads WHERE id = $1 LIMIT 1',
            [threadId]
        )
        return (result.rows[0] as ThreadRecord) || null
    }

    async isThreadParticipant(threadId: string, userId: string): Promise<boolean> {
        const result = await this.db.query(
            `SELECT 1 FROM thread_participants WHERE thread_id = $1 AND user_id = $2 LIMIT 1`,
            [threadId, userId]
        )
        return (result.rowCount || 0) > 0
    }

    async canAccessScreeningThread(screeningId: string, userId: string): Promise<boolean> {
        const result = await this.db.query(
            `
            SELECT 1
            FROM screenings s
            JOIN client_orders co ON s.client_order_id = co.id
            LEFT JOIN assignments a ON a.screening_id = s.id AND a.is_current = true
            JOIN users u ON u.id = $2
            WHERE s.id = $1
              AND (
                  u.role IN ('admin', 'operator')
                  OR (u.role = 'client' AND u.organization_id = co.organization_id)
                  OR (u.role = 'physician' AND u.physician_id = a.physician_id)
              )
            LIMIT 1
            `,
            [screeningId, userId]
        )

        return (result.rowCount || 0) > 0
    }

    async getOrCreateThread(screeningId: string, title?: string): Promise<ThreadRecord> {
        const existing = await this.db.query('SELECT * FROM communication_threads WHERE screening_id = $1 LIMIT 1', [screeningId])
        if (existing.rowCount && existing.rowCount > 0 && existing.rows[0]) {
            return existing.rows[0] as ThreadRecord
        }

        // Create new
        const inserted = await this.db.query(
            `INSERT INTO communication_threads (screening_id, title) VALUES ($1, $2) RETURNING *`,
            [screeningId, title || `Thread for Screening ${screeningId}`]
        )
        return inserted.rows[0] as ThreadRecord
    }

    async getMessages(threadId: string): Promise<MessageRecord[]> {
        const res = await this.db.query(
            `SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC`,
            [threadId]
        )
        return res.rows as MessageRecord[]
    }

    async createMessage(input: {
        threadId: string
        senderId: string
        contentText?: string
        audioFileUrl?: string
        audioTranscription?: string
        viewerAnnotationJson?: any
    }): Promise<MessageRecord> {
        const res = await this.db.query(
            `INSERT INTO messages (thread_id, sender_id, content_text, audio_file_url, audio_transcription, viewer_annotation_json)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                input.threadId,
                input.senderId,
                input.contentText,
                input.audioFileUrl,
                input.audioTranscription,
                input.viewerAnnotationJson
            ]
        )
        return res.rows[0] as MessageRecord
    }

    async joinThread(threadId: string, userId: string): Promise<void> {
        await this.db.query(
            `INSERT INTO thread_participants (thread_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [threadId, userId]
        )
    }
}
