import { describe, it, expect, beforeEach } from 'vitest'
import { loadUIState, saveUIState } from '../src/utils/storage.js'

function createMockStorage() {
  let store = {}
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null },
    setItem(key, value) { store[key] = String(value) },
    removeItem(key) { delete store[key] },
    clear() { store = {} }
  }
}

describe('storage fallback', () => {
  beforeEach(() => {
    // provide globals for test environment
    global.localStorage = createMockStorage()
    global.sessionStorage = createMockStorage()
  })

  it('saves to sessionStorage when localStorage throws', () => {
    const orig = global.localStorage.setItem
    global.localStorage.setItem = () => { throw new Error('quota') }
    saveUIState({ a: 1 })
    expect(global.sessionStorage.getItem('draft_helper_state')).not.toBeNull()
    global.localStorage.setItem = orig
  })

  it('loads null when nothing set', () => {
    expect(loadUIState()).toBeNull()
  })
})
