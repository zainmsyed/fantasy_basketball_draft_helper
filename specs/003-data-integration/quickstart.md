# Quickstart: Data Integration

**Feature**: 003-data-integration  
**Date**: 2025-10-13

## Overview

This guide helps developers quickly understand and start working on the Data Integration feature.

---

## What This Feature Does

Enables users to:
1. Upload CSV files with player rankings and projections
2. Automatically match players to historical statistics
3. Validate data completeness with smart warnings
4. Store integrated data for use in rankings

**User Flow**: CSV Upload → Column Mapping → Name Matching → Validation → Storage

---

## Quick Architecture

```
CSV File
   ↓
csv-parser (PapaParse) → detects columns
   ↓
column-mapper UI → user maps fields
   ↓
name-matcher (Fuse.js) → fuzzy matching
   ↓
data-merger → combine CSV + historical
   ↓
data-validator → check completeness
   ↓
storage → localStorage
```

**Key Modules**:
- `csv-parser.js`: Parse CSV files
- `name-matcher.js`: Fuzzy string matching
- `data-merger.js`: Combine data sources
- `data-validator.js`: Quality checks
- `column-mapper.js`: Mapping UI (Alpine.js)
- `validation-reporter.js`: Results UI (Alpine.js)

---

## Development Setup

### Prerequisites

```bash
# Node.js 18+ and npm already installed (from foundation phase)
cd frontend/

# Install new dependencies
npm install papaparse fuse.js uuid
```

### Directory Structure

```
frontend/src/
├── modules/
│   ├── data/
│   │   ├── csv-parser.js          ← Start here
│   │   ├── name-matcher.js
│   │   ├── data-merger.js
│   │   └── data-validator.js
│   └── ui/
│       ├── column-mapper.js       ← Alpine component
│       └── validation-reporter.js
├── utils/
│   ├── storage.js                 ← localStorage helpers
│   └── string-utils.js            ← Normalization functions
└── types/
    └── player.d.ts                ← TypeScript definitions
```

---

## Start Coding (P1 Stories)

### Story 1: CSV Upload & Parsing (1-2 days)

**Goal**: User can upload CSV, see preview of data

**Files to create**:
1. `src/modules/data/csv-parser.js`
2. `tests/csv-parser.test.js`

**Key function**:
```javascript
// src/modules/data/csv-parser.js
import Papa from 'papaparse';

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error)
    });
  });
}
```

**Test it**:
```bash
npm test -- csv-parser.test.js
```

**Success criteria**:
- ✅ Can parse sample CSV from `tests/fixtures/sample-players.csv`
- ✅ Detects column names correctly
- ✅ Returns structured data array
- ✅ Handles parsing errors gracefully

---

### Story 2: Column Mapping UI (1-2 days)

**Goal**: User maps CSV columns to system fields

**Files to create**:
1. `src/modules/ui/column-mapper.js`
2. Update `index.html` with mapping UI

**Key Alpine.js component**:
```javascript
// src/modules/ui/column-mapper.js
export function createColumnMapper() {
  return {
    csvColumns: [],
    mapping: {},
    
    init() {
      // Load saved mapping if exists
      this.loadSavedMapping();
    },
    
    updateMapping(field, column) {
      this.mapping[field] = column;
      this.checkComplete();
    },
    
    checkComplete() {
      const required = ['playerName', 'team', 'position', 'rank', ...statFields];
      return required.every(f => this.mapping[f]);
    }
  };
}
```

**HTML integration**:
```html
<div x-data="columnMapper()">
  <select x-model="mapping.playerName">
    <option value="">Select column...</option>
    <template x-for="col in csvColumns">
      <option :value="col" x-text="col"></option>
    </template>
  </select>
</div>
```

**Success criteria**:
- ✅ Displays dropdown for each required field
- ✅ Updates preview when mapping changes
- ✅ Disables "Confirm" until all fields mapped
- ✅ Saves mapping to localStorage

---

### Story 3: Name Matching (1-2 days)

**Goal**: Automatically match CSV players to historical data

**Files to create**:
1. `src/modules/data/name-matcher.js`
2. `src/utils/string-utils.js`
3. `tests/name-matcher.test.js`

**Key functions**:
```javascript
// src/utils/string-utils.js
export function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// src/modules/data/name-matcher.js
import Fuse from 'fuse.js';

export function matchPlayers(csvPlayers, historicalData) {
  const historicalList = Object.values(historicalData);
  const fuse = new Fuse(historicalList, {
    keys: ['name'],
    threshold: 0.15,  // 85% similarity
    includeScore: true
  });
  
  return csvPlayers.map(csvPlayer => {
    const results = fuse.search(csvPlayer.name);
    
    if (results.length === 0) {
      return { csvPlayer, historicalMatch: null, confidence: 0, matchType: 'none' };
    }
    
    const topMatch = results[0];
    const confidence = Math.round((1 - topMatch.score) * 100);
    
    return {
      csvPlayer,
      historicalMatch: topMatch.item,
      confidence,
      matchType: confidence === 100 ? 'exact' : 'fuzzy'
    };
  });
}
```

**Test it**:
```javascript
// tests/name-matcher.test.js
import { matchPlayers } from '../src/modules/data/name-matcher';

test('exact match returns 100% confidence', () => {
  const csv = [{ name: 'LeBron James', team: 'LAL' }];
  const historical = { 'LeBron James': { name: 'LeBron James', pts: 25.7 } };
  
  const results = matchPlayers(csv, historical);
  
  expect(results[0].confidence).toBe(100);
  expect(results[0].matchType).toBe('exact');
});
```

**Success criteria**:
- ✅ Exact matches return 100% confidence
- ✅ Case variations match successfully
- ✅ Accented characters normalized (Jokić matches Jokic)
- ✅ Unmatched players return null with 0% confidence

---

## Test Data

### Sample CSV

Located at: `tests/fixtures/sample-players.csv`

```csv
Player Name,Team,Position,Rank,Proj PTS,Proj AST,Proj REB,Proj 3PM,Proj FG%,Proj FT%,Proj STL,Proj BLK,Proj TO
LeBron James,LAL,SF/PF,15,24.5,7.0,8.0,1.9,51.0,74.0,1.2,0.5,3.3
Stephen Curry,GSW,PG,8,28.2,6.5,5.1,4.8,46.2,91.5,1.6,0.4,3.1
Nikola Jokic,DEN,C,1,26.8,9.2,12.1,0.8,63.2,82.5,1.3,0.7,3.2
```

### Sample Historical Data

Located at: `frontend/src/data/sample-2024.json`

```json
{
  "LeBron James": {
    "team": "LAL",
    "gp": 71,
    "pts": 25.7,
    "ast": 7.3,
    "reb": 8.3,
    "threes": 2.1,
    "fg_pct": 0.504,
    "ft_pct": 0.750,
    "fga": 19.5,
    "fta": 6.8,
    "stl": 1.3,
    "blk": 0.6,
    "to": 3.5
  }
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific module tests
npm test -- csv-parser.test.js
npm test -- name-matcher.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (during development)
npm test -- --watch
```

---

## Performance Targets

```javascript
// Use these benchmarks in performance tests
const PERFORMANCE_TARGETS = {
  csvParsing: 3000,        // 3 seconds for 200 players
  nameMatching: 1000,      // 1 second for 200 players
  validation: 100,         // 100ms
  storageWrite: 500        // 500ms
};

// Example performance test
test('parses 200-player CSV under 3 seconds', async () => {
  const start = Date.now();
  const result = await parseCSV(largeCsvFile);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(PERFORMANCE_TARGETS.csvParsing);
  expect(result.data.length).toBe(200);
});
```

---

## Common Issues & Solutions

### Issue 1: PapaParse not detecting headers

**Symptom**: First row appears in data instead of as column names

**Solution**:
```javascript
Papa.parse(file, {
  header: true,  // ← Ensure this is set
  skipEmptyLines: true
});
```

### Issue 2: Fuzzy matching too aggressive

**Symptom**: Wrong players matching with high confidence

**Solution**: Adjust Fuse.js threshold
```javascript
const fuse = new Fuse(data, {
  threshold: 0.10  // Stricter (was 0.15)
});
```

### Issue 3: localStorage quota exceeded

**Symptom**: Error when saving integrated players

**Solution**: Check quota before writing
```javascript
const quota = await checkStorageQuota();
if (!quota.available) {
  alert('Storage full. Clear old drafts.');
  return;
}
```

---

## Next Steps (P2 Stories)

After completing P1 stories:

1. **Data Validation** (1 day)
   - Implement validation rules
   - Add three-tier severity system
   - Create validation reporter UI

2. **Edge Case Handling** (1 day)
   - Manual match overrides for low confidence
   - Duplicate name disambiguation
   - Special character handling

3. **Integration Testing** (0.5 days)
   - End-to-end upload workflow
   - Test with real CSV files from Yahoo/ESPN
   - Performance benchmarks

---

## Debugging Tips

### Enable verbose logging

```javascript
// Add to csv-parser.js for debugging
Papa.parse(file, {
  // ... other options
  error: (error, file) => {
    console.error('CSV Parse Error:', error);
    console.log('File:', file.name);
  },
  complete: (results) => {
    console.log('Parsed rows:', results.data.length);
    console.log('Columns detected:', results.meta.fields);
    console.log('Errors:', results.errors);
  }
});
```

### Test with sample data in console

```javascript
// Run in browser console after loading app
import { matchPlayers } from './modules/data/name-matcher.js';

const testPlayers = [
  { name: 'lebron james', team: 'LAL' },
  { name: 'Nikola Jokić', team: 'DEN' }
];

const historicalData = await fetch('/data/sample-2024.json').then(r => r.json());

const results = matchPlayers(testPlayers, historicalData);
console.table(results);
```

---

## Resources

### Documentation
- [PapaParse Docs](https://www.papaparse.com/docs)
- [Fuse.js Guide](https://fusejs.io/)
- [Alpine.js Essentials](https://alpinejs.dev/essentials/installation)

### Reference Files
- [spec.md](./spec.md) - Full feature specification
- [data-model.md](./data-model.md) - Entity definitions
- [module-interfaces.md](./contracts/module-interfaces.md) - API contracts
- [research.md](./research.md) - Technical decisions

### Related Features
- `001-data-preparation-last` - Python script that generates historical stats
- `002-foundation` - Base Alpine.js + Tailwind setup

---

## Getting Help

- **Constitution violations?** Check `.specify/memory/constitution.md`
- **Module design questions?** See `contracts/module-interfaces.md`
- **Data structure unclear?** Reference `data-model.md`
- **Stuck on implementation?** Review `research.md` for best practices

---

## Summary Checklist

Before marking P1 complete:
- [ ] CSV parsing works with sample data
- [ ] Column mapping UI functional
- [ ] Name matching achieves >90% match rate
- [ ] Tests passing for all modules
- [ ] Performance targets met
- [ ] localStorage persistence working
- [ ] No Constitution violations
- [ ] Code reviewed and documented

Estimated total time: **3-4 days** for P1 stories.
