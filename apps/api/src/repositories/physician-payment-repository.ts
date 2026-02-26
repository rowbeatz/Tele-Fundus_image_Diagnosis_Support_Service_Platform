import { DbLike } from '../lib/db'

export type PhysicianPaymentRecord = {
  id: string
  physicianId: string
  paymentMonth: string
  baseAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
}

export type CreatePhysicianPaymentInput = Omit<PhysicianPaymentRecord, 'id' | 'createdAt' | 'updatedAt'>

export class PhysicianPaymentRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreatePhysicianPaymentInput): Promise<PhysicianPaymentRecord> {
    const result = await this.db.query<PhysicianPaymentRecord>(
      `
      insert into physician_payments (
        physician_id, payment_month, base_amount, tax_amount, total_amount, status
      ) values (
        $1, $2, $3, $4, $5, $6
      ) returning
        id,
        physician_id as "physicianId",
        payment_month as "paymentMonth",
        base_amount as "baseAmount",
        tax_amount as "taxAmount",
        total_amount as "totalAmount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.physicianId,
        input.paymentMonth,
        input.baseAmount,
        input.taxAmount,
        input.totalAmount,
        input.status,
      ]
    )
    return result.rows[0]
  }

  async findByMonthAndPhysician(paymentMonth: string, physicianId: string): Promise<PhysicianPaymentRecord | null> {
    const result = await this.db.query<PhysicianPaymentRecord>(
      `
      select
        id,
        physician_id as "physicianId",
        payment_month as "paymentMonth",
        base_amount as "baseAmount",
        tax_amount as "taxAmount",
        total_amount as "totalAmount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from physician_payments
      where payment_month = $1 and physician_id = $2
      `,
      [paymentMonth, physicianId]
    )
    return result.rows[0] ?? null
  }
}
