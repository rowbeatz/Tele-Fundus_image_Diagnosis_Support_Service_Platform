import { DbLike } from '../lib/db'

export type UserRecord = {
  id: string
  organizationId?: string | null
  physicianId?: string | null
  email: string
  passwordHash: string
  fullName: string
  role: string
  adminLevel: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export class UserRepository {
  constructor(private readonly db: DbLike) { }

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
        coalesce(admin_level, 'standard') as "adminLevel",
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
  async create(input: {
    organizationId?: string | null
    physicianId?: string | null
    email: string
    passwordHash: string
    fullName: string
    role: string
    isActive?: boolean
  }): Promise<UserRecord> {
    const result = await this.db.query<UserRecord>(
      `
      insert into users (
        organization_id, physician_id, email, password_hash, full_name, role, is_active
      ) values (
        $1, $2, $3, $4, $5, $6, coalesce($7, true)
      ) returning
        id,
        organization_id as "organizationId",
        physician_id as "physicianId",
        email,
        password_hash as "passwordHash",
        full_name as "fullName",
        role,
        coalesce(admin_level, 'standard') as "adminLevel",
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.organizationId ?? null,
        input.physicianId ?? null,
        input.email,
        input.passwordHash,
        input.fullName,
        input.role,
        input.isActive,
      ]
    )
    return result.rows[0]
  }

  async list(limit = 50, offset = 0): Promise<UserRecord[]> {
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
      order by created_at desc
      limit $1 offset $2
      `,
      [limit, offset]
    )
    return result.rows
  }

  async getUserPermissions(userId: string, role: string): Promise<string[]> {
    // Get permissions from role
    const rolePerms = await this.db.query<{ key: string }>(
      `
      SELECT p.key
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      JOIN roles r ON r.id = rp.role_id
      WHERE r.name = $1
      `,
      [role]
    )

    const permSet = new Set(rolePerms.rows.map(r => r.key))

    // Apply user-level overrides
    const overrides = await this.db.query<{ key: string; effect: string }>(
      `
      SELECT p.key, up.effect
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = $1
      `,
      [userId]
    )

    for (const o of overrides.rows) {
      if (o.effect === 'grant') permSet.add(o.key)
      else if (o.effect === 'deny') permSet.delete(o.key)
    }

    return Array.from(permSet)
  }
}
