import { Hono } from 'hono'
import { createAuthRouter } from './routes/auth'
import { importsRouter } from './routes/imports'
import { createJobsRouter } from './routes/jobs'
import { createUploadsRouter } from './routes/uploads'
import { createViewerRoutes } from './routes/viewer'
import { deliveryRoutes } from './routes/deliveries'
import { imageRoutes } from './routes/images'
import { opsScreeningsRoutes } from './routes/ops-screenings'
import { opsReadingsRoutes } from './routes/ops-readings'
import { accountingRoutes } from './routes/accounting'
import { fhirRoutes } from './routes/fhir'
import { communicationRoutes } from './routes/communication'
import { DbSessionStore } from './infra/auth/session-store'
import { ConsoleMailer } from './infra/mail/mailer'
import { InMemoryJobQueue } from './infra/queue/job-queue'
import { pool } from './lib/db'
import { auditLogger } from './middleware/audit-logger'
import { securityHeadersMiddleware } from './middleware/security'

const app = new Hono()

app.use('*', securityHeadersMiddleware)
app.use('*', auditLogger)

const sessionStore = new DbSessionStore(pool)
const mailer = new ConsoleMailer()
const queue = new InMemoryJobQueue()


app.get('/health', (c) => c.json({ ok: true }))
app.route('/auth', createAuthRouter({ sessionStore, mailer }))
app.route('/imports', importsRouter)
app.route('/jobs', createJobsRouter(queue))
app.route('/deliveries', deliveryRoutes)
app.route('/images', imageRoutes)
app.route('/ops-screenings', opsScreeningsRoutes)
app.route('/ops-readings', opsReadingsRoutes)
app.route('/accounting', accountingRoutes)
app.route('/fhir', fhirRoutes)
app.route('/communication', communicationRoutes)


const bucketName = process.env.AWS_S3_BUCKET || 'tele-fundus-portal-assets'
const endpoint = process.env.S3_ENDPOINT
app.route('/viewer', createViewerRoutes(bucketName, process.env.S3_ENDPOINT))
app.route('/uploads', createUploadsRouter(bucketName, process.env.S3_ENDPOINT))

export default app
