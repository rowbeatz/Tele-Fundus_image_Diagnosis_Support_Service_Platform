import { DbLike } from '../lib/db'

export type AssignmentRecord = {
  id: string
  screeningId: string
  physicianId: string
  assignedBy: string
  assignedAt: string
  dueAt?: string | null
  status: string
  isCurrent: boolean
  reassignReason?: string | null
}

export type CreateAssignmentInput = {
  screeningId: string
  physicianId: string
  assignedBy: string
  dueAt?: string | null
  reassignReason?: string | null
}

export class AssignmentRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateAssignmentInput): Promise<AssignmentRecord> {
    // Determine if this is a reassignment. If so, invalidate previous current assignment for this screening.
    await this.db.query(
      `
      update assignments
      set is_current = false
      where screening_id = $1 and is_current = true
      `,
      [input.screeningId]
    )

    const result = await this.db.query<AssignmentRecord>(
      `
      insert into assignments (
        screening_id, physician_id, assigned_by, due_at, status, is_current, reassign_reason
      ) values (
        $1, $2, $3, $4, 'assigned', true, $5
      ) returning
        id,
        screening_id as "screeningId",
        physician_id as "physicianId",
        assigned_by as "assignedBy",
        assigned_at as "assignedAt",
        due_at as "dueAt",
        status,
        is_current as "isCurrent",
        reassign_reason as "reassignReason"
      `,
      [
        input.screeningId,
        input.physicianId,
        input.assignedBy,
        input.dueAt ?? null,
        input.reassignReason ?? null,
      ]
    )
    return result.rows[0]
  }

  async findCurrentByScreeningId(screeningId: string): Promise<AssignmentRecord | null> {
    const result = await this.db.query<AssignmentRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        physician_id as "physicianId",
        assigned_by as "assignedBy",
        assigned_at as "assignedAt",
        due_at as "dueAt",
        status,
        is_current as "isCurrent",
        reassign_reason as "reassignReason"
      from assignments
      where screening_id = $1 and is_current = true
      limit 1
      `,
      [screeningId]
    )
    return result.rows[0] ?? null
  }
}
