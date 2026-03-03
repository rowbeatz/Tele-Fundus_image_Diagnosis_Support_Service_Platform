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
  questionnaireJson?: string | null
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
  questionnaireJson?: string
  specialNotes?: string
}

export class ScreeningRepository {
  constructor(private readonly db: DbLike) { }

  async create(input: CreateScreeningInput): Promise<ScreeningRecord> {
    const result = await this.db.query<ScreeningRecord>(
      `
      insert into screenings (
        client_order_id, examinee_id, screening_date, urgency_flag,
        blood_pressure_systolic, blood_pressure_diastolic, has_diabetes,
        has_hypertension, has_dyslipidemia, smoking_status,
        questionnaire_text, questionnaire_json, special_notes, status, qc_issue_flag
      ) values (
        $1, $2, $3, coalesce($4, false),
        $5, $6, $7,
        $8, $9, $10,
        $11, $12::jsonb, $13, 'submitted', false
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
        questionnaire_json::text as "questionnaireJson",
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
        input.questionnaireJson,
        input.specialNotes,
      ]
    )

    return result.rows[0]
  }

  async findById(id: string): Promise<ScreeningRecord | null> {
    const result = await this.db.query<ScreeningRecord>(
      `
      select
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
        questionnaire_json::text as "questionnaireJson",
        special_notes as "specialNotes",
        status,
        qc_issue_flag as "qcIssueFlag",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from screenings
      where id = $1 and deleted_at is null
      `,
      [id]
    )
    return result.rows[0] ?? null
  }

  async update(id: string, updates: Partial<ScreeningRecord>): Promise<ScreeningRecord> {
    const setClauses: string[] = []
    const values: any[] = [id]
    let paramIndex = 2

    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }

    // Add other fields broadly if needed over time

    if (setClauses.length === 0) {
      throw new Error('No updates provided')
    }

    const result = await this.db.query<ScreeningRecord>(
      `
      update screenings
      set ${setClauses.join(', ')}, updated_at = now()
      where id = $1 and deleted_at is null
      returning
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
        questionnaire_json::text as "questionnaireJson",
        special_notes as "specialNotes",
        status,
        qc_issue_flag as "qcIssueFlag",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      values
    )
    return result.rows[0]
  }

  async softDelete(id: string): Promise<void> {
    await this.db.query(
      `update screenings set deleted_at = now() where id = $1`,
      [id]
    )
  }

  /** Full list with joined examinee + organization data for dashboard/list views */
  async findAllRich(): Promise<ScreeningListItem[]> {
    const result = await this.db.query<ScreeningListItem>(
      `
      select
        s.id,
        s.status,
        s.urgency_flag as "urgencyFlag",
        s.screening_date as "screeningDate",
        s.has_diabetes as "hasDiabetes",
        s.blood_pressure_systolic as "bloodPressureSystolic",
        s.blood_pressure_diastolic as "bloodPressureDiastolic",
        e.id as "examineeId",
        e.external_examinee_id as "patientId",
        e.display_name as "patientName",
        e.sex,
        e.birth_date as "birthDate",
        e.age,
        o.name as "organizationName",
        o.id as "organizationId",
        (select count(*) from images i where i.screening_id = s.id)::int as "imageCount",
        coalesce((select count(*) from readings r where r.screening_id = s.id), 0)::int as "readingCount"
      from screenings s
      join examinees e on e.id = s.examinee_id
      join client_orders co on co.id = s.client_order_id
      join organizations o on o.id = co.organization_id
      where s.deleted_at is null
      order by s.screening_date desc
      `
    )
    return result.rows
  }

  /** Update screening with save/confirm workflow status */
  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.query(
      `update screenings set status = $2, updated_at = now() where id = $1 and deleted_at is null`,
      [id, status]
    )
  }
}

export type ScreeningListItem = {
  id: string
  status: string
  urgencyFlag: boolean
  screeningDate: string
  hasDiabetes: boolean | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  examineeId: string
  patientId: string
  patientName: string
  sex: string
  birthDate: string
  age: number
  organizationName: string
  organizationId: string
  imageCount: number
  readingCount: number
}
