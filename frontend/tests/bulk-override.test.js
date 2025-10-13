import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createDraftHelperStore } from '../src/modules/ui/alpine-store.js'
import { saveOverrides, loadOverrides } from '../src/utils/storage.js'

describe('bulkApplyOverride', () => {
  const OLD = global.localStorage
  beforeEach(() => {
    // simple localStorage mock for persistence in tests
    let store = {}
    global.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v },
      removeItem: (k) => { delete store[k] },
    }
  })
  afterEach(() => {
    global.localStorage = OLD
  })

  test('applies override to all_unmatched and persists', () => {
    const store = createDraftHelperStore()
    // mock a mappingPreview with three entries, 2 unmatched and 1 matched
    store.mappingPreview = [
      { csvPlayer: { name: 'A' }, historicalMatch: null, alternatives: [ { player: { id: 'h1', name: 'Hist1' }, confidence: 60 } ] },
      { csvPlayer: { name: 'B' }, historicalMatch: { id: 'h2', name: 'Hist2' }, alternatives: [ { player: { id: 'h2', name: 'Hist2' }, confidence: 98 } ] },
      { csvPlayer: { name: 'C' }, historicalMatch: null, alternatives: [ { player: { id: 'h3', name: 'Hist3' }, confidence: 70 } ] }
    ]

    const applied = store.bulkApplyOverride('all_unmatched', 0)
    expect(applied).toBe(2)

    const saved = loadOverrides()
    // expect two overrides stored for A and C
    const keys = saved.map(s => s.key).sort()
    expect(keys).toEqual(['A','C'])
  })
})
