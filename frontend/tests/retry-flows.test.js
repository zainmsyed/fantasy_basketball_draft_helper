import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDraftHelperStore } from '../src/modules/ui/alpine-store.js'
import * as storage from '../src/utils/storage.js'

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

describe('retry flows', () => {
  beforeEach(() => {
    global.localStorage = createMockStorage()
    // restore any spies
    vi.restoreAllMocks()
  })

  it('retryParse uses lastCSVText and clears errorContext on success', async () => {
    const store = createDraftHelperStore()
    // simulate that lastCSVText was set previously
    store.lastCSVText = 'name,team\nJohn Doe,NYK'
    // spy on loadCSVFromString to ensure it's called
    const spy = vi.spyOn(store, 'loadCSVFromString')
    // call retryParse
    const ok = await store.retryParse()
    expect(ok).toBe(true)
    expect(spy).toHaveBeenCalledWith(store.lastCSVText)
    expect(store.errorContext).toBeNull()
  })

  it('retrySave retries confirmUpload and preserves success path', async () => {
    const store = createDraftHelperStore()
    // prepare a fake integrated list
    store.lastIntegratedPlayers = [{ id: 'p1', name: 'A' }]
    // spy on confirmUpload to simulate first failing then succeed
    const confirm = vi.spyOn(store, 'confirmUpload')
    confirm.mockImplementationOnce(async () => { throw new Error('transient') })
    confirm.mockImplementationOnce(async () => true)

    // first retrySave should catch failure and set errorContext
    const first = await store.retrySave()
    // confirmUpload will throw -> retrySave returns false
    expect(first).toBe(false)
    expect(store.errorContext).toBe('save')

    // second attempt should call confirmUpload which now resolves true
    const second = await store.retrySave()
    expect(second).toBe(true)
    expect(store.errorContext).toBeNull()
  })

  it('retrySaveAfterClear clears storage and retries save', async () => {
    const store = createDraftHelperStore()
    store.lastIntegratedPlayers = [{ id: 'p2', name: 'B' }]
    // spy on clearUploadData and confirmUpload
    const clearSpy = vi.spyOn(storage, 'clearUploadData')
    clearSpy.mockImplementation(() => true)
    const confirm = vi.spyOn(store, 'confirmUpload')
    confirm.mockImplementation(async () => true)

    const ok = await store.retrySaveAfterClear()
    expect(clearSpy).toHaveBeenCalled()
    expect(ok).toBe(true)
  })
})
