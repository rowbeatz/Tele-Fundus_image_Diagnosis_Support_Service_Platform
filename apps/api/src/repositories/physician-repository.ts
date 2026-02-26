import { DbLike } from '../lib/db'

export type PhysicianRecord = {
  id: string
  code: string
  name: string
  email?: string | null
  specialty?: string | null
  maxDailyCases?: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export type CreatePhysicianInput = Omit<PhysicianRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: string }

export class PhysicianRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreatePhysicianInput): Promise<PhysicianRecord> {
    const result = await this.db.query<PhysicianRecord>(
      `
      insert into physicians (
        code, name, email, specialty, max_daily_cases, status
      ) values (
        $1, $2, $3, $4, $5, coalesce($6, 'active')
      ) returning
        id, code, name, email, specialty, max_daily_cases as "maxDailyCases", status,
        created_at as "createdAt", updated_at as "updatedAt"
      `,
      [
        input.code, input.name, input.email, input.specialty, input.maxDailyCases, input.status
      ]
    )
    return result.rows[0]
  }

  async findById(id: string): Promise<PhysicianRecord | null> {
    const result = await this.db.query<PhysicianRecord>(
      `
      select
        id, code, name, email, specialty, max_daily_cases as "maxDailyCases", status,
        created_at as "createdAt", updated_at as "updatedAt"
      from physicians
      where id = $1
      `,
      [id]
    )
    return result.rows[0] ?? null
  }

  async list(limit = 50, offset = 0): Promise<PhysicianRecord[]> {
    const result = await this.db.query<PhysicianRecord>(
      `
      select
        id, code, name, email, specialty, max_daily_cases as "maxDailyCases", status,
        created_at as "createdAt", updated_at as "updatedAt"
      from physicians
      order by created_at desc
      limit $1 offset $2
      `,
      [limit, offset]
    )
    return result.rows
  }
}
