import { DbLike } from '../lib/db'
import { generateResetToken, hashResetToken, buildResetExpiry } from '../lib/reset-token'

export type PasswordResetTokenRecord = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  usedAt?: string | null
  createdAt: string
}

export class PasswordResetRepository {
  constructor(private readonly db: DbLike) {}

  async createToken(userId: string): Promise<string> {
    const rawToken = generateResetToken()
    const tokenHash = hashResetToken(rawToken)
    const expiresAt = buildResetExpiry(2)

    await this.db.query(
      `
      insert into password_reset_tokens (user_id, token_hash, expires_at)
      values ($1, $2, $3)
      `,
      [userId, tokenHash, expiresAt]
    )

    return rawToken
  }

  async verifyAndUseToken(rawToken: string): Promise<string | null> {
    const tokenHash = hashResetToken(rawToken)


    const result = await this.db.query<{ user_id: string }>(
      `
      update password_reset_tokens
      set used_at = now()
      where token_hash = $1
        and expires_at > now()
        and used_at is null
      returning user_id
      `,
      [tokenHash]
    )

    return result.rows[0]?.user_id ?? null
  }
}
