# Research: Data Integration

**Feature**: 003-data-integration  
**Date**: 2025-10-13  
**Status**: Complete

## Overview

This document consolidates research findings for implementing CSV upload, player name matching, and data validation features.

---

## 1. CSV Parsing Library Selection

### Decision: PapaParse

**Rationale**:
- Industry-standard CSV parser with 11k+ GitHub stars
- Handles edge cases: quoted fields, escaped characters, various delimiters
- Built-in header detection and type inference
- Streaming support for large files (future-proofing)
- Bundle size: ~45KB minified (acceptable for functionality provided)
- Active maintenance (last updated 2024)

**Alternatives Considered**:
- **csv-parse**: More complex API, requires Node.js patterns, larger bundle
- **Papa Parse alternatives (csv.js)**: Less mature, fewer edge case tests
- **Custom implementation**: Would require 2+ weeks to handle all CSV edge cases reliably

**Best Practices**:
```javascript
// PapaParse configuration for this use case
Papa.parse(file, {
  header: true,              // Auto-detect headers
  dynamicTyping: true,       // Convert numbers automatically
  skipEmptyLines: true,      // Ignore blank rows
  transformHeader: (h) => h.trim(), // Clean whitespace
  complete: (results) => {
    // results.data = array of objects
    // results.errors = parsing errors with row numbers
    // results.meta = column names, delimiter detected
  }
});
```

**Integration Points**:
- Triggered by file input change event
- Returns structured data for column mapping UI
- Error handling feeds validation reporter

---

## 2. Fuzzy String Matching Algorithm

### Decision: Fuse.js

**Rationale**:
- Lightweight (~12KB minified) fuzzy search library
- Configurable similarity thresholds (we need 85%+)
- Handles common variations: case, spacing, accents
- No external dependencies
- Works entirely client-side
- Well-documented scoring algorithm

**Alternatives Considered**:
- **Levenshtein distance (custom)**: Lower-level, requires custom threshold tuning
- **string-similarity**: Similar size but less configurable
- **fuzzyset.js**: Older, less maintained
- **Natural language libraries (compromise.js)**: Overkill for name matching

**Best Practices**:
```javascript
// Fuse.js configuration for player name matching
const fuse = new Fuse(historicalPlayers, {
  keys: ['name'],              // Search on name field
  threshold: 0.15,             // 0.0 = perfect, 1.0 = match anything (0.15 ≈ 85% similarity)
  ignoreLocation: true,        // Don't favor matches at start of string
  useExtendedSearch: false,    // Simple matching sufficient
  includeScore: true           // Return confidence score
});

// Secondary matching by team when names similar
const matchPlayer = (csvName, csvTeam) => {
  const results = fuse.search(csvName);
  if (results.length === 0) return null;
  
  // If top match is high confidence, use it
  if (results[0].score < 0.10) return results[0].item;
  
  // If multiple similar names, use team as tiebreaker
  const teamMatch = results.find(r => r.item.team === csvTeam);
  return teamMatch?.item || results[0].item;
};
```

**Integration Points**:
- Runs after CSV parsing completes
- Matches CSV player names against pre-loaded JSON
- Returns match confidence score (0-100) for each player
- Flags low-confidence matches for manual review

---

## 3. Column Mapping Persistence

### Decision: localStorage with JSON serialization

**Rationale**:
- Native browser API, no dependencies
- Synchronous access (no async complexity)
- Sufficient for small mapping configs (<1KB)
- Simple get/set pattern
- Matches project's localStorage strategy

**Best Practices**:
```javascript
// Storage key pattern
const MAPPING_KEY = 'draft_helper:column_mapping';

// Save mapping after successful upload
const saveMapping = (mapping) => {
  try {
    localStorage.setItem(MAPPING_KEY, JSON.stringify(mapping));
  } catch (e) {
    // Quota exceeded - non-critical, silent fail
    console.warn('Failed to save column mapping:', e);
  }
};

// Load and auto-apply if columns match exactly
const loadMapping = (csvColumns) => {
  try {
    const saved = JSON.parse(localStorage.getItem(MAPPING_KEY) || 'null');
    if (!saved) return null;
    
    // Only auto-apply if column names match exactly
    const columnsMatch = csvColumns.every(col => 
      saved.csvColumns?.includes(col)
    );
    
    return columnsMatch ? saved.mapping : null;
  } catch (e) {
    return null; // Corrupted data, ignore
  }
};
```

**Integration Points**:
- Triggered after successful CSV upload
- Loaded when column mapping UI initializes
- Cleared when user manually changes mappings

---

## 4. Data Validation Strategy

### Decision: Three-tier validation system (Error/Warning/Info)

**Rationale**:
- Balances data quality with user control
- Prevents catastrophic failures while allowing flexibility
- Standard UX pattern in form validation
- Supports progressive enhancement

**Validation Rules**:

**Errors (Block Upload)**:
- Missing player name
- Missing position
- Invalid file format
- Malformed CSV structure

**Warnings (Allow with Confirmation)**:
- Missing >3 of 9 stat categories
- Duplicate player names (no team for disambiguation)
- Extremely large file (>500 players)

**Info (Display Only)**:
- FG% below threshold (< 5 FGA)
- FT% below threshold (< 2 FTA)
- Position mismatch between CSV and historical data
- Rookie player (no historical data)

**Best Practices**:
```javascript
// Validation result structure
const validatePlayer = (player, historicalMatch) => {
  const issues = [];
  
  // Error-level checks
  if (!player.name?.trim()) {
    issues.push({ severity: 'error', message: 'Player name required', field: 'name' });
  }
  if (!player.position) {
    issues.push({ severity: 'error', message: 'Position required', field: 'position' });
  }
  
  // Warning-level checks
  const statCount = countNonNullStats(player.projectedStats);
  if (statCount < 6) {
    issues.push({ 
      severity: 'warning', 
      message: `Only ${statCount}/9 stats available`,
      field: 'stats'
    });
  }
  
  // Info-level checks
  if (historicalMatch?.fga < 5) {
    issues.push({ 
      severity: 'info', 
      message: 'FG% excluded (low attempts)',
      field: 'fg_pct'
    });
  }
  
  return issues;
};
```

**Integration Points**:
- Runs after data merging completes
- Generates ValidationReport entity
- UI displays severity-appropriate indicators
- Blocks "Confirm Upload" button if any errors exist

---

## 5. Storage Quota Monitoring

### Decision: Proactive monitoring with 80% warning threshold

**Rationale**:
- Prevents surprise failures during live drafts
- Gives users time to clear space before quota exceeded
- Standard pattern in progressive web apps
- Minimal performance overhead

**Best Practices**:
```javascript
// Check quota before large storage operations
const checkStorageQuota = async () => {
  if (!navigator.storage?.estimate) {
    return { available: true, usage: 0, quota: 0 }; // Fallback for unsupported browsers
  }
  
  const estimate = await navigator.storage.estimate();
  const usagePercent = (estimate.usage / estimate.quota) * 100;
  
  return {
    available: usagePercent < 100,
    warning: usagePercent >= 80,
    usage: estimate.usage,
    quota: estimate.quota,
    usagePercent
  };
};

// Before storing large datasets
const safeStore = async (key, data) => {
  const quota = await checkStorageQuota();
  
  if (quota.warning && !quota.exceeded) {
    showWarning(`Storage ${quota.usagePercent.toFixed(0)}% full. Consider clearing old drafts.`);
  }
  
  if (!quota.available) {
    throw new Error('Storage quota exceeded. Please clear browser data or old drafts.');
  }
  
  localStorage.setItem(key, JSON.stringify(data));
};
```

**Integration Points**:
- Checked before storing CSV upload data
- Checked before storing draft tracking data
- Warning displayed in UI banner
- Error handled with user-friendly message

---

## 6. Character Normalization for Name Matching

### Decision: Unicode normalization (NFD) + accent removal

**Rationale**:
- Handles international player names (Jokić, Dončić)
- Standard approach in text processing
- Built into JavaScript (String.normalize)
- Reversible if needed for display

**Best Practices**:
```javascript
// Normalize player names for matching
const normalizeName = (name) => {
  return name
    .normalize('NFD')                    // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')     // Remove accent marks
    .toLowerCase()                       // Case insensitive
    .trim()                              // Remove whitespace
    .replace(/\s+/g, ' ');               // Normalize internal spacing
};

// Usage in matching
const fuzzyMatch = (csvName, historicalNames) => {
  const normalized = normalizeName(csvName);
  return historicalNames.find(h => 
    normalizeName(h.name) === normalized
  );
};
```

**Integration Points**:
- Applied to both CSV names and historical data names
- Used before fuzzy matching algorithm runs
- Original names preserved for display

---

## 7. Percentage Stat Format Detection

### Decision: Heuristic detection with automatic normalization

**Rationale**:
- Different sources use different formats (0.540 vs 54.0)
- Automatic conversion reduces user friction
- Simple heuristic: if value > 1, divide by 100
- Handles edge cases (0.0 vs 0, 1.0 vs 100)

**Best Practices**:
```javascript
// Detect and normalize percentage stats
const normalizePercentage = (value, fieldName) => {
  if (value == null || value === '') return null;
  
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  
  // If field is a percentage and value > 1, assume whole number format
  if (['fg_pct', 'ft_pct', 'three_pct'].includes(fieldName)) {
    if (num > 1.0) {
      return num / 100; // Convert 54 → 0.54
    }
  }
  
  return num;
};

// Apply during CSV parsing
const processStatValue = (raw, fieldName) => {
  // Handle non-numeric markers
  if (['N/A', '-', 'null', 'undefined'].includes(String(raw).trim())) {
    return null;
  }
  
  return normalizePercentage(raw, fieldName);
};
```

**Integration Points**:
- Applied during CSV parsing (PapaParse transform)
- Validated in data validation step
- Reported if suspicious values detected (e.g., FG% > 1.0)

---

## 8. Manual Match Override UI Pattern

### Decision: Inline edit controls for flagged matches only

**Rationale**:
- Reduces UI clutter (most matches are confident)
- Focuses user attention on problematic cases
- Standard pattern in data review interfaces
- Maintains simplicity for 90% of use cases

**Best Practices**:
```javascript
// UI component structure
<div x-data="{ editing: false }">
  <div x-show="!editing" class="match-display">
    <span class="player-name">{{ csvPlayer.name }}</span>
    <span class="match-indicator" :class="matchClass">
      → {{ historicalMatch?.name || 'No match' }}
      <span class="confidence">{{ matchConfidence }}%</span>
    </span>
    <button x-show="matchConfidence < 90" 
            @click="editing = true"
            class="btn-edit">
      Override
    </button>
  </div>
  
  <div x-show="editing" class="match-edit">
    <select x-model="selectedMatch">
      <option value="">No match</option>
      <option x-for="candidate in matchCandidates" 
              :value="candidate.id">
        {{ candidate.name }} ({{ candidate.team }})
      </option>
    </select>
    <button @click="saveOverride(); editing = false">Confirm</button>
    <button @click="editing = false">Cancel</button>
  </div>
</div>
```

**Integration Points**:
- Displayed in column mapping preview table
- Only visible for matches with confidence < 90%
- Updates IntegratedPlayer entity when saved
- Persisted in localStorage with upload data

---

## Summary

All research tasks completed. Key decisions:
1. **PapaParse** for CSV parsing (45KB, handles edge cases)
2. **Fuse.js** for fuzzy matching (12KB, configurable similarity)
3. **localStorage** for column mapping persistence (native, simple)
4. **Three-tier validation** (Error/Warning/Info pattern)
5. **80% quota threshold** for storage monitoring
6. **NFD normalization** for international character support
7. **Heuristic detection** for percentage format conversion
8. **Inline edit controls** for low-confidence match overrides

Total bundle impact: ~57KB for new dependencies (within acceptable range).

All "NEEDS CLARIFICATION" items from Technical Context resolved.
