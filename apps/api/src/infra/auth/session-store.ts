export type SessionRecord = {
  userId: string
  role: string
  issuedAt: number
  expiresAt: number
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionRecord | null>
  set(sessionId: string, value: SessionRecord): Promise<void>
  delete(sessionId: string): Promise<void>
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionRecord>()

  async get(sessionId: string): Promise<SessionRecord | null> {
    const found = this.sessions.get(sessionId) ?? null
    if (!found) return null
    if (found.expiresAt < Date.now()) {
      this.sessions.delete(sessionId)
      return null
    }
    return found
  }

  async set(sessionId: string, value: SessionRecord): Promise<void> {
    this.sessions.set(sessionId, value)
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }
}

import { DbLike } from '../../lib/db'

export class DbSessionStore implements SessionStore {
  constructor(private readonly db: DbLike) {}

  async get(sessionId: string): Promise<SessionRecord | null> {
    const res = await this.db.query(
      \`select user_id, role, issued_at, expires_at from sessions where id = $1\`,
      [sessionId]
    )
    const row = res.rows[0] as any
    if (!row) return null

    if (row.expires_at < Date.now()) {
      await this.delete(sessionId)
      return null
    }

    return {
      userId: row.user_id,
      role: row.role,
      issuedAt: Number(row.issued_at),
      expiresAt: Number(row.expires_at),
    }
  }

  async set(sessionId: string, value: SessionRecord): Promise<void> {
    await this.db.query(
      \`
      insert into sessions (id, user_id, role, issued_at, expires_at)
      values ($1, $2, $3, $4, $5)
      on conflict (id) do update set
        user_id = excluded.user_id,
        role = excluded.role,
        issued_at = excluded.issued_at,
        expires_at = excluded.expires_at
      \`,
      [sessionId, value.userId, value.role, value.issuedAt, value.expiresAt]
    )
  }

  async delete(sessionId: string): Promise<void> {
    await this.db.query(\`delete from sessions where id = $1\`, [sessionId])
  }
}
