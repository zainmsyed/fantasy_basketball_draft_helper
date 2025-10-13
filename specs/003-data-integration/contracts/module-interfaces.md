# Module Interfaces: Data Integration

**Feature**: 003-data-integration  
**Date**: 2025-10-13

## Overview

This document defines the public interfaces for all data integration modules. Each module exposes a clean API with typed inputs/outputs and clear contracts.

---

## 1. CSV Parser Module

**Module**: `src/modules/data/csv-parser.js`

**Purpose**: Parse CSV files and detect column structure.

### parseCSV()

```typescript
/**
 * Parse a CSV file and return structured data with metadata
 * @param file - File object from input[type=file]
 * @param options - Optional parsing configuration
 * @returns Promise resolving to ParseResult
 */
function parseCSV(
  file: File,
  options?: {
    maxRows?: number;        // Limit rows parsed (default: unlimited)
    skipEmptyLines?: boolean; // Ignore blank rows (default: true)
  }
): Promise<ParseResult>;

interface ParseResult {
  data: Array<Record<string, any>>;  // Parsed rows as objects
  meta: {
    columns: string[];                // Detected column names
    delimiter: string;                // Detected delimiter (usually ",")
    rowCount: number;                 // Total rows parsed
    aborted: boolean;                 // True if parsing stopped early
  };
  errors: ParseError[];               // Parsing errors (if any)
}

interface ParseError {
  row: number;                        // Row number (1-indexed)
  message: string;                    // Error description
  code: string;                       // Error code (e.g., "UndetectableDelimiter")
}
```

**Error Handling**:
- Invalid file format: Throws `Error("File must be a CSV")`
- Malformed CSV: Returns errors in `ParseResult.errors[]`
- Empty file: Returns empty `data` array with warning in errors

**Performance**:
- Target: <3 seconds for 200-player CSV
- Memory: Streams large files (not loaded entirely into memory)

---

## 2. Name Matcher Module

**Module**: `src/modules/data/name-matcher.js`

**Purpose**: Match player names from CSV to historical data using fuzzy matching.

### matchPlayers()

```typescript
/**
 * Match CSV players to historical data
 * @param csvPlayers - Players from uploaded CSV
 * @param historicalData - Pre-loaded historical stats
 * @param options - Matching configuration
 * @returns Array of match results
 */
function matchPlayers(
  csvPlayers: Array<{ name: string; team: string }>,
  historicalData: Record<string, HistoricalStats>,
  options?: {
    confidenceThreshold?: number;  // Min confidence for auto-match (default: 85)
    useTeamTiebreaker?: boolean;   // Use team for disambiguation (default: true)
  }
): MatchResult[];

interface MatchResult {
  csvPlayer: { name: string; team: string };
  historicalMatch: HistoricalStats | null;
  confidence: number;              // 0-100 (100 = exact match)
  matchType: 'exact' | 'fuzzy' | 'none';
  alternatives: Array<{            // Other possible matches
    player: HistoricalStats;
    confidence: number;
  }>;
}
```

**Matching Algorithm**:
1. Normalize both names (lowercase, remove accents, trim)
2. Try exact match first
3. If no exact match, run fuzzy search (Fuse.js)
4. If multiple high-confidence matches, use team as tiebreaker
5. Return top match with confidence score

**Edge Cases**:
- Duplicate names: Returns all alternatives for manual selection
- No match: Returns `null` with empty alternatives
- Special characters: Normalized before matching

**Performance**:
- Target: <1 second for 200 players
- Complexity: O(n) with Fuse.js indexing

---

## 3. Data Merger Module

**Module**: `src/modules/data/data-merger.js`

**Purpose**: Combine CSV data, historical stats, and match results into IntegratedPlayer entities.

### mergePlayerData()

```typescript
/**
 * Merge uploaded player data with historical stats
 * @param uploadedPlayers - Players from CSV
 * @param matchResults - Results from name matching
 * @returns Array of integrated player entities
 */
function mergePlayerData(
  uploadedPlayers: UploadedPlayer[],
  matchResults: MatchResult[]
): IntegratedPlayer[];

interface IntegratedPlayer {
  id: string;                      // Generated UUID
  name: string;
  team: string;
  position: string;
  expertRank: number;
  projectedStats: ProjectedStats;
  historicalStats: HistoricalStats | null;
  matchConfidence: number;
  hasHistoricalData: boolean;
  matchedBy: 'exact' | 'fuzzy' | 'manual' | 'none';
  dataQualityFlags: DataQualityFlag[];
  validationIssues: ValidationIssue[];
  csvRowIndex: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Business Logic**:
- Generates unique ID for each player (UUID v4)
- Preserves CSV data as source of truth for name/team/position/rank
- Attaches historical stats if match found
- Initializes empty arrays for quality flags and validation issues
- Sets timestamps

**Edge Cases**:
- Missing historical data: Sets `hasHistoricalData: false`, `historicalStats: null`
- Invalid CSV data: Includes in output for validation to catch

---

## 4. Data Validator Module

**Module**: `src/modules/data/data-validator.js`

**Purpose**: Validate player data completeness and generate quality reports.

### validatePlayers()

```typescript
/**
 * Validate integrated player data
 * @param players - Integrated player entities
 * @param options - Validation configuration
 * @returns Validation report with issues
 */
function validatePlayers(
  players: IntegratedPlayer[],
  options?: {
    minStatsRequired?: number;     // Min stat categories (default: 6)
    fgAttemptThreshold?: number;   // Min FGA for FG% (default: 5)
    ftAttemptThreshold?: number;   // Min FTA for FT% (default: 2)
  }
): ValidationReport;

interface ValidationReport {
  totalPlayers: number;
  validPlayers: number;
  matchedPlayers: number;
  unmatchedPlayers: string[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  playerIssues: Map<string, ValidationIssue[]>;
  fgThresholdFailures: string[];
  ftThresholdFailures: string[];
  generatedAt: Date;
  csvFileName: string;
}
```

**Validation Rules**:

**Errors (blocking)**:
- Missing player name
- Missing position
- Invalid position format

**Warnings (require confirmation)**:
- Missing >3 of 9 stat categories
- Match confidence <90%
- Duplicate player names

**Info (display only)**:
- FG% below threshold
- FT% below threshold
- Position mismatch
- No historical data (rookie)

### validateSinglePlayer()

```typescript
/**
 * Validate a single player (used for manual overrides)
 * @param player - Player to validate
 * @returns Array of validation issues
 */
function validateSinglePlayer(
  player: IntegratedPlayer
): ValidationIssue[];

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
  expectedValue?: string;
  actualValue?: string;
}
```

---

## 5. Column Mapper Module (UI Component)

**Module**: `src/modules/ui/column-mapper.js`

**Purpose**: Alpine.js component for column mapping interface.

### Alpine Component Data

```typescript
/**
 * Alpine.js reactive data for column mapping UI
 */
interface ColumnMapperData {
  // State
  csvColumns: string[];            // Detected columns from CSV
  mapping: ColumnMapping | null;   // Current mapping
  preview: any[];                  // First 10 rows for preview
  isComplete: boolean;             // All required fields mapped
  
  // Actions
  loadSavedMapping(): void;        // Load from localStorage
  autoDetectMapping(): void;       // Attempt smart mapping
  updateMapping(field: string, column: string): void;
  confirmMapping(): void;          // Proceed to next step
  resetMapping(): void;            // Clear all mappings
}
```

**Auto-Detection Logic**:
```typescript
/**
 * Attempt to automatically map CSV columns to system fields
 * @param csvColumns - Column names from CSV
 * @returns Partial or complete ColumnMapping
 */
function autoDetectMapping(
  csvColumns: string[]
): Partial<ColumnMapping>;

// Matching patterns
const patterns = {
  playerName: ['player', 'name', 'player name', 'full name'],
  team: ['team', 'tm', 'nba team'],
  position: ['pos', 'position', 'positions'],
  rank: ['rank', 'expert rank', 'adp', 'overall'],
  pts: ['pts', 'points', 'ppg'],
  ast: ['ast', 'assists', 'apg'],
  // ... etc for all 9 stats
};
```

**Saved Mapping Logic**:
```typescript
/**
 * Check if saved mapping can be auto-applied
 * @param csvColumns - Columns from current CSV
 * @param savedMapping - Previously saved mapping
 * @returns True if columns match exactly
 */
function canAutoApplyMapping(
  csvColumns: string[],
  savedMapping: ColumnMapping
): boolean;
```

---

## 6. Storage Service Module

**Module**: `src/utils/storage.js`

**Purpose**: Abstract localStorage operations with error handling.

### saveColumnMapping()

```typescript
/**
 * Save column mapping to localStorage
 * @param mapping - Column mapping to save
 * @returns True if successful
 */
function saveColumnMapping(
  mapping: ColumnMapping
): boolean;
```

### loadColumnMapping()

```typescript
/**
 * Load saved column mapping from localStorage
 * @returns Saved mapping or null if not found
 */
function loadColumnMapping(): ColumnMapping | null;
```

### saveIntegratedPlayers()

```typescript
/**
 * Save integrated player data to localStorage
 * @param players - Array of integrated players
 * @returns True if successful, throws on quota exceeded
 */
async function saveIntegratedPlayers(
  players: IntegratedPlayer[]
): Promise<boolean>;
```

### checkStorageQuota()

```typescript
/**
 * Check browser storage quota
 * @returns Storage status with usage percentage
 */
async function checkStorageQuota(): Promise<{
  available: boolean;
  warning: boolean;      // True if >80% full
  usage: number;         // Bytes used
  quota: number;         // Bytes available
  usagePercent: number;  // Percentage (0-100)
}>;
```

---

## 7. Validation Reporter Module (UI Component)

**Module**: `src/modules/ui/validation-reporter.js`

**Purpose**: Display validation results with severity-appropriate UI.

### Alpine Component Data

```typescript
/**
 * Alpine.js reactive data for validation reporter UI
 */
interface ValidationReporterData {
  // State
  report: ValidationReport | null;
  showDetails: boolean;            // Expand/collapse details
  filterSeverity: 'all' | 'error' | 'warning' | 'info';
  
  // Computed
  hasErrors: boolean;              // Any error-level issues
  hasWarnings: boolean;            // Any warning-level issues
  canProceed: boolean;             // No errors blocking upload
  
  // Actions
  toggleDetails(): void;
  filterBySeverity(severity: string): void;
  getPlayerIssues(playerId: string): ValidationIssue[];
  dismissInfo(): void;             // Hide info-level messages
  confirmWarnings(): void;         // Acknowledge warnings and proceed
}
```

**Display Logic**:
- Errors: Red banner, blocks "Confirm" button
- Warnings: Yellow banner, requires confirmation dialog
- Info: Blue badges, dismissible

---

## Module Dependencies

```
csv-parser
    ↓
column-mapper (UI)
    ↓
name-matcher
    ↓
data-merger
    ↓
data-validator
    ↓
validation-reporter (UI)
    ↓
storage (saves integrated players)
```

**Pure Functions** (no side effects):
- Name matching algorithm
- Data validation rules
- Column auto-detection

**Service Layer** (side effects):
- CSV file reading (csv-parser)
- localStorage operations (storage)
- UI updates (Alpine.js components)

---

## Error Handling Strategy

### Module-Level Errors

Each module follows this pattern:

```typescript
try {
  // Main operation
  const result = performOperation(input);
  return { success: true, data: result };
} catch (error) {
  // Log for debugging
  console.error('Module operation failed:', error);
  
  // Return user-friendly error
  return {
    success: false,
    error: {
      code: 'MODULE_ERROR',
      message: 'User-friendly message',
      technicalDetails: error.message
    }
  };
}
```

### User-Facing Error Messages

```typescript
// Error code → User message mapping
const ERROR_MESSAGES = {
  'CSV_PARSE_FAILED': 'Unable to parse CSV file. Please check file format.',
  'STORAGE_QUOTA_EXCEEDED': 'Browser storage full. Please clear old drafts.',
  'INVALID_FILE_TYPE': 'Please upload a CSV file.',
  'VALIDATION_FAILED': 'Some players have data quality issues. Review details below.',
};
```

---

## Testing Contracts

Each module must provide:

1. **Unit tests** for pure functions
2. **Integration tests** for service layer
3. **Performance tests** for large datasets

Example test structure:

```javascript
// Unit test example
describe('name-matcher', () => {
  describe('matchPlayers()', () => {
    it('should exact match identical names', () => {
      const csvPlayers = [{ name: 'LeBron James', team: 'LAL' }];
      const historical = { 'LeBron James': { /* stats */ } };
      
      const results = matchPlayers(csvPlayers, historical);
      
      expect(results[0].matchType).toBe('exact');
      expect(results[0].confidence).toBe(100);
    });
    
    it('should fuzzy match case variations', () => {
      const csvPlayers = [{ name: 'lebron james', team: 'LAL' }];
      const historical = { 'LeBron James': { /* stats */ } };
      
      const results = matchPlayers(csvPlayers, historical);
      
      expect(results[0].matchType).toBe('fuzzy');
      expect(results[0].confidence).toBeGreaterThan(90);
    });
  });
});
```

---

## Summary

All module interfaces defined with:
- Clear input/output types
- Error handling contracts
- Performance targets
- Testing requirements

Modules designed for independence, testability, and composability following Constitution principles.
