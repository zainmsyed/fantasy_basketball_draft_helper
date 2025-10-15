import { UI } from '../config/constants.js'

const MAPPING_KEY = 'draft_helper:column_mapping';

const INTEGRATED_KEY = 'draft_helper:integrated_players';
const VALIDATION_KEY = 'draft_helper:validation_report';

export function saveColumnMapping(mapping) {
  try {
    const payload = Object.assign({}, mapping, { savedAt: new Date().toISOString() })
    localStorage.setItem(MAPPING_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('Failed to save mapping', e);
    return false;
  }
}

export function loadColumnMapping() {
  try {
    const raw = localStorage.getItem(MAPPING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function checkStorageQuota() {
  if (!navigator.storage || !navigator.storage.estimate) return { available: true, usage: 0, quota: 0 };
  const estimate = await navigator.storage.estimate();
  const usagePercent = estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0;
  return {
    available: usagePercent < 100,
    warning: usagePercent >= 80,
    usage: estimate.usage || 0,
    quota: estimate.quota || 0,
    usagePercent: Math.round(usagePercent)
  };
}

export async function saveIntegratedPlayers(players) {
  const key = 'draft_helper:integrated_players';
  try {
    const payload = JSON.stringify(players);
    // simple quota check
    const quota = await checkStorageQuota();
    if (!quota.available) throw new Error('Storage quota exceeded');
    localStorage.setItem(key, payload);
    return true;
  } catch (e) {
    console.warn('Failed to save integrated players', e);
    throw e;
  }
}

export function loadIntegratedPlayers() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const raw = localStorage.getItem(INTEGRATED_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export async function loadHistoricalStats(url = '/data/last_year_stats.json', attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Some dev servers may return an HTML index page for unknown paths; detect and fail fast
      const contentType = res.headers && res.headers.get ? (res.headers.get('content-type') || '') : null
      // If content-type header is missing (e.g., in tests), don't enforce the check
      if (contentType && contentType.indexOf('application/json') === -1 && contentType.indexOf('text/json') === -1) {
        throw new Error(`Unexpected content-type: ${contentType}`)
      }
      const json = await res.json();
      // cache raw for tests/back-compat
      try { localStorage.setItem('draft_helper:historical_stats', JSON.stringify(json)); } catch (e) { /* ignore */ }
      return json;
    } catch (e) {
      lastErr = e;
      // small delay between attempts (non-blocking in tests)
      await new Promise(r => setTimeout(r, 100));
    }
  }
  // As a last resort, attempt dynamic import of sample data (works in test/dev without network)
  try {
    // runtime fallback: try sample served from public
    const res2 = await fetch('/data/sample-2024.json')
    if (res2 && res2.ok) {
      const j = await res2.json()
      try { localStorage.setItem('draft_helper:historical_stats', JSON.stringify(j)); } catch {}
      return j
    }
  } catch {}
  try {
    // test/dev fallback: dynamic import sample (Vite supports JSON imports without assertion)
    const mod = await import('../data/sample-2024.json')
    const j = (mod && (mod.default || mod)) || null
    if (j) return j
  } catch {}
  // if all fallbacks fail, rethrow last network error
  throw lastErr
}

// Helper to normalize historical data into an array of player objects for name-matching
export function normalizeHistoricalList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.players)) return data.players
  if (typeof data === 'object') return Object.values(data)
  return []
}
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

const OVERRIDES_KEY = 'draft_helper:overrides'

export function saveOverrides(overrides) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides || []))
      return true
    }
  } catch (e) {
    // ignore
  }
  return false
}

export function loadOverrides() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const raw = localStorage.getItem(OVERRIDES_KEY)
      if (!raw) return []
      return JSON.parse(raw)
    }
  } catch (e) {
    // ignore
  }
  return []
}

export function saveValidationReport(report) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      const payload = Object.assign({}, report, { savedAt: new Date().toISOString() })
      localStorage.setItem(VALIDATION_KEY, JSON.stringify(payload))
      return true
    }
  } catch (e) {
    console.warn('Failed to save validation report', e)
  }
  return false
}

export function loadValidationReport() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const raw = localStorage.getItem(VALIDATION_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    }
  } catch (e) {}
  return null
}

export function clearUploadData() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
      localStorage.removeItem(INTEGRATED_KEY)
      localStorage.removeItem(MAPPING_KEY)
      localStorage.removeItem(VALIDATION_KEY)
      localStorage.removeItem(OVERRIDES_KEY)
      return true
    }
  } catch (e) {
    console.warn('clearUploadData failed', e)
  }
  return false
}
