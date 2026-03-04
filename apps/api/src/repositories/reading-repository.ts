import { DbLike } from '../lib/db'

export type ReadingRecord = {
  id: string
  screeningId: string
  assignmentId: string
  physicianId: string
  status: string
  findingText?: string | null
  judgmentCode?: string | null
  referralRequired: boolean
  physicianComment?: string | null
  submittedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateReadingInput = {
  screeningId: string
  assignmentId: string
  physicianId: string
  findingText?: string
  judgmentCode?: string
  referralRequired?: boolean
  physicianComment?: string
}

export class ReadingRepository {
  constructor(private readonly db: DbLike) { }

  async findById(id: string): Promise<ReadingRecord | null> {
    const result = await this.db.query<ReadingRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        assignment_id as "assignmentId",
        physician_id as "physicianId",
        status,
        finding_text as "findingText",
        judgment_code as "judgmentCode",
        referral_required as "referralRequired",
        physician_comment as "physicianComment",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from readings
      where id = $1
      `,
      [id],
    )

    return result.rows[0] ?? null
  }

  async create(input: CreateReadingInput): Promise<ReadingRecord> {
    const result = await this.db.query<ReadingRecord>(
      `
      insert into readings (
        screening_id, assignment_id, physician_id, status,
        finding_text, judgment_code, referral_required, physician_comment
      ) values (
        $1, $2, $3, 'draft',
        $4, $5, coalesce($6, false), $7
      ) returning
        id,
        screening_id as "screeningId",
        assignment_id as "assignmentId",
        physician_id as "physicianId",
        status,
        finding_text as "findingText",
        judgment_code as "judgmentCode",
        referral_required as "referralRequired",
        physician_comment as "physicianComment",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.screeningId,
        input.assignmentId,
        input.physicianId,
        input.findingText,
        input.judgmentCode,
        input.referralRequired,
        input.physicianComment,
      ]
    )

    return result.rows[0]
  }

  async submit(id: string): Promise<void> {
    await this.db.query(
      `
      update readings
      set
        status = 'submitted',
        submitted_at = now(),
        updated_at = now()
      where id = $1
      `,
      [id]
    )
  }

  async listByScreeningId(screeningId: string): Promise<ReadingRecord[]> {
    const result = await this.db.query<ReadingRecord>(
      `
      select
        id,
        screening_id as "screeningId",
        assignment_id as "assignmentId",
        physician_id as "physicianId",
        status,
        finding_text as "findingText",
        judgment_code as "judgmentCode",
        referral_required as "referralRequired",
        physician_comment as "physicianComment",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from readings
      where screening_id = $1
      order by created_at desc
      `,
      [screeningId]
    )
    return result.rows
  }

  async updateJudgment(id: string, input: { judgmentCode: string, findingText?: string, referralRequired?: boolean, physicianComment?: string }): Promise<ReadingRecord | null> {
    const result = await this.db.query<ReadingRecord>(
      `
      update readings
      set
        judgment_code = $2,
        finding_text = coalesce($3, finding_text),
        referral_required = coalesce($4, referral_required),
        physician_comment = coalesce($5, physician_comment),
        updated_at = now()
      where id = $1
      returning
        id,
        screening_id as "screeningId",
        assignment_id as "assignmentId",
        physician_id as "physicianId",
        status,
        finding_text as "findingText",
        judgment_code as "judgmentCode",
        referral_required as "referralRequired",
        physician_comment as "physicianComment",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [id, input.judgmentCode, input.findingText, input.referralRequired, input.physicianComment]
    )
    return result.rows[0] ?? null
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.query(
      `
      update readings
      set
        status = $2,
        updated_at = now()
      where id = $1
      `,
      [id, status]
    )
  }
}
