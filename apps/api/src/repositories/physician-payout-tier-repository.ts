import { DbLike } from '../lib/db'

export type PhysicianPayoutTierRecord = {
  id: string
  physicianId?: string | null
  baseRate: number
  urgentRateModifier: number
  penaltyRateModifier: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreatePhysicianPayoutTierInput = Omit<PhysicianPayoutTierRecord, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }

export class PhysicianPayoutTierRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreatePhysicianPayoutTierInput): Promise<PhysicianPayoutTierRecord> {
    const result = await this.db.query<PhysicianPayoutTierRecord>(
      `
      insert into physician_payout_tiers (
        physician_id, base_rate, urgent_rate_modifier, penalty_rate_modifier, is_active
      ) values (
        $1, $2, coalesce($3, 0), coalesce($4, 0), coalesce($5, true)
      ) returning
        id, physician_id as "physicianId", base_rate as "baseRate",
        urgent_rate_modifier as "urgentRateModifier", penalty_rate_modifier as "penaltyRateModifier",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      `,
      [
        input.physicianId ?? null,
        input.baseRate,
        input.urgentRateModifier,
        input.penaltyRateModifier,
        input.isActive,
      ]
    )
    return result.rows[0]
  }

  async findByPhysicianId(physicianId: string): Promise<PhysicianPayoutTierRecord | null> {
    const result = await this.db.query<PhysicianPayoutTierRecord>(
      `
      select
        id, physician_id as "physicianId", base_rate as "baseRate",
        urgent_rate_modifier as "urgentRateModifier", penalty_rate_modifier as "penaltyRateModifier",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      from physician_payout_tiers
      where physician_id = $1 and is_active = true
      order by created_at desc
      limit 1
      `,
      [physicianId]
    )
    return result.rows[0] ?? null
  }

  async findGlobalDefault(): Promise<PhysicianPayoutTierRecord | null> {
    const result = await this.db.query<PhysicianPayoutTierRecord>(
      `
      select
        id, physician_id as "physicianId", base_rate as "baseRate",
        urgent_rate_modifier as "urgentRateModifier", penalty_rate_modifier as "penaltyRateModifier",
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      from physician_payout_tiers
      where physician_id is null and is_active = true
      order by created_at desc
      limit 1
      `
    )
    return result.rows[0] ?? null
  }
}
