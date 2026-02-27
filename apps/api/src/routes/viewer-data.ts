import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { getDb } from '../lib/db'
import { S3CompatibleStorageService } from '../lib/s3-storage'

/**
 * Viewer Data API
 * Provides all data the diagnostic viewer needs in a single call:
 * - Screening details
 * - Patient/examinee info with clinical data
 * - Images with signed URLs
 * - Referral info (organization, referring physician)
 * - Active reading + existing report
 * - Reading queue for batch reading
 */
export const createViewerDataRoutes = (bucketName: string, endpoint?: string) => {
    const router = new Hono().use('*', requireAuth)

    const storageService = new S3CompatibleStorageService(
        process.env.AWS_REGION || 'ap-northeast-1',
        bucketName,
        endpoint
    )

    // GET /viewer-data/:screeningId — full viewer data bundle
    router.get('/:screeningId', async (ctx) => {
        const screeningId = ctx.req.param('screeningId')
        const db = getDb()

        // 1. Screening + examinee + organization (joined)
        const screeningResult = await db.query<{
            screeningId: string; screeningDate: string; status: string; urgencyFlag: boolean;
            chiefComplaint: string | null; symptomsJson: string | null;
            currentMedicationsJson: string | null; ophthalmicExamJson: string | null;
            hba1c: number | null; referringPhysician: string | null;
            bpSystolic: number | null; bpDiastolic: number | null;
            hasDiabetes: boolean | null; hasHypertension: boolean | null;
            hasDyslipidemia: boolean | null; smokingStatus: string | null;
            specialNotes: string | null;
            examineeId: string; displayName: string; sex: string | null;
            birthDate: string | null; age: number | null;
            ethnicity: string | null; bloodType: string | null;
            allergiesJson: string | null; medicalHistoryJson: string | null;
            ocularHistoryJson: string | null; familyHistoryJson: string | null;
            organizationId: string; organizationName: string;
            organizationPhone: string | null;
        }>(
            `
      SELECT
        s.id as "screeningId",
        to_char(s.screening_date, 'YYYY-MM-DD HH24:MI') as "screeningDate",
        s.status,
        s.urgency_flag as "urgencyFlag",
        s.chief_complaint as "chiefComplaint",
        s.symptoms_json::text as "symptomsJson",
        s.current_medications_json::text as "currentMedicationsJson",
        s.ophthalmic_exam_json::text as "ophthalmicExamJson",
        s.hba1c,
        s.referring_physician as "referringPhysician",
        s.blood_pressure_systolic as "bpSystolic",
        s.blood_pressure_diastolic as "bpDiastolic",
        s.has_diabetes as "hasDiabetes",
        s.has_hypertension as "hasHypertension",
        s.has_dyslipidemia as "hasDyslipidemia",
        s.smoking_status as "smokingStatus",
        s.special_notes as "specialNotes",
        e.id as "examineeId",
        e.display_name as "displayName",
        e.sex,
        to_char(e.birth_date, 'YYYY-MM-DD') as "birthDate",
        e.age,
        e.ethnicity,
        e.blood_type as "bloodType",
        e.allergies_json::text as "allergiesJson",
        e.medical_history_json::text as "medicalHistoryJson",
        e.ocular_history_json::text as "ocularHistoryJson",
        e.family_history_json::text as "familyHistoryJson",
        o.id as "organizationId",
        o.name as "organizationName",
        o.phone as "organizationPhone"
      FROM screenings s
      JOIN examinees e ON s.examinee_id = e.id
      JOIN client_orders co ON s.client_order_id = co.id
      JOIN organizations o ON co.organization_id = o.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
      `,
            [screeningId]
        )

        if (!screeningResult.rows[0]) {
            return ctx.json({ error: 'Screening not found' }, 404)
        }

        const screening = screeningResult.rows[0]

        // 2. Images with signed URLs
        const imagesResult = await db.query<{
            imageId: string; eyeSide: string; imageType: string;
            storageKey: string; originalFilename: string;
            widthPx: number | null; heightPx: number | null;
            isPrimary: boolean; sortOrder: number;
            annotationsJson: string | null;
        }>(
            `
      SELECT
        id as "imageId",
        eye_side as "eyeSide",
        image_type as "imageType",
        storage_key as "storageKey",
        original_filename as "originalFilename",
        width_px as "widthPx",
        height_px as "heightPx",
        is_primary as "isPrimary",
        sort_order as "sortOrder",
        annotations_json::text as "annotationsJson"
      FROM images
      WHERE screening_id = $1
      ORDER BY sort_order, eye_side, created_at
      `,
            [screeningId]
        )

        // Generate signed URLs for all images
        const images = await Promise.all(
            imagesResult.rows.map(async (img) => ({
                ...img,
                url: await storageService.generatePresignedGetUrl(img.storageKey, 3600),
                annotationsJson: img.annotationsJson ? JSON.parse(img.annotationsJson) : null,
            }))
        )

        // 3. Active reading + assignment
        const readingResult = await db.query<{
            readingId: string; readingStatus: string;
            assignmentId: string; physicianId: string; physicianName: string;
            dueAt: string | null;
        }>(
            `
      SELECT
        r.id as "readingId",
        r.status as "readingStatus",
        a.id as "assignmentId",
        p.id as "physicianId",
        p.name as "physicianName",
        to_char(a.due_at, 'YYYY-MM-DD') as "dueAt"
      FROM readings r
      JOIN assignments a ON r.assignment_id = a.id
      JOIN physicians p ON r.physician_id = p.id
      WHERE r.screening_id = $1
      ORDER BY r.created_at DESC
      LIMIT 1
      `,
            [screeningId]
        )

        // 4. Existing report (if any)
        let report = null
        if (readingResult.rows[0]) {
            const reportResult = await db.query<{
                id: string; findingsRightJson: string | null; findingsLeftJson: string | null;
                judgmentCode: string | null; judgmentLabel: string | null;
                referralRequired: boolean; reportText: string | null;
                status: string; submittedAt: string | null;
            }>(
                `
        SELECT
          id,
          findings_right_json::text as "findingsRightJson",
          findings_left_json::text as "findingsLeftJson",
          judgment_code as "judgmentCode",
          judgment_label as "judgmentLabel",
          referral_required as "referralRequired",
          report_text as "reportText",
          status,
          submitted_at as "submittedAt"
        FROM reading_reports
        WHERE reading_id = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
                [readingResult.rows[0].readingId]
            )
            report = reportResult.rows[0] || null
        }

        // 5. Build response
        return ctx.json({
            success: true,
            screening: {
                id: screening.screeningId,
                date: screening.screeningDate,
                status: screening.status,
                urgencyFlag: screening.urgencyFlag,
                chiefComplaint: screening.chiefComplaint,
                symptoms: screening.symptomsJson ? JSON.parse(screening.symptomsJson) : [],
                currentMedications: screening.currentMedicationsJson ? JSON.parse(screening.currentMedicationsJson) : [],
                ophthalmicExam: screening.ophthalmicExamJson ? JSON.parse(screening.ophthalmicExamJson) : null,
                hba1c: screening.hba1c,
                referringPhysician: screening.referringPhysician,
                bpSystolic: screening.bpSystolic,
                bpDiastolic: screening.bpDiastolic,
                hasDiabetes: screening.hasDiabetes,
                hasHypertension: screening.hasHypertension,
                hasDyslipidemia: screening.hasDyslipidemia,
                smokingStatus: screening.smokingStatus,
                specialNotes: screening.specialNotes,
            },
            patient: {
                id: screening.examineeId,
                name: screening.displayName,
                sex: screening.sex,
                birthDate: screening.birthDate,
                age: screening.age,
                ethnicity: screening.ethnicity,
                bloodType: screening.bloodType,
                allergies: screening.allergiesJson ? JSON.parse(screening.allergiesJson) : [],
                medicalHistory: screening.medicalHistoryJson ? JSON.parse(screening.medicalHistoryJson) : [],
                ocularHistory: screening.ocularHistoryJson ? JSON.parse(screening.ocularHistoryJson) : [],
                familyHistory: screening.familyHistoryJson ? JSON.parse(screening.familyHistoryJson) : [],
            },
            referral: {
                facility: screening.organizationName,
                phone: screening.organizationPhone,
                doctor: screening.referringPhysician,
            },
            images,
            reading: readingResult.rows[0] || null,
            report,
        })
    })

    // GET /viewer-data/queue/:physicianId — reading queue for a physician
    router.get('/queue/:physicianId', async (ctx) => {
        const physicianId = ctx.req.param('physicianId')
        const db = getDb()

        const result = await db.query<{
            screeningId: string; screeningDate: string;
            patientName: string; patientAge: number | null;
            patientSex: string | null; urgencyFlag: boolean;
            readingId: string; readingStatus: string;
            organizationName: string;
            imageCount: string;
        }>(
            `
      SELECT
        s.id as "screeningId",
        to_char(s.screening_date, 'YYYY-MM-DD') as "screeningDate",
        e.display_name as "patientName",
        e.age as "patientAge",
        e.sex as "patientSex",
        s.urgency_flag as "urgencyFlag",
        r.id as "readingId",
        r.status as "readingStatus",
        o.name as "organizationName",
        (SELECT COUNT(*)::text FROM images i WHERE i.screening_id = s.id) as "imageCount"
      FROM readings r
      JOIN assignments a ON r.assignment_id = a.id
      JOIN screenings s ON r.screening_id = s.id
      JOIN examinees e ON s.examinee_id = e.id
      JOIN client_orders co ON s.client_order_id = co.id
      JOIN organizations o ON co.organization_id = o.id
      WHERE r.physician_id = $1
        AND r.status IN ('draft', 'in_progress', 'qc_returned')
        AND s.deleted_at IS NULL
      ORDER BY s.urgency_flag DESC, s.screening_date ASC
      `,
            [physicianId]
        )

        return ctx.json({
            success: true,
            queue: result.rows.map(r => ({
                screeningId: r.screeningId,
                screeningDate: r.screeningDate,
                patientName: r.patientName,
                patientAge: r.patientAge,
                patientSex: r.patientSex,
                urgencyFlag: r.urgencyFlag,
                readingId: r.readingId,
                status: r.readingStatus,
                organizationName: r.organizationName,
                imageCount: parseInt(r.imageCount, 10),
            })),
            total: result.rows.length,
        })
    })

    return router
}
