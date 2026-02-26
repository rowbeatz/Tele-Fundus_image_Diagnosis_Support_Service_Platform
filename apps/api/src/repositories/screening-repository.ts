import { DbLike } from '../lib/db'

export type ScreeningRecord = {
  id: string
  clientOrderId: string
  examineeId: string
  screeningDate: string
  urgencyFlag: boolean
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  hasDiabetes?: boolean | null
  hasHypertension?: boolean | null
  hasDyslipidemia?: boolean | null
  smokingStatus?: string | null
  questionnaireText?: string | null
  specialNotes?: string | null
  status: string
  qcIssueFlag: boolean
  createdAt: string
  updatedAt: string
}

export type CreateScreeningInput = {
  clientOrderId: string
  examineeId: string
  screeningDate: string | Date
  urgencyFlag?: boolean
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  hasDiabetes?: boolean
  hasHypertension?: boolean
  hasDyslipidemia?: boolean
  smokingStatus?: string
  questionnaireText?: string
  specialNotes?: string
}

export class ScreeningRepository {
  constructor(private readonly db: DbLike) {}

  async create(input: CreateScreeningInput): Promise<ScreeningRecord> {
    const result = await this.db.query<ScreeningRecord>(
      `
      insert into screenings (
        client_order_id, examinee_id, screening_date, urgency_flag,
        blood_pressure_systolic, blood_pressure_diastolic, has_diabetes,
        has_hypertension, has_dyslipidemia, smoking_status,
        questionnaire_text, special_notes, status, qc_issue_flag
      ) values (
        $1, $2, $3, coalesce($4, false),
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, 'submitted', false
      ) returning
        id,
        client_order_id as "clientOrderId",
        examinee_id as "examineeId",
        screening_date as "screeningDate",
        urgency_flag as "urgencyFlag",
        blood_pressure_systolic as "bloodPressureSystolic",
        blood_pressure_diastolic as "bloodPressureDiastolic",
        has_diabetes as "hasDiabetes",
        has_hypertension as "hasHypertension",
        has_dyslipidemia as "hasDyslipidemia",
        smoking_status as "smokingStatus",
        questionnaire_text as "questionnaireText",
        special_notes as "specialNotes",
        status,
        qc_issue_flag as "qcIssueFlag",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.clientOrderId,
        input.examineeId,
        input.screeningDate,
        input.urgencyFlag,
        input.bloodPressureSystolic,
        input.bloodPressureDiastolic,
        input.hasDiabetes,
        input.hasHypertension,
        input.hasDyslipidemia,
        input.smokingStatus,
        input.questionnaireText,
        input.specialNotes,
      ]
    )

    return result.rows[0]
  }
}
