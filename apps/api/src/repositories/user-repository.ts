import { DbLike } from '../lib/db'

export type UserRecord = {
  id: string
  organizationId?: string | null
  physicianId?: string | null
  email: string
  passwordHash: string
  fullName: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export class UserRepository {
  constructor(private readonly db: DbLike) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        physician_id as "physicianId",
        email,
        password_hash as "passwordHash",
        full_name as "fullName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from users
      where email = $1
      `,
      [email]
    )
    return result.rows[0] ?? null
  }
}
