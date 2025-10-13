import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadHistoricalStats, saveIntegratedPlayers } from '../src/utils/storage';

describe('storage historical loader', () => {
  const sample = { 'LeBron James': { pts: 25.7 } };
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(sample) }));
    // Provide a simple localStorage mock if not available in the test environment
    if (typeof localStorage === 'undefined' || localStorage === null) {
      global.localStorage = (function () {
        let store = {};
        return {
          getItem(key) { return store[key] || null; },
          setItem(key, value) { store[key] = String(value); },
          removeItem(key) { delete store[key]; },
          clear() { store = {}; }
        };
      })();
    }
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it('loads historical stats and caches them', async () => {
    const data = await loadHistoricalStats('/data/last_year_stats.json', 2);
    expect(data['LeBron James'].pts).toBe(25.7);
    const cached = JSON.parse(localStorage.getItem('draft_helper:historical_stats'));
    expect(cached['LeBron James'].pts).toBe(25.7);
  });

  it('saveIntegratedPlayers stores to localStorage', async () => {
    const players = [{ id: '1', name: 'Test' }];
    const ok = await saveIntegratedPlayers(players);
    expect(ok).toBe(true);
    const raw = JSON.parse(localStorage.getItem('draft_helper:integrated_players'));
    expect(raw[0].name).toBe('Test');
  });
});
