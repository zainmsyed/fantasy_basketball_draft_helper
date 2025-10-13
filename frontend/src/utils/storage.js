const MAPPING_KEY = 'draft_helper:column_mapping';

export function saveColumnMapping(mapping) {
  try {
    localStorage.setItem(MAPPING_KEY, JSON.stringify(mapping));
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

export async function loadHistoricalStats(url = '/data/last_year_stats.json', attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // cache in localStorage
      try { localStorage.setItem('draft_helper:historical_stats', JSON.stringify(json)); } catch (e) { /* ignore */ }
      return json;
    } catch (e) {
      lastErr = e;
      // small delay between attempts (non-blocking in tests)
      await new Promise(r => setTimeout(r, 100));
    }
  }
  throw lastErr;
}
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
