import { describe, it, expect, beforeEach } from 'vitest'
import { loadUIState, saveUIState } from '../src/utils/storage.js'

describe('in-memory storage fallback', () => {
  beforeEach(() => {
    // Simulate missing storages by deleting globals
    delete global.localStorage
    delete global.sessionStorage
  })

  it('falls back to in-memory when no storages available', () => {
    saveUIState({ foo: 'bar' })
    const loaded = loadUIState()
    expect(loaded).toMatchObject({ foo: 'bar' })
  })
})
