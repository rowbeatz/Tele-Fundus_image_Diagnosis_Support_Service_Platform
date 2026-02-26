export type JobPayload = {
  type: 'generate-pdf' | 'send-delivery-mail' | 'recalc-billing'
  data: Record<string, string>
}

export interface JobQueue {
  enqueue(payload: JobPayload): Promise<string>
  process(handler: (jobId: string, payload: JobPayload) => Promise<void>): Promise<void>
}

export class InMemoryJobQueue implements JobQueue {
  private readonly jobs: Array<{ id: string; payload: JobPayload }> = []

  async enqueue(payload: JobPayload): Promise<string> {
    const id = crypto.randomUUID()
    this.jobs.push({ id, payload })
    return id
  }

  async process(handler: (jobId: string, payload: JobPayload) => Promise<void>): Promise<void> {
    while (this.jobs.length > 0) {
      const job = this.jobs.shift()
      if (!job) continue
      await handler(job.id, job.payload)
    }
  }
}
