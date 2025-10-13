import { describe, it, expect } from 'vitest';
import { normalizeName, normalizePercentage } from '../src/utils/string-utils';

describe('string-utils', () => {
  it('normalizes accented names and whitespace', () => {
    const input = '  Nikola Jokić  ';
    const out = normalizeName(input);
    expect(out).toBe('nikola jokic');
  });

  it('converts whole-number percentages to decimal', () => {
    expect(normalizePercentage('54')).toBeCloseTo(0.54);
    expect(normalizePercentage(0.54)).toBeCloseTo(0.54);
    expect(normalizePercentage('')).toBeNull();
  });
});
