import { Hono } from 'hono'
import type { JobQueue } from '../infra/queue/job-queue'

export function createJobsRouter(queue: JobQueue) {
  const jobs = new Hono()

  jobs.post('/deliveries/:id/pdf', async (c) => {
    const deliveryId = c.req.param('id')
    const jobId = await queue.enqueue({
      type: 'generate-pdf',
      data: { deliveryId }
    })
    return c.json({ queued: true, jobId })
  })

  return jobs
}
