/**
 * Screening API Service
 * 
 * Frontend service layer for real database-backed screening operations.
 * All calls go through /api proxy → Hono API → PostgreSQL.
 */
import { api } from './api'

// ─── Types ────────────────────────────────────────────────
export interface ScreeningListItem {
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

export interface ScreeningDetail {
    id: string
    clientOrderId: string
    examineeId: string
    screeningDate: string
    urgencyFlag: boolean
    bloodPressureSystolic: number | null
    bloodPressureDiastolic: number | null
    hasDiabetes: boolean | null
    hasHypertension: boolean | null
    hasDyslipidemia: boolean | null
    smokingStatus: string | null
    questionnaireText: string | null
    specialNotes: string | null
    status: string
    qcIssueFlag: boolean
    createdAt: string
    updatedAt: string
}

export interface ExamineeDetail {
    id: string
    externalExamineeId: string
    displayName: string
    sex: string
    birthDate: string
    age: number
    organizationId: string
}

// ─── API Calls ────────────────────────────────────────────

/** Fetch all screenings (joined with patient & org data) */
export interface Physician {
    id: string
    name: string
    specialty: string
    status: string
}

export async function fetchScreenings(): Promise<ScreeningListItem[]> {
    const { data } = await api.get('/screenings')
    return data
}

export async function fetchPhysicians(): Promise<Physician[]> {
    const { data } = await api.get('/physicians')
    return data
}

export async function assignPhysician(screeningId: string, physicianId: string): Promise<void> {
    await api.post(`/ops-screenings/${screeningId}/assign`, { physicianId })
}

/** Fetch single screening detail */
export async function fetchScreeningDetail(id: string): Promise<{ screening: ScreeningDetail; examinee: ExamineeDetail | null }> {
    const { data } = await api.get(`/screenings/${id}`)
    return data
}

/** Update screening status (save/confirm workflow) */
export async function updateScreeningStatus(id: string, status: 'draft' | 'saved' | 'confirmed' | 'submitted' | 'completed'): Promise<void> {
    await api.put(`/screenings/${id}/status`, { status })
}

/** Create a new screening */
export async function createScreening(input: {
    examineeId: string
    clientOrderId: string
    screeningDate: string
    urgencyFlag?: boolean
    bloodPressureSystolic?: number
    bloodPressureDiastolic?: number
    hasDiabetes?: boolean
    hasHypertension?: boolean
    hasDyslipidemia?: boolean
    smokingStatus?: string
    specialNotes?: string
}): Promise<ScreeningDetail> {
    const { data } = await api.post('/screenings', input)
    return data.screening
}
