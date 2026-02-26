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
