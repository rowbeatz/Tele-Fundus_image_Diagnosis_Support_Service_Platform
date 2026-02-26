import { Hono } from 'hono'
// @ts-ignore
import { requireAuth } from '../middleware/auth'
import { pool } from '../lib/db'
import { ExamineeRepository } from '../repositories/examinee-repository'
import { FhirMapper, HirPatient } from '../lib/fhir-mapper'
import { requireRole } from '../middleware/security'

export const fhirRoutes = new Hono()

// HIPAA / FHIR integrations require higher privileges
fhirRoutes.use('*', requireAuth)
fhirRoutes.use('*', requireRole(['client_admin', 'ops_coordinator', 'admin']))

// FHIR Patient Resource Endpoint
fhirRoutes.get('/Patient/:id', async (c) => {
    const examineeId = c.req.param('id')
    const user = c.get('user') as any

    const examineeRepo = new ExamineeRepository(pool)

    // Minimal check, ideal flow should verify organization constraints
    const examinee = await pool.query('select * from examinees where id = $1', [examineeId])
    if (examinee.rowCount === 0) {
        return c.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] }, 404)
    }

    // Basic mock mapping assuming DB structure aligns with ExamineeRecord typing in repo
    const record = {
        id: examinee.rows[0].id,
        organizationId: examinee.rows[0].organization_id,
        externalExamineeId: examinee.rows[0].external_examinee_id,
        displayName: examinee.rows[0].display_name,
        sex: examinee.rows[0].sex,
        birthDate: examinee.rows[0].birth_date,
        age: examinee.rows[0].age,
        createdAt: examinee.rows[0].created_at,
        updatedAt: examinee.rows[0].updated_at
    }

    const fhirPatient = FhirMapper.toFhirPatient(record)

    c.header('Content-Type', 'application/fhir+json')
    return c.json(fhirPatient)
})

// Ingest an external FHIR Patient payload
fhirRoutes.post('/Patient', async (c) => {
    const payload = await c.req.json<HirPatient>()
    const user = c.get('user') as any

    if (payload.resourceType !== 'Patient') {
        return c.json({ issue: [{ severity: 'error', diagnostics: 'Invalid resourceType' }] }, 400)
    }

    const input = FhirMapper.fromFhirPatient(payload, user.organizationId)

    const examineeRepo = new ExamineeRepository(pool)
    const existing = await examineeRepo.findByExternalId(input.organizationId, input.externalExamineeId)

    if (existing) {
        return c.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'warning', code: 'conflict', diagnostics: 'Patient already exists' }] }, 409)
    }

    const newExaminee = await examineeRepo.create(input)

    c.header('Location', `/fhir/Patient/${newExaminee.id}`)
    return c.json(FhirMapper.toFhirPatient(newExaminee), 201)
})

// FHIR Observation Endpoint (Mock routing, implement mappings as needed)
fhirRoutes.get('/Observation', async (c) => {
    // Example: GET /fhir/Observation?subject=Patient/123
    const subject = c.req.query('subject')
    return c.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: []
    })
})
