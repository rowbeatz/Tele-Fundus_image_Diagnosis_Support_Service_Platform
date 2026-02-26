import { DbLike } from '../lib/db'

export type InvoiceRecord = {
  id: string
  organizationId: string
  billingMonth: string
  baseAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  invoiceFilePath?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateInvoiceInput = Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt'>

export class InvoiceRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateInvoiceInput): Promise<InvoiceRecord> {
    const result = await this.db.query<InvoiceRecord>(
      `
      insert into invoices (
        organization_id, billing_month, base_amount, tax_amount, total_amount, status, invoice_file_path
      ) values (
        $1, $2, $3, $4, $5, $6, $7
      ) returning
        id,
        organization_id as "organizationId",
        billing_month as "billingMonth",
        base_amount as "baseAmount",
        tax_amount as "taxAmount",
        total_amount as "totalAmount",
        status,
        invoice_file_path as "invoiceFilePath",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.organizationId,
        input.billingMonth,
        input.baseAmount,
        input.taxAmount,
        input.totalAmount,
        input.status,
        input.invoiceFilePath ?? null,
      ]
    )
    return result.rows[0]
  }

  async findByMonthAndOrg(billingMonth: string, organizationId: string): Promise<InvoiceRecord | null> {
    const result = await this.db.query<InvoiceRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        billing_month as "billingMonth",
        base_amount as "baseAmount",
        tax_amount as "taxAmount",
        total_amount as "totalAmount",
        status,
        invoice_file_path as "invoiceFilePath",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from invoices
      where billing_month = $1 and organization_id = $2
      `,
      [billingMonth, organizationId]
    )
    return result.rows[0] ?? null
  }
}
