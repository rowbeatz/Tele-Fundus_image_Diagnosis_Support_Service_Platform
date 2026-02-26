import { DbLike } from '../lib/db'

export type OrganizationRecord = {
  id: string
  code: string
  name: string
  billingName?: string | null
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type CreateOrganizationInput = Omit<OrganizationRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: string }

export class OrganizationRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    const result = await this.db.query<OrganizationRecord>(
      `
      insert into organizations (
        code, name, billing_name, contact_name, email, phone, address, status
      ) values (
        $1, $2, $3, $4, $5, $6, $7, coalesce($8, 'active')
      ) returning
        id, code, name, billing_name as "billingName", contact_name as "contactName",
        email, phone, address, status, created_at as "createdAt", updated_at as "updatedAt"
      `,
      [
        input.code, input.name, input.billingName, input.contactName, input.email, input.phone, input.address, input.status
      ]
    )
    return result.rows[0]
  }

  async findById(id: string): Promise<OrganizationRecord | null> {
    const result = await this.db.query<OrganizationRecord>(
      `
      select
        id, code, name, billing_name as "billingName", contact_name as "contactName",
        email, phone, address, status, created_at as "createdAt", updated_at as "updatedAt"
      from organizations
      where id = $1
      `,
      [id]
    )
    return result.rows[0] ?? null
  }

  async list(limit = 50, offset = 0): Promise<OrganizationRecord[]> {
    const result = await this.db.query<OrganizationRecord>(
      `
      select
        id, code, name, billing_name as "billingName", contact_name as "contactName",
        email, phone, address, status, created_at as "createdAt", updated_at as "updatedAt"
      from organizations
      order by created_at desc
      limit $1 offset $2
      `,
      [limit, offset]
    )
    return result.rows
  }
}
