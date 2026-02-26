import { ExamineeRecord } from '../repositories/examinee-repository'
import { ScreeningRecord } from '../repositories/screening-repository'

/**
 * Utility module for parsing FHIR resources into internal domain models and vice versa
 * Reference: HL7 FHIR Release 4
 */

// Basic FHIR Patient Resource Interface
export interface HirPatient {
    resourceType: 'Patient'
    id?: string
    identifier?: Array<{ system: string; value: string }>
    name?: Array<{ text: string; family?: string; given?: string[] }>
    gender?: 'male' | 'female' | 'other' | 'unknown'
    birthDate?: string // YYYY-MM-DD
}

// Basic FHIR Observation Resource
export interface FhirObservation {
    resourceType: 'Observation'
    id?: string
    status: 'registered' | 'preliminary' | 'final' | 'amended'
    code: {
        coding: Array<{ system: string; code: string; display: string }>
    }
    subject?: { reference: string }
    effectiveDateTime?: string
    valueQuantity?: { value: number; unit: string; system: string; code: string }
    valueString?: string
    valueBoolean?: boolean
}

export class FhirMapper {

    /**
     * Convert Internal Examinee Record to FHIR Patient
     */
    static toFhirPatient(examinee: ExamineeRecord): HirPatient {
        return {
            resourceType: 'Patient',
            id: examinee.id,
            identifier: examinee.externalExamineeId ? [{
                system: `urn:oid:${examinee.organizationId}`, // Simplified system OID mock
                value: examinee.externalExamineeId
            }] : undefined,
            name: [{ text: examinee.displayName }],
            gender: this.mapGenderToFhir(examinee.sex),
            birthDate: examinee.birthDate ? new Date(examinee.birthDate).toISOString().split('T')[0] : undefined
        }
    }

    /**
     * Convert FHIR Patient to partial Internal CreateExamineeInput
     */
    static fromFhirPatient(patient: HirPatient, organizationId: string): any {
        const extId = patient.identifier?.[0]?.value
        const name = patient.name?.[0]?.text ||
            [patient.name?.[0]?.family, ...(patient.name?.[0]?.given || [])].filter(Boolean).join(' ') ||
            'Unknown'

        return {
            organizationId,
            externalExamineeId: extId,
            displayName: name,
            sex: this.mapFhirToGender(patient.gender),
            birthDate: patient.birthDate
        }
    }

    // --- Helpers ---

    private static mapGenderToFhir(sex?: string | null): HirPatient['gender'] {
        if (!sex) return 'unknown'
        const s = sex.toLowerCase()
        if (s === 'male' || s === 'm') return 'male'
        if (s === 'female' || s === 'f') return 'female'
        return 'other'
    }

    private static mapFhirToGender(gender?: string): string {
        if (!gender) return 'unknown'
        return gender.toLowerCase()
    }
}
