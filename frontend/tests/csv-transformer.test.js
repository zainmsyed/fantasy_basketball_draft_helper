import { describe, it, expect } from 'vitest'
import { transformRowToUploaded, validateMappingComplete } from '../src/modules/data/csv-transformer.js'

describe('csv-transformer', () => {
  it('normalizes percentages and numeric stats', () => {
    const row = { 'Player': 'Jane', 'Team': 'TOR', 'Pos': 'PG', 'fg_pct': '54', 'pts': '12' }
    const mapping = { playerNameColumn: 'Player', teamColumn: 'Team', positionColumn: 'Pos', statsColumns: { fg_pct: 'fg_pct', pts: 'pts' } }
    const up = transformRowToUploaded(row, mapping)
    expect(up.name).toBe('Jane')
    expect(up.team).toBe('TOR')
    expect(up.positions).toEqual(['PG'])
    expect(up.projectedStats.fg_pct).toBeCloseTo(0.54)
    expect(up.projectedStats.pts).toBe(12)
  })

  it('validates mapping completeness', () => {
    expect(validateMappingComplete({ playerNameColumn: 'a', teamColumn: 'b', positionColumn: 'c' })).toBe(true)
    expect(validateMappingComplete({ playerNameColumn: 'a', teamColumn: null, positionColumn: 'c' })).toBe(false)
  })
})
