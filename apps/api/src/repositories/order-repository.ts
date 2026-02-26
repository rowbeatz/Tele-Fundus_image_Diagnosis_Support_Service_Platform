import { DbLike } from '../lib/db'

export type ClientOrderRecord = {
  id: string
  organizationId: string
  orderNo: string
  externalOrderNo?: string | null
  orderDate: string
  status: string
  totalCases: number
  submittedBy: string
  remarks?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateClientOrderInput = {
  organizationId: string
  orderNo: string
  externalOrderNo?: string | null
  orderDate: Date | string
  status?: string
  totalCases?: number
  submittedBy: string
  remarks?: string | null
}

export class ClientOrderRepository {
  constructor(private readonly db: DbLike) {}

  async findById(id: string): Promise<ClientOrderRecord | null> {
    const result = await this.db.query<ClientOrderRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        order_no as "orderNo",
        external_order_no as "externalOrderNo",
        order_date as "orderDate",
        status,
        total_cases as "totalCases",
        submitted_by as "submittedBy",
        remarks,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from client_orders
      where id = $1
      `,
      [id],
    )

    return result.rows[0] ?? null
  }

  async create(input: CreateClientOrderInput): Promise<ClientOrderRecord> {
    const result = await this.db.query<ClientOrderRecord>(
      `
      insert into client_orders (
        organization_id, order_no, external_order_no, order_date, status, total_cases, submitted_by, remarks
      ) values (
        $1, $2, $3, $4, coalesce($5, 'draft'), coalesce($6, 0), $7, $8
      ) returning
        id,
        organization_id as "organizationId",
        order_no as "orderNo",
        external_order_no as "externalOrderNo",
        order_date as "orderDate",
        status,
        total_cases as "totalCases",
        submitted_by as "submittedBy",
        remarks,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.organizationId,
        input.orderNo,
        input.externalOrderNo,
        input.orderDate,
        input.status,
        input.totalCases,
        input.submittedBy,
        input.remarks,
      ]
    )

    return result.rows[0]
  }

  async list(organizationId: string, limit = 50, offset = 0): Promise<ClientOrderRecord[]> {
    const result = await this.db.query<ClientOrderRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        order_no as "orderNo",
        external_order_no as "externalOrderNo",
        order_date as "orderDate",
        status,
        total_cases as "totalCases",
        submitted_by as "submittedBy",
        remarks,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from client_orders
      where organization_id = $1
      order by order_date desc, created_at desc
      limit $2 offset $3
      `,
      [organizationId, limit, offset]
    )
    return result.rows
  }

  async updateStatus(id: string, status: string): Promise<ClientOrderRecord | null> {
    const result = await this.db.query<ClientOrderRecord>(
      `
      update client_orders
      set status = $2, updated_at = now()
      where id = $1
      returning
        id,
        organization_id as "organizationId",
        order_no as "orderNo",
        external_order_no as "externalOrderNo",
        order_date as "orderDate",
        status,
        total_cases as "totalCases",
        submitted_by as "submittedBy",
        remarks,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [id, status]
    )
    return result.rows[0] ?? null
  }
}
