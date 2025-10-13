import { UI } from '../config/constants.js'
export function loadUIState() {
  // Attempt to read from localStorage, then sessionStorage, then in-memory fallback.
  try {
    if (typeof loadUIState._inMemoryStore === 'undefined') loadUIState._inMemoryStore = {}
    try {
      const raw =
        typeof localStorage !== 'undefined' && localStorage.getItem
          ? localStorage.getItem(UI.STORAGE_KEY)
          : null
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore and fall through to sessionStorage
    }
    try {
      const raw2 =
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem
          ? sessionStorage.getItem(UI.STORAGE_KEY)
          : null
      if (raw2) return JSON.parse(raw2)
    } catch {
      // ignore and fall through to in-memory
    }
    const mem = loadUIState._inMemoryStore[UI.STORAGE_KEY] || null
    return mem ? JSON.parse(mem) : null
  } catch (err) {
    console.warn('loadUIState failed', err)
    return null
  }
}

export function saveUIState(state) {
  try {
    const payload = JSON.stringify(state)
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(UI.STORAGE_KEY, payload)
        return
      }
    } catch {
      // ignore and try sessionStorage
    }
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.setItem) {
        sessionStorage.setItem(UI.STORAGE_KEY, payload)
        return
      }
    } catch {
      // ignore and fall back to in-memory
    }
    // in-memory fallback
    if (typeof loadUIState._inMemoryStore === 'undefined') loadUIState._inMemoryStore = {}
    loadUIState._inMemoryStore[UI.STORAGE_KEY] = payload
  } catch (err) {
    console.warn('saveUIState failed', err)
  }
}

export function isPersistentStorageAvailable() {
  // Test whether localStorage is writable. We prefer localStorage but accept sessionStorage as fallback.
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem && localStorage.removeItem) {
      const k = UI.STORAGE_TEST_KEY
      try {
        localStorage.setItem(k, '1')
        localStorage.removeItem(k)
        return true
        } catch {
          // localStorage exists but not writable
      }
    }
    } catch {}
  try {
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.setItem &&
      sessionStorage.removeItem
    ) {
      const k = UI.STORAGE_TEST_KEY
      try {
        sessionStorage.setItem(k, '1')
        sessionStorage.removeItem(k)
        return true
      } catch {
          // sessionStorage not writable either
      }
    }
  } catch {}
  return false
}
