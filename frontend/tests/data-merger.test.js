import { describe, it, expect } from 'vitest'
import { mergeFromPreview } from '../src/modules/data/data-merger.js'

describe('data-merger', () => {
  it('merges a preview result with historical match', () => {
    const preview = [{
      csvPlayer: { name: 'John Doe', team: 'NYK', position: 'PG', stats: { pts: 10 } },
      historicalMatch: { name: 'John Doe', stats: { pts: 12 } },
      confidence: 95
    }]
    const out = mergeFromPreview(preview)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('John Doe')
    expect(out[0].team).toBe('NYK')
    expect(out[0].hasHistoricalData).toBe(true)
    expect(out[0].historicalStats).toEqual({ pts: 12 })
    expect(typeof out[0].id).toBe('string')
  })

  it('handles unmatched preview results', () => {
    const preview = [{ csvPlayer: { name: 'Rookie Player', stats: { pts: 0 } }, historicalMatch: null, confidence: 0 }]
    const out = mergeFromPreview(preview)
    expect(out[0].hasHistoricalData).toBe(false)
    expect(out[0].historicalStats).toBeNull()
  })
})
