import { describe, it, expect, beforeEach } from 'vitest'
import { createDraftHelperStore } from '../src/modules/ui/alpine-store.js'
import { loadOverrides } from '../src/utils/storage.js'

function createMockStorage() {
  let store = {}
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key, value) {
      store[key] = String(value)
    },
    removeItem(key) {
      delete store[key]
    },
    clear() { store = {} }
  }
}

describe('integration: merge -> upload -> overrides persistence', () => {
  beforeEach(() => {
    global.localStorage = createMockStorage()
  })

  it('saves integrated players and persists overrides after confirmUpload', async () => {
    const store = createDraftHelperStore()
    // mock mappingPreview with one matched and one unmatched, with alternatives
    store.mappingPreview = [
      { csvPlayer: { name: 'John Doe' }, historicalMatch: { id: 'h1', name: 'Hist1', stats: { pts: 10 } }, confidence: 95 },
      { csvPlayer: { name: 'Jane Roe' }, historicalMatch: null, alternatives: [ { player: { id: 'h2', name: 'Hist2' }, confidence: 70 } ], confidence: 50 }
    ]

    // apply a manual override on second entry before saving
    store.openOverride(1)
    store.setOverrideChoice(0)
    const applied = store.applyOverride()
    expect(applied).toBe(true)

    // perform confirmUpload -> should persist integrated players
    const ok = await store.confirmUpload()
    expect(ok).toBe(true)
    // check that integrated players were saved to localStorage under key draft_helper:integrated_players
    const raw = global.localStorage.getItem('draft_helper:integrated_players')
    expect(raw).not.toBeNull()
    const integrated = JSON.parse(raw)
    expect(Array.isArray(integrated)).toBe(true)
    expect(integrated.length).toBe(2)

    const overrides = loadOverrides()
    expect(Array.isArray(overrides)).toBe(true)
    expect(overrides.length).toBe(1)
    expect(overrides[0].key).toBe('Jane Roe')
  })
})
