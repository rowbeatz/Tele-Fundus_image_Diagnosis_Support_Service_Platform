import type { Context, Next } from 'hono'

type RateLimitOption = {
  keyPrefix: string
  windowMs: number
  maxRequests: number
}

type Counter = {
  count: number
  windowStart: number
}

const memoryCounter = new Map<string, Counter>()

export function rateLimit(option: RateLimitOption) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') ?? 'unknown'
    const key = `${option.keyPrefix}:${ip}`
    const now = Date.now()
    const current = memoryCounter.get(key)

    if (!current || now - current.windowStart > option.windowMs) {
      memoryCounter.set(key, { count: 1, windowStart: now })
      await next()
      return
    }

    if (current.count >= option.maxRequests) {
      return c.json(
        {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.'
        },
        429
      )
    }

    current.count += 1
    memoryCounter.set(key, current)
    await next()
  }
}
