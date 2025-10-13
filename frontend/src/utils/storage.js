export function loadUIState() {
  // Attempt to read from localStorage, then sessionStorage, then in-memory fallback.
  try {
    if (typeof loadUIState._inMemoryStore === 'undefined') loadUIState._inMemoryStore = {}
    try {
      const raw = (typeof localStorage !== 'undefined' && localStorage.getItem) ? localStorage.getItem('draft_helper_state') : null
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore and fall through to sessionStorage
    }
    try {
      const raw2 = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem) ? sessionStorage.getItem('draft_helper_state') : null
      if (raw2) return JSON.parse(raw2)
    } catch (e) {
      // ignore and fall through to in-memory
    }
    const mem = loadUIState._inMemoryStore['draft_helper_state'] || null
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
        localStorage.setItem('draft_helper_state', payload)
        return
      }
    } catch (e) {
      // ignore and try sessionStorage
    }
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.setItem) {
        sessionStorage.setItem('draft_helper_state', payload)
        return
      }
    } catch (e) {
      // ignore and fall back to in-memory
    }
    // in-memory fallback
    if (typeof loadUIState._inMemoryStore === 'undefined') loadUIState._inMemoryStore = {}
    loadUIState._inMemoryStore['draft_helper_state'] = payload
  } catch (err) {
    console.warn('saveUIState failed', err)
  }
}

export function isPersistentStorageAvailable() {
  // Test whether localStorage is writable. We prefer localStorage but accept sessionStorage as fallback.
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem && localStorage.removeItem) {
      const k = '__draft_helper_test__'
      try {
        localStorage.setItem(k, '1')
        localStorage.removeItem(k)
        return true
      } catch (e) {
        // localStorage exists but not writable
      }
    }
  } catch (e) {}
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.setItem && sessionStorage.removeItem) {
      const k = '__draft_helper_test__'
      try {
        sessionStorage.setItem(k, '1')
        sessionStorage.removeItem(k)
        return true
      } catch (e) {
        // sessionStorage not writable either
      }
    }
  } catch (e) {}
  return false
}
