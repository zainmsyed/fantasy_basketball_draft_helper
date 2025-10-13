import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseCSV } from '../src/modules/data/csv-parser';

describe('csv-parser', () => {
  it('parses sample-players.csv and detects columns', async () => {
    const csvPath = path.resolve(__dirname, 'fixtures', 'sample-players.csv');
    const csv = fs.readFileSync(csvPath, 'utf8');
    const res = await parseCSV(csv);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.meta.columns).toContain('Player Name');
  });
});
