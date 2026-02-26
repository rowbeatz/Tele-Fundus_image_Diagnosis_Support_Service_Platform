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

export class CommunicationRepository {
    constructor(private db: Pool) { }

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
