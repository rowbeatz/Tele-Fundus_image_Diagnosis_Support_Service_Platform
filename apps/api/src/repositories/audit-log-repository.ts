import { DbLike } from '../lib/db'

export type CreateAuditLogInput = {
    userId: string
    action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'
    resourceType: string
    resourceId: string
    details?: any
    ipAddress?: string
    userAgent?: string
}

export class AuditLogRepository {
    constructor(private readonly db: DbLike) { }

    async log(input: CreateAuditLogInput): Promise<void> {
        await this.db.query(
            `
      insert into audit_logs (
        user_id, action, resource_type, resource_id, details, ip_address, user_agent
      ) values (
        $1, $2, $3, $4, $5::jsonb, $6, $7
      )
      `,
            [
                input.userId,
                input.action,
                input.resourceType,
                input.resourceId,
                input.details ? JSON.stringify(input.details) : null,
                input.ipAddress,
                input.userAgent
            ]
        )
    }
}
