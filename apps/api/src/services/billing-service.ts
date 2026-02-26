import { DbLike } from '../lib/db'
import { InvoiceRepository } from '../repositories/invoice-repository'
import { PhysicianPaymentRepository } from '../repositories/physician-payment-repository'
import { BillingPlanRepository, BillingTier } from '../repositories/billing-plan-repository'
import { PhysicianPayoutTierRepository } from '../repositories/physician-payout-tier-repository'

export class BillingService {
  constructor(
    private readonly db: DbLike,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly paymentRepo: PhysicianPaymentRepository,
    private readonly billingPlanRepo: BillingPlanRepository,
    private readonly payoutTierRepo: PhysicianPayoutTierRepository
  ) {}

  private readonly TAX_RATE = 0.1

  async calculateClientInvoices(billingMonth: string): Promise<number> {
    const queryResult = await this.db.query<{ organizationId: string; readingCount: number }>(
      `
      select
        co.organization_id as "organizationId",
        count(r.id) as "readingCount"
      from readings r
      join client_orders co on r.order_id = co.id
      where
        r.status = 'qc_completed'
        and to_char(r.updated_at, 'YYYY-MM') = $1
      group by co.organization_id
      `,
      [billingMonth]
    )

    let generatedCount = 0

    for (const row of queryResult.rows) {
      if (row.readingCount <= 0) continue

      // 1. Resolve Billing Plan (Org specific or global default)
      let plan = await this.billingPlanRepo.findByOrganizationId(row.organizationId)
      if (!plan) {
        plan = await this.billingPlanRepo.findGlobalDefault()
      }

      if (!plan) throw new Error('No active billing plan available for org: ' + row.organizationId)

      const volumeTiers: BillingTier[] | null = plan.volumeTiersJson ? JSON.parse(plan.volumeTiersJson) : null

      // 2. Calculate Base Amount using cascading volume discount or flat rate
      let baseAmount = 0
      if (volumeTiers && volumeTiers.length > 0) {
        let remainingReadings = row.readingCount
        // Ensure tiers are sorted by maxReadings ascending for correct evaluation
        const sortedTiers = volumeTiers.sort((a, b) => {
          if (a.maxReadings === null) return 1
          if (b.maxReadings === null) return -1
          return a.maxReadings - b.maxReadings
        })

        let previousTierMax = 0
        for (const tier of sortedTiers) {
          if (remainingReadings <= 0) break
          
          const maxForThisTier = tier.maxReadings !== null ? tier.maxReadings - previousTierMax : Infinity
          const readingsInThisTier = Math.min(remainingReadings, maxForThisTier)
          
          baseAmount += readingsInThisTier * tier.price
          remainingReadings -= readingsInThisTier
          if (tier.maxReadings !== null) previousTierMax = tier.maxReadings
        }
      } else {
        baseAmount = row.readingCount * plan.basePrice
      }

      const taxAmount = Math.floor(baseAmount * this.TAX_RATE)
      const totalAmount = baseAmount + taxAmount

      // 3. Create invoice if not exists
      const existing = await this.invoiceRepo.findByMonthAndOrg(billingMonth, row.organizationId)
      if (!existing) {
        await this.invoiceRepo.create({
          organizationId: row.organizationId,
          billingMonth,
          baseAmount,
          taxAmount,
          totalAmount,
          status: 'draft',
        })
        generatedCount++
      }
    }

    return generatedCount
  }

  async calculatePhysicianPayments(paymentMonth: string): Promise<number> {
    // 1. Get detailed readings per physician to apply modifiers
    const queryResult = await this.db.query<{ physicianId: string; readingId: string; isUrgent: boolean; isPenalized: boolean }>(
      `
      select
        a.physician_id as "physicianId",
        r.id as "readingId",
        s.urgency_flag as "isUrgent",
        -- Quick determination if this reading had any returns/rejects making it penalized
        exists(select 1 from reading_reviews rr where rr.reading_id = r.id and rr.status = 'returned') as "isPenalized"
      from readings r
      join assignments a on r.id = a.screening_id
      join screenings s on r.order_id = s.client_order_id and a.screening_id = s.id
      where
        r.status = 'qc_completed'
        and a.is_current = true
        and to_char(r.updated_at, 'YYYY-MM') = $1
      `,
      [paymentMonth]
    )

    // Group by physician
    const physicianData = new Map<string, typeof queryResult.rows>()
    for (const row of queryResult.rows) {
      if (!physicianData.has(row.physicianId)) physicianData.set(row.physicianId, [])
      physicianData.get(row.physicianId)!.push(row)
    }

    let generatedCount = 0

    // 2. Generate a payment record evaluating tiers and specific modifiers
    for (const [physicianId, readings] of physicianData.entries()) {
      if (readings.length === 0) continue

      let tier = await this.payoutTierRepo.findByPhysicianId(physicianId)
      if (!tier) {
        tier = await this.payoutTierRepo.findGlobalDefault()
      }

      if (!tier) throw new Error('No active payout tier available for physician: ' + physicianId)

      let baseAmount = 0
      for (const reading of readings) {
        let priceForReading = tier.baseRate
        if (reading.isUrgent) {
          priceForReading += tier.urgentRateModifier
        }
        if (reading.isPenalized) {
          priceForReading += tier.penaltyRateModifier // penalty is typically negative
        }
        // ensure it doesn't drop below 0
        baseAmount += Math.max(0, priceForReading)
      }

      const taxAmount = Math.floor(baseAmount * this.TAX_RATE)
      const totalAmount = baseAmount + taxAmount

      // Check if payment already exists
      const existing = await this.paymentRepo.findByMonthAndPhysician(paymentMonth, physicianId)
      if (!existing) {
        await this.paymentRepo.create({
          physicianId,
          paymentMonth,
          baseAmount,
          taxAmount,
          totalAmount,
          status: 'pending',
        })
        generatedCount++
      }
    }

    return generatedCount
  }
}

