import { describe, it, expect } from 'vitest';
import { matchPlayers } from '../src/modules/data/name-matcher';

const historical = [
  { name: 'LeBron James', team: 'LAL' },
  { name: 'Stephen Curry', team: 'GSW' },
  { name: 'Nikola Jokic', team: 'DEN' }
];

describe('name-matcher', () => {
  it('returns exact match for identical names', () => {
    const csv = [{ name: 'LeBron James', team: 'LAL' }];
    const res = matchPlayers(csv, historical);
    expect(res[0].confidence).toBe(100);
    expect(res[0].matchType).toBe('exact');
    expect(res[0].historicalMatch.name).toBe('LeBron James');
  });

  it('handles accented names and fuzzy matches', () => {
    const csv = [{ name: 'Nikola Jokić', team: 'DEN' }];
    const res = matchPlayers(csv, historical);
    expect(res[0].confidence).toBeGreaterThan(80);
    expect(res[0].historicalMatch.name).toBe('Nikola Jokic' || 'Nikola Jokic');
  });

  it('uses team as tiebreaker when multiple similar names', () => {
    const hist = [
      { name: 'John Doe', team: 'AAA' },
      { name: 'John Doe', team: 'BBB' }
    ];
    const csv = [{ name: 'John Doe', team: 'BBB' }];
    const res = matchPlayers(csv, hist);
    expect(res[0].historicalMatch.team).toBe('BBB');
  });
});
