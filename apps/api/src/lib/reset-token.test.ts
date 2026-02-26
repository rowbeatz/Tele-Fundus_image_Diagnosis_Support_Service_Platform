import { describe, expect, it } from 'vitest'
import { generateResetToken, hashResetToken } from './reset-token'

describe('reset token', () => {
  it('generates token and stable hash', () => {
    const token = generateResetToken()
    const hash1 = hashResetToken(token)
    const hash2 = hashResetToken(token)

    expect(token.length).toBeGreaterThan(10)
    expect(hash1).toBe(hash2)
  })
})
