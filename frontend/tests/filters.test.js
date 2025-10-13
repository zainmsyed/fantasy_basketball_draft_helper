import { describe, it, expect } from 'vitest'
import { searchPlayers, filterByPosition } from '../src/utils/filters.js'

describe('filters utilities', () => {
  const players = [
    { name: 'LeBron James', positions: ['SF', 'PF'] },
    { name: 'Stephen Curry', positions: ['PG'] },
  ]

  it('searchPlayers finds by name case-insensitive', () => {
    const res = searchPlayers(players, 'lebron')
    expect(res.length).toBe(1)
    expect(res[0].name).toBe('LeBron James')
  })

  it('filterByPosition matches positions', () => {
    const res = filterByPosition(players, ['PG'])
    expect(res.length).toBe(1)
    expect(res[0].name).toBe('Stephen Curry')
  })
})
