import { describe, it, expect } from 'vitest';
import { createColumnMapper } from '../src/modules/ui/column-mapper';

describe('column-mapper', () => {
  it('auto-detects common columns', () => {
    const cols = ['Player Name', 'Team', 'Position', 'Rank', 'Proj PTS'];
    const mapper = createColumnMapper(cols);
    mapper.init();
    expect(mapper.mapping.playerNameColumn).toBe('Player Name');
    expect(mapper.mapping.teamColumn).toBe('Team');
    expect(mapper.isComplete()).toBe(true);
  });

  it('isComplete returns false when required missing', () => {
    const cols = ['Player Name', 'Proj PTS'];
    const mapper = createColumnMapper(cols);
    mapper.init();
    expect(mapper.isComplete()).toBe(false);
  });
});
