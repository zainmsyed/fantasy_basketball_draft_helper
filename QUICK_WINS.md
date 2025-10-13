# Quick Wins - Immediate Improvements

**Based on Code Review**: October 12, 2025  
**Time to implement**: ~2-4 hours total

These are high-impact, low-effort improvements you can make right now.

---

## 1. Add ESLint & Prettier (30 minutes)

```bash
cd frontend
npm install -D eslint prettier eslint-config-prettier
```

Create `.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
}
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

Update `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src tests --ext .js",
    "lint:fix": "eslint src tests --ext .js --fix",
    "format": "prettier --write 'src/**/*.{js,css}' 'tests/**/*.js'"
  }
}
```

Run:
```bash
npm run format
npm run lint:fix
```

---

## 2. Extract Constants (15 minutes)

Create `frontend/src/config/constants.js`:
```javascript
export const TIMING = {
  SEARCH_DEBOUNCE_MS: 100,
  STATE_SAVE_THROTTLE_MS: 400,
}

export const UI = {
  TABLE_HEIGHT: '600px',
  STORAGE_KEY: 'draft_helper_state',
  STORAGE_TEST_KEY: '__draft_helper_test__',
}

export const DATA_VIEWS = {
  ACTUAL_2024: '2024-25',
  PROJECTED_2025: '2025-26',
}

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']
```

Then update imports:
```javascript
import { TIMING, UI, DATA_VIEWS } from '../../config/constants.js'
```

---

## 3. Fix Redundant Code (10 minutes)

### Remove unnecessary error wrapping in alpine-store.js:
```javascript
// BEFORE (line 42)
try { this.storageAvailable = !!isPersistentStorageAvailable() } catch(e) { this.storageAvailable = false }

// AFTER
this.storageAvailable = isPersistentStorageAvailable()
```

### Extract duplicate formatter in tabulator-config.js:
```javascript
const percentFormatter = (cell) => {
  const value = cell.getValue()
  return value == null ? '' : `${(value * 100).toFixed(1)}%`
}

// Then use in columns:
{ title: 'FG%', field: 'fg_pct', sorter: 'number', width: 80, formatter: percentFormatter },
{ title: 'FT%', field: 'ft_pct', sorter: 'number', width: 80, formatter: percentFormatter },
```

---

## 4. Add Basic ARIA Labels (20 minutes)

Update `frontend/index.html`:

```html
<!-- Search input -->
<input 
  x-model="searchQuery" 
  @input="debounceSearch" 
  type="text" 
  placeholder="Enter player name..." 
  class="input input-bordered"
  aria-label="Search players by name"
/>

<!-- Loading spinner -->
<div 
  x-show="loading" 
  role="status" 
  aria-live="polite"
  class="absolute inset-0 bg-base-100/60 flex items-center justify-center"
>
  <!-- spinner SVG -->
  <span class="text-sm">Loading data…</span>
</div>

<!-- Position filter section -->
<div class="form-control">
  <label class="label"><span class="label-text">Position</span></label>
  <div class="flex gap-2 flex-wrap" role="group" aria-label="Filter by position">
    <label class="cursor-pointer">
      <input type="checkbox" x-model="positionFilters" @change="applyFilters" value="PG" class="mr-2" />
      PG
    </label>
    <!-- ... other positions ... -->
  </div>
</div>
```

---

## 5. Add GitHub Actions CI (30 minutes)

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, 002-foundation]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run tests
        working-directory: ./frontend
        run: npm test -- --run
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      - name: Check bundle size
        working-directory: ./frontend
        run: |
          BUNDLE_SIZE=$(du -sb dist/assets/*.js | awk '{s+=$1} END {print s}')
          echo "Bundle size: $BUNDLE_SIZE bytes"
          if [ $BUNDLE_SIZE -gt 524288000 ]; then
            echo "Bundle size exceeds 500MB limit"
            exit 1
          fi
```

---

## 6. Add Security Audit Script (5 minutes)

Update `frontend/package.json`:
```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix"
  }
}
```

Run now:
```bash
cd frontend
npm audit
```

---

## 7. Improve Error Handling in sample-loader.js (15 minutes)

```javascript
import { DataLoadError } from '../utils/errors.js'

export async function loadSampleData(view = '2024-25') {
  const file = view === '2024-25' ? '/data/sample-2024.json' : '/data/sample-2025.json'
  
  // Try fetch first (runtime)
  if (typeof fetch === 'function') {
    try {
      const resp = await fetch(file)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
      return await resp.json()
    } catch (fetchError) {
      console.warn(`Fetch failed for ${file}:`, fetchError.message)
    }
  }
  
  // Fallback to dynamic import (tests)
  try {
    const modulePath = view === '2024-25' 
      ? '../../data/sample-2024.json'
      : '../../data/sample-2025.json'
    const mod = await import(modulePath, { assert: { type: 'json' } })
    return mod.default || mod
  } catch (importError) {
    console.error('All data loading strategies failed:', importError)
    throw new DataLoadError(`Failed to load sample data for ${view}`)
  }
}
```

---

## 8. Add JSDoc Comments to Key Functions (30 minutes)

Add to `alpine-store.js`:
```javascript
/**
 * Creates the main Alpine.js store for the draft helper application.
 * Manages application state, data loading, filtering, and table interactions.
 * 
 * @returns {Object} Alpine.js reactive store instance
 */
export function createDraftHelperStore() {
  // ...
}
```

Add to `filters.js`:
```javascript
/**
 * Filters players by name using case-insensitive substring matching.
 * 
 * @param {Array<Object>} players - Array of player objects
 * @param {string} query - Search query string
 * @returns {Array<Object>} Filtered array of players
 */
export function searchPlayers(players, query) {
  // ...
}
```

Add to `storage.js`:
```javascript
/**
 * Checks if persistent storage (localStorage or sessionStorage) is available and writable.
 * Tests by attempting to write and remove a test key.
 * 
 * @returns {boolean} True if storage is available and writable, false otherwise
 */
export function isPersistentStorageAvailable() {
  // ...
}
```

---

## Checklist

- [ ] Add ESLint & Prettier (30 min)
- [ ] Extract constants file (15 min)
- [ ] Fix redundant code (10 min)
- [ ] Add ARIA labels (20 min)
- [ ] Add GitHub Actions CI (30 min)
- [ ] Add security audit script (5 min)
- [ ] Improve error handling (15 min)
- [ ] Add JSDoc comments (30 min)

**Total Time**: ~2.5 hours

---

## Run After Implementation

```bash
# Format and lint
npm run format
npm run lint:fix

# Run tests
npm test -- --run

# Build and verify
npm run build

# Security check
npm audit

# Commit
git add -A
git commit -m "chore: implement code review quick wins (linting, constants, accessibility, CI)"
git push origin 002-foundation
```

---

## Measuring Impact

After implementing these changes, you should see:

✅ **Fewer bugs**: ESLint catches common issues  
✅ **Consistent code style**: Prettier auto-formats  
✅ **Better accessibility**: ARIA labels improve screen reader support  
✅ **Automated quality checks**: CI prevents broken code from merging  
✅ **Easier maintenance**: Constants and docs make code clearer  
✅ **Security awareness**: Regular audits catch vulnerable dependencies  

**Next**: Tackle the MEDIUM priority items from the full code review.
