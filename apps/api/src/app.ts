import { Hono } from 'hono'
import { createAuthRouter } from './routes/auth'
import { importsRouter } from './routes/imports'
import { createJobsRouter } from './routes/jobs'
import { createUploadsRouter } from './routes/uploads'
import { deliveryRoutes } from './routes/deliveries'
import { imageRoutes } from './routes/images'
import { DbSessionStore } from './infra/auth/session-store'
import { ConsoleMailer } from './infra/mail/mailer'
import { InMemoryJobQueue } from './infra/queue/job-queue'
import { pool } from './lib/db'
import { auditLogger } from './middleware/audit-logger'

const app = new Hono()

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


const bucketName = process.env.AWS_S3_BUCKET || 'tele-fundus-portal-assets'
app.route('/uploads', createUploadsRouter(bucketName, process.env.S3_ENDPOINT))

export default app

