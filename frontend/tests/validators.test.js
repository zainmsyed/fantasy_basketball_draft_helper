import { describe, it, expect } from 'vitest'
import { validatePlayer, validateBundle } from '../src/utils/validators.js'

describe('validators', () => {
  it('validates player object', () => {
    const p = { id: '1', name: 'Test', positions: ['PG'], stats: { gp: 10 } }
    expect(validatePlayer(p)).toBe(true)
  })

  it('rejects invalid player', () => {
    expect(validatePlayer({})).toBe(false)
  })

  it('validates bundle', () => {
    const b = { players: [{ id: '1', name: 'A', positions: ['C'], stats: { gp: 1 } }] }
    expect(validateBundle(b)).toBe(true)
  })
})
