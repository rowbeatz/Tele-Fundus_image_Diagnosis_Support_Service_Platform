import { DbLike } from '../lib/db'

export type BillingTier = {
  maxReadings: number | null // null means unlimited/rest of readings
  price: number
}

export type BillingPlanRecord = {
  id: string
  organizationId?: string | null
  name: string
  basePrice: number
  volumeTiersJson?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateBillingPlanInput = Omit<BillingPlanRecord, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }

export class BillingPlanRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateBillingPlanInput): Promise<BillingPlanRecord> {
    const result = await this.db.query<BillingPlanRecord>(
      `
      insert into billing_plans (
        organization_id, name, base_price, volume_tiers_json, is_active
      ) values (
        $1, $2, $3, $4::jsonb, coalesce($5, true)
      ) returning
        id, organization_id as "organizationId", name, base_price as "basePrice",
        volume_tiers_json::text as "volumeTiersJson", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      `,
      [
        input.organizationId ?? null,
        input.name,
        input.basePrice,
        input.volumeTiersJson ?? null,
        input.isActive,
      ]
    )
    return result.rows[0]
  }

  async findByOrganizationId(organizationId: string): Promise<BillingPlanRecord | null> {
    const result = await this.db.query<BillingPlanRecord>(
      `
      select
        id, organization_id as "organizationId", name, base_price as "basePrice",
        volume_tiers_json::text as "volumeTiersJson", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      from billing_plans
      where organization_id = $1 and is_active = true
      order by created_at desc
      limit 1
      `,
      [organizationId]
    )
    return result.rows[0] ?? null
  }
  
  async findGlobalDefault(): Promise<BillingPlanRecord | null> {
    const result = await this.db.query<BillingPlanRecord>(
      `
      select
        id, organization_id as "organizationId", name, base_price as "basePrice",
        volume_tiers_json::text as "volumeTiersJson", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      from billing_plans
      where organization_id is null and is_active = true
      order by created_at desc
      limit 1
      `
    )
    return result.rows[0] ?? null
  }
}
