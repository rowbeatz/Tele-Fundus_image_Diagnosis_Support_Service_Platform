import { describe, expect, it } from 'vitest'
import { sha256FromBuffer } from './file-hash'

describe('file hash', () => {
  it('returns deterministic sha256', async () => {
    const a = await sha256FromBuffer(Buffer.from('abc'))
    const b = await sha256FromBuffer(Buffer.from('abc'))
    expect(a).toBe(b)
  })
})
