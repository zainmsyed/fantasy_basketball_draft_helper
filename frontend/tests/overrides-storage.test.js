import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { saveOverrides, loadOverrides } from '../src/utils/storage.js'

describe('overrides storage', () => {
  const OLD = global.localStorage
  beforeEach(() => {
    const store = {}
    global.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v },
      removeItem: (k) => { delete store[k] },
    }
  })
  afterEach(() => {
    global.localStorage = OLD
  })

  it('saves and loads overrides', () => {
    const overrides = [{ key: 'John Doe', selected: 'JD123' }]
    expect(saveOverrides(overrides)).toBe(true)
    const got = loadOverrides()
    expect(Array.isArray(got)).toBe(true)
    expect(got[0].key).toBe('John Doe')
  })
})
