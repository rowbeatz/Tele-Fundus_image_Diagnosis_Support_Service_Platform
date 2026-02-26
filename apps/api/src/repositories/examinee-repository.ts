import { DbLike } from '../lib/db'

export type ExamineeRecord = {
  id: string
  organizationId: string
  externalExamineeId?: string | null
  displayName: string
  sex?: string | null
  birthDate?: string | null
  age?: number | null
  medicalHistoryJson?: string | null
  ocularHistoryJson?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateExamineeInput = {
  organizationId: string
  externalExamineeId?: string
  displayName: string
  sex?: string
  birthDate?: string
  age?: number
  medicalHistoryJson?: string
  ocularHistoryJson?: string
}

export class ExamineeRepository {
  constructor(private readonly db: DbLike) { }

  async create(input: CreateExamineeInput): Promise<ExamineeRecord> {
    const result = await this.db.query<ExamineeRecord>(
      `
      insert into examinees (
        organization_id, external_examinee_id, display_name, sex, birth_date, age,
        medical_history_json, ocular_history_json
      ) values (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb
      ) returning
        id,
        organization_id as "organizationId",
        external_examinee_id as "externalExamineeId",
        display_name as "displayName",
        sex,
        birth_date as "birthDate",
        age,
        medical_history_json::text as "medicalHistoryJson",
        ocular_history_json::text as "ocularHistoryJson",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        input.organizationId,
        input.externalExamineeId,
        input.displayName,
        input.sex,
        input.birthDate,
        input.age,
        input.medicalHistoryJson,
        input.ocularHistoryJson,
      ]
    )

    return result.rows[0]
  }

  async findByExternalId(organizationId: string, externalId: string): Promise<ExamineeRecord | null> {
    const result = await this.db.query<ExamineeRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        external_examinee_id as "externalExamineeId",
        display_name as "displayName",
        sex,
        birth_date as "birthDate",
        age,
        medical_history_json::text as "medicalHistoryJson",
        ocular_history_json::text as "ocularHistoryJson",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from examinees
      where organization_id = $1 and external_examinee_id = $2 and deleted_at is null
      `,
      [organizationId, externalId]
    )
    return result.rows[0] ?? null
  }

  async listByOrganization(organizationId: string, limit = 50, offset = 0): Promise<ExamineeRecord[]> {
    const result = await this.db.query<ExamineeRecord>(
      `
      select
        id,
        organization_id as "organizationId",
        external_examinee_id as "externalExamineeId",
        display_name as "displayName",
        sex,
        birth_date as "birthDate",
        age,
        medical_history_json::text as "medicalHistoryJson",
        ocular_history_json::text as "ocularHistoryJson",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from examinees
      where organization_id = $1 and deleted_at is null
      order by created_at desc
      limit $2 offset $3
      `,
      [organizationId, limit, offset]
    )
    return result.rows
  }

  async softDelete(id: string): Promise<void> {
    await this.db.query(
      `update examinees set deleted_at = now() where id = $1`,
      [id]
    )
  }
}
