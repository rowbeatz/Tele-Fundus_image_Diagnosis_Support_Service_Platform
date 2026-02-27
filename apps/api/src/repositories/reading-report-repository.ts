import { DbLike } from '../lib/db'

export type ReadingReportRecord = {
    id: string
    readingId: string
    screeningId: string
    physicianId: string
    findingsRightJson: string | null
    findingsLeftJson: string | null
    judgmentCode: string | null
    judgmentLabel: string | null
    referralRequired: boolean
    referralDestination: string | null
    referralReason: string | null
    reportText: string | null
    templateId: string | null
    status: string
    submittedAt: string | null
    createdAt: string
    updatedAt: string
}

export type CreateReadingReportInput = {
    readingId: string
    screeningId: string
    physicianId: string
    findingsRightJson?: string
    findingsLeftJson?: string
    judgmentCode?: string
    judgmentLabel?: string
    referralRequired?: boolean
    referralDestination?: string
    referralReason?: string
    reportText?: string
    templateId?: string
}

export type UpdateReadingReportInput = {
    findingsRightJson?: string
    findingsLeftJson?: string
    judgmentCode?: string
    judgmentLabel?: string
    referralRequired?: boolean
    referralDestination?: string
    referralReason?: string
    reportText?: string
    templateId?: string
    status?: string
}

const RETURNING_COLS = `
  id,
  reading_id as "readingId",
  screening_id as "screeningId",
  physician_id as "physicianId",
  findings_right_json::text as "findingsRightJson",
  findings_left_json::text as "findingsLeftJson",
  judgment_code as "judgmentCode",
  judgment_label as "judgmentLabel",
  referral_required as "referralRequired",
  referral_destination as "referralDestination",
  referral_reason as "referralReason",
  report_text as "reportText",
  template_id as "templateId",
  status,
  submitted_at as "submittedAt",
  created_at as "createdAt",
  updated_at as "updatedAt"
`

export class ReadingReportRepository {
    constructor(private readonly db: DbLike) { }

    async create(input: CreateReadingReportInput): Promise<ReadingReportRecord> {
        const result = await this.db.query<ReadingReportRecord>(
            `
      INSERT INTO reading_reports (
        reading_id, screening_id, physician_id,
        findings_right_json, findings_left_json,
        judgment_code, judgment_label,
        referral_required, referral_destination, referral_reason,
        report_text, template_id
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5::jsonb,
        $6, $7, COALESCE($8, false), $9, $10, $11, $12
      ) RETURNING ${RETURNING_COLS}
      `,
            [
                input.readingId, input.screeningId, input.physicianId,
                input.findingsRightJson, input.findingsLeftJson,
                input.judgmentCode, input.judgmentLabel,
                input.referralRequired, input.referralDestination, input.referralReason,
                input.reportText, input.templateId,
            ]
        )
        return result.rows[0]
    }

    async findByReadingId(readingId: string): Promise<ReadingReportRecord | null> {
        const result = await this.db.query<ReadingReportRecord>(
            `SELECT ${RETURNING_COLS} FROM reading_reports WHERE reading_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [readingId]
        )
        return result.rows[0] ?? null
    }

    async findByScreeningId(screeningId: string): Promise<ReadingReportRecord[]> {
        const result = await this.db.query<ReadingReportRecord>(
            `SELECT ${RETURNING_COLS} FROM reading_reports WHERE screening_id = $1 ORDER BY created_at DESC`,
            [screeningId]
        )
        return result.rows
    }

    async update(id: string, updates: UpdateReadingReportInput): Promise<ReadingReportRecord> {
        const setClauses: string[] = []
        const values: (string | boolean | undefined)[] = [id]
        let idx = 2

        const fields: [keyof UpdateReadingReportInput, string, boolean][] = [
            ['findingsRightJson', 'findings_right_json', true],
            ['findingsLeftJson', 'findings_left_json', true],
            ['judgmentCode', 'judgment_code', false],
            ['judgmentLabel', 'judgment_label', false],
            ['referralRequired', 'referral_required', false],
            ['referralDestination', 'referral_destination', false],
            ['referralReason', 'referral_reason', false],
            ['reportText', 'report_text', false],
            ['templateId', 'template_id', false],
            ['status', 'status', false],
        ]

        for (const [key, col, isJsonb] of fields) {
            if (updates[key] !== undefined) {
                setClauses.push(`${col} = $${idx}${isJsonb ? '::jsonb' : ''}`)
                values.push(updates[key] as string)
                idx++
            }
        }

        // Auto-set submitted_at when status changes to submitted
        if (updates.status === 'submitted') {
            setClauses.push('submitted_at = NOW()')
        }

        if (setClauses.length === 0) throw new Error('No updates provided')

        const result = await this.db.query<ReadingReportRecord>(
            `UPDATE reading_reports SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING ${RETURNING_COLS}`,
            values
        )
        return result.rows[0]
    }

    async submit(id: string): Promise<ReadingReportRecord> {
        return this.update(id, { status: 'submitted' })
    }
}
