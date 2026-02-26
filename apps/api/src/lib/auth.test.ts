import { describe, expect, it } from 'vitest'
import { canAccess } from './auth'

describe('canAccess role utility', () => {
  it('allows access if no roles required', () => {
    expect(canAccess(['client_user'], [])).toBe(true)
  })

  it('allows admin unconditionally', () => {
    expect(canAccess(['admin'], ['accounting'])).toBe(true)
    expect(canAccess(['client_user', 'admin'], ['ops_reception'])).toBe(true)
  })

  it('allows access if user has one of the allowed roles', () => {
    expect(canAccess(['client_user'], ['client_admin', 'client_user'])).toBe(true)
  })

  it('denies access if user lacks allowed roles', () => {
    expect(canAccess(['client_user'], ['accounting', 'ops_reception'])).toBe(false)
  })

  it('denies access for empty user roles if role required', () => {
    expect(canAccess([], ['client_user'])).toBe(false)
  })
})
