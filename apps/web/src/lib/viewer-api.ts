/**
 * Viewer API Client
 * Typed client for all diagnostic viewer data operations.
 * Replaces mock data with real API calls.
 */
import { api } from './api'

// ─── Types ──────────────────────────────────────────────────

export interface ViewerData {
    screening: ScreeningData
    patient: PatientData
    referral: ReferralData
    images: ImageData[]
    reading: ReadingData | null
    report: ReportData | null
}

export interface ScreeningData {
    id: string
    date: string
    status: string
    urgencyFlag: boolean
    chiefComplaint: string | null
    symptoms: string[]
    currentMedications: MedicationData[]
    ophthalmicExam: OphthalmicExamData | null
    hba1c: number | null
    referringPhysician: string | null
    bpSystolic: number | null
    bpDiastolic: number | null
    hasDiabetes: boolean | null
    hasHypertension: boolean | null
    hasDyslipidemia: boolean | null
    smokingStatus: string | null
    specialNotes: string | null
}

export interface PatientData {
    id: string
    name: string
    sex: string | null
    birthDate: string | null
    age: number | null
    ethnicity: string | null
    bloodType: string | null
    allergies: string[]
    medicalHistory: { condition: string; since: string; status: string }[]
    ocularHistory: { condition: string; since: string; eye: string }[]
    familyHistory: { condition: string; relation: string }[]
}

export interface ReferralData {
    facility: string
    phone: string | null
    doctor: string | null
}

export interface MedicationData {
    name: string
    dosage: string
    frequency: string
}

export interface OphthalmicExamData {
    vaRight: string
    vaLeft: string
    iopRight: number
    iopLeft: number
    anteriorFindings: string
}

export interface ImageData {
    imageId: string
    eyeSide: string
    imageType: string
    storageKey: string
    originalFilename: string
    widthPx: number | null
    heightPx: number | null
    isPrimary: boolean
    sortOrder: number
    url: string
    annotationsJson: unknown | null
}

export interface ReadingData {
    readingId: string
    readingStatus: string
    assignmentId: string
    physicianId: string
    physicianName: string
    dueAt: string | null
}

export interface ReportData {
    id: string
    findingsRightJson: string | null
    findingsLeftJson: string | null
    judgmentCode: string | null
    judgmentLabel: string | null
    referralRequired: boolean
    reportText: string | null
    status: string
    submittedAt: string | null
}

export interface ReadingQueueItem {
    screeningId: string
    screeningDate: string
    patientName: string
    patientAge: number | null
    patientSex: string | null
    urgencyFlag: boolean
    readingId: string
    status: string
    organizationName: string
    imageCount: number
}

export interface CaseMessage {
    id: string
    screeningId: string
    userId: string
    message: string
    createdAt: string
    userName: string
    userRole: string
}

export interface SaveReportInput {
    screeningId: string
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

// ─── API Functions ──────────────────────────────────────────

/** Fetch all viewer data for a screening in a single call */
export async function fetchViewerData(screeningId: string): Promise<ViewerData> {
    const { data } = await api.get(`/viewer-data/${screeningId}`)
    return data
}

/** Fetch reading queue for current physician */
export async function fetchReadingQueue(physicianId: string): Promise<{ queue: ReadingQueueItem[]; total: number }> {
    const { data } = await api.get(`/viewer-data/queue/${physicianId}`)
    return data
}

/** Save report draft (upsert) */
export async function saveReport(readingId: string, input: SaveReportInput): Promise<ReportData> {
    const { data } = await api.put(`/reading-reports/${readingId}`, input)
    return data.report
}

/** Submit report (finalize) */
export async function submitReport(readingId: string, input: SaveReportInput): Promise<ReportData> {
    const { data } = await api.post(`/reading-reports/${readingId}/submit`, input)
    return data.report
}

/** Fetch existing report for a reading */
export async function fetchReport(readingId: string): Promise<ReportData | null> {
    const { data } = await api.get(`/reading-reports/${readingId}`)
    return data.report
}

/** Fetch case discussion messages */
export async function fetchCaseMessages(screeningId: string): Promise<CaseMessage[]> {
    const { data } = await api.get(`/case-discussions/${screeningId}`)
    return data.messages
}

/** Post a new case discussion message */
export async function sendCaseMessage(screeningId: string, message: string): Promise<CaseMessage> {
    const { data } = await api.post(`/case-discussions/${screeningId}`, { message })
    return data.message
}

/** Delete a case discussion message */
export async function deleteCaseMessage(screeningId: string, messageId: string): Promise<void> {
    await api.delete(`/case-discussions/${screeningId}/${messageId}`)
}

/** Save annotations on an image */
export async function saveAnnotations(imageId: string, annotationsJson: string): Promise<void> {
    await api.put(`/viewer/${imageId}/annotations`, { annotationsJson })
}

/** Get signed URL for a specific image */
export async function getImageSignedUrl(imageId: string): Promise<{ url: string; mimeType: string; annotationsJson: unknown }> {
    const { data } = await api.get(`/viewer/${imageId}/signed-url`)
    return data
}

/** Fetch patient history for comparison */
export async function fetchPatientHistory(examineeId: string): Promise<{
    history: { screeningId: string; screeningDate: string; images: { imageId: string; eyeSide: string; url: string }[] }[]
}> {
    const { data } = await api.get(`/viewer/examinees/${examineeId}/history`)
    return data
}
