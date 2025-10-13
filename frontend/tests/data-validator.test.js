import { describe, it, expect } from 'vitest'
import { validateSinglePlayer, countNonNullStats, SEVERITY } from '../src/modules/data/data-validator'

describe('data-validator', () => {
  it('flags missing name and position as errors', () => {
    const player = { name: '', position: '', projectedStats: {} }
    const issues = validateSinglePlayer(player)
    const codes = issues.map(i => i.code)
    expect(codes).toContain('MISSING_NAME')
    expect(codes).toContain('MISSING_POSITION')
  })

  it('counts non-null stats correctly', () => {
    const player = { projectedStats: { pts: 10, ast: null, reb: 5, stl: 0, blk: undefined } }
    const count = countNonNullStats(player)
    expect(count).toBe(3)
  })

  it('adds warning when few stats', () => {
    const player = { name: 'Joe', position: 'G', projectedStats: { pts: 1, ast: null } }
    const issues = validateSinglePlayer(player)
    const warning = issues.find(i => i.code === 'FEW_STATS')
    expect(warning).toBeTruthy()
    expect(warning.severity).toBe(SEVERITY.WARNING)
  })
})
