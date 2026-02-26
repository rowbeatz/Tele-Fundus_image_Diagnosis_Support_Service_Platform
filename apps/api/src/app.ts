import { Hono } from 'hono'
import { createAuthRouter } from './routes/auth'
import { importsRouter } from './routes/imports'
import { createJobsRouter } from './routes/jobs'
import { InMemorySessionStore } from './infra/auth/session-store'
import { ConsoleMailer } from './infra/mail/mailer'
import { InMemoryJobQueue } from './infra/queue/job-queue'

const app = new Hono()

const sessionStore = new InMemorySessionStore()
const mailer = new ConsoleMailer()
const queue = new InMemoryJobQueue()

app.get('/health', (c) => c.json({ ok: true }))
app.route('/auth', createAuthRouter({ sessionStore, mailer }))
app.route('/imports', importsRouter)
app.route('/jobs', createJobsRouter(queue))

export default app
