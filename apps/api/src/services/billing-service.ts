import { DbLike } from '../lib/db'
import { InvoiceRepository } from '../repositories/invoice-repository'
import { PhysicianPaymentRepository } from '../repositories/physician-payment-repository'

export class BillingService {
  constructor(
    private readonly db: DbLike,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly paymentRepo: PhysicianPaymentRepository
  ) {}

  // Standard pricing for MVP
  private readonly PRICE_PER_READING = 800
  private readonly PAY_PER_READING = 500
  private readonly TAX_RATE = 0.1

  async calculateClientInvoices(billingMonth: string): Promise<number> {
    // 1. Get total readings completed per organization in the given month (e.g., '2026-03')
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

    // 2. Generate an invoice for each active organization
    for (const row of queryResult.rows) {
      if (row.readingCount <= 0) continue

      const baseAmount = row.readingCount * this.PRICE_PER_READING
      const taxAmount = Math.floor(baseAmount * this.TAX_RATE)
      const totalAmount = baseAmount + taxAmount

      // Check if invoice already exists
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
    // 1. Get total readings completed per physician in the given month
    const queryResult = await this.db.query<{ physicianId: string; readingCount: number }>(
      `
      select
        a.physician_id as "physicianId",
        count(r.id) as "readingCount"
      from readings r
      join assignments a on r.id = a.screening_id -- Note: MVP assumes screening=reading 1:1 for simplicity
      where
        r.status = 'qc_completed'
        and a.is_current = true
        and to_char(r.updated_at, 'YYYY-MM') = $1
      group by a.physician_id
      `,
      [paymentMonth]
    )

    let generatedCount = 0

    // 2. Generate a payment record for each physician
    for (const row of queryResult.rows) {
      if (row.readingCount <= 0) continue

      const baseAmount = row.readingCount * this.PAY_PER_READING
      const taxAmount = Math.floor(baseAmount * this.TAX_RATE)
      const totalAmount = baseAmount + taxAmount

      // Check if payment already exists
      const existing = await this.paymentRepo.findByMonthAndPhysician(paymentMonth, row.physicianId)
      if (!existing) {
        await this.paymentRepo.create({
          physicianId: row.physicianId,
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
