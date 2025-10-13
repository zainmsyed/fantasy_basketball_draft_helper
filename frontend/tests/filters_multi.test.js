import { describe, it, expect } from 'vitest'
import { filterByPosition } from '../src/utils/filters.js'

describe('multi-position filtering', () => {
  const players = [
    { name: 'A', positions: ['PG', 'SG'] },
    { name: 'B', positions: ['SF'] },
    { name: 'C', positions: ['C', 'PF'] },
  ]

  it('returns players matching any selected position', () => {
    const res = filterByPosition(players, ['PG', 'C'])
    expect(res.map((p) => p.name).sort()).toEqual(['A', 'C'])
  })
})
