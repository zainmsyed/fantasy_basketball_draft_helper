import { describe, it, expect, beforeEach } from 'vitest';
import { createColumnMapper } from '../src/modules/ui/column-mapper';

beforeEach(() => {
  // ensure localStorage mock exists
  if (typeof localStorage === 'undefined' || !localStorage) {
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

describe('column-mapper persistence', () => {
  it('saves and auto-applies saved mapping when columns match', async () => {
    const cols = ['Player Name', 'Team', 'Position', 'Rank'];
    const mapper = createColumnMapper(cols);
    mapper.init();
    mapper.updateMapping('playerNameColumn', 'Player Name');
    mapper.updateMapping('teamColumn', 'Team');
    mapper.updateMapping('positionColumn', 'Position');
    mapper.updateMapping('rankColumn', 'Rank');
    const ok = mapper.saveMapping();
    expect(ok).toBe(true);

    // New mapper should auto-apply saved mapping
    const mapper2 = createColumnMapper(cols);
    await mapper2.init();
    expect(mapper2.mapping.playerNameColumn).toBe('Player Name');
  });
});
