# Data Model: Data Integration

**Feature**: 003-data-integration  
**Date**: 2025-10-13  
**Status**: Complete

## Overview

This document defines all data entities, their relationships, validation rules, and state transitions for the Data Integration feature.

---

## Entities

### 1. UploadedPlayer

**Description**: Raw player data extracted from uploaded CSV file.

**Fields**:
```typescript
interface UploadedPlayer {
  // Identity
  name: string;                    // Player full name (required)
  team: string;                    // NBA team abbreviation (e.g., "LAL")
  position: string;                // Position(s) (e.g., "PG", "SG/SF")
  expertRank: number;              // Original ranking from CSV source
  
  // Projected Statistics
  projectedStats: {
    pts: number | null;            // Points per game
    ast: number | null;            // Assists per game
    reb: number | null;            // Rebounds per game
    threes: number | null;         // Three-pointers made per game
    fg_pct: number | null;         // Field goal percentage (0.0-1.0)
    ft_pct: number | null;         // Free throw percentage (0.0-1.0)
    stl: number | null;            // Steals per game
    blk: number | null;            // Blocks per game
    to: number | null;             // Turnovers per game
  };
  
  // Metadata
  csvRowIndex: number;             // Original CSV row number (for error reporting)
}
```

**Validation Rules**:
- `name`: Required, non-empty string, max 100 characters
- `team`: Optional, 2-3 character string (NBA team codes)
- `position`: Required, must match pattern: `(PG|SG|SF|PF|C)(/PG|/SG|/SF|/PF|/C)*`
- `expertRank`: Required, positive integer
- `projectedStats.*`: Optional, numeric values only (null if missing)
- `projectedStats.fg_pct`: If present, must be 0.0-1.0
- `projectedStats.ft_pct`: If present, must be 0.0-1.0

**Relationships**:
- One-to-zero-or-one with `HistoricalStats` (via name matching)
- Combined into `IntegratedPlayer` after matching

---

### 2. HistoricalStats

**Description**: Last year's performance data for a player, pre-loaded from JSON file.

**Fields**:
```typescript
interface HistoricalStats {
  // Identity (used for matching)
  name: string;                    // Player full name (canonical)
  team: string;                    // Team from last season
  
  // Volume Stats
  gp: number;                      // Games played (informational)
  pts: number;                     // Points per game
  ast: number;                     // Assists per game
  reb: number;                     // Rebounds per game
  threes: number;                  // Three-pointers made per game
  stl: number;                     // Steals per game
  blk: number;                     // Blocks per game
  to: number;                      // Turnovers per game
  
  // Percentage Stats
  fg_pct: number;                  // Field goal percentage (0.0-1.0)
  ft_pct: number;                  // Free throw percentage (0.0-1.0)
  fga: number;                     // Field goal attempts (for threshold check)
  fta: number;                     // Free throw attempts (for threshold check)
}
```

**Validation Rules**:
- All fields required (data pre-validated during generation)
- Numeric fields must be non-negative
- Percentages must be 0.0-1.0
- Source: Pre-generated from `nba_api` Python script

**Relationships**:
- Matched to `UploadedPlayer` by name (fuzzy matching)
- Merged into `IntegratedPlayer`

---

### 3. IntegratedPlayer

**Description**: Unified player data combining uploaded CSV and historical stats.

**Fields**:
```typescript
interface IntegratedPlayer {
  // Identity (from UploadedPlayer)
  id: string;                      // Generated UUID
  name: string;
  team: string;
  position: string;
  expertRank: number;
  
  // Statistics (both projected and historical)
  projectedStats: ProjectedStats;
  historicalStats: HistoricalStats | null;
  
  // Matching Metadata
  matchConfidence: number;         // 0-100 (100 = exact match, <90 = flagged)
  hasHistoricalData: boolean;      // True if matched successfully
  matchedBy: 'exact' | 'fuzzy' | 'manual' | 'none';
  
  // Data Quality
  dataQualityFlags: DataQualityFlag[];
  validationIssues: ValidationIssue[];
  
  // State
  csvRowIndex: number;             // Original row for error reporting
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Inherits all validation from `UploadedPlayer`
- `matchConfidence`: 0-100 integer
- `dataQualityFlags`: Array (may be empty)
- `validationIssues`: Must contain at least severity='error' if player invalid

**Relationships**:
- Stores reference to both `UploadedPlayer` and `HistoricalStats`
- Used by ranking algorithm (future feature)
- Displayed in main player table

**State Transitions**:
```
[CSV Parsed] → [Name Matching] → [Validation] → [Stored]
     ↓              ↓                 ↓              ↓
UploadedPlayer  + Historical    + Quality      IntegratedPlayer
                  Stats            Checks         (complete)
```

---

### 4. ColumnMapping

**Description**: Configuration mapping CSV column names to system fields.

**Fields**:
```typescript
interface ColumnMapping {
  // Required Fields
  playerNameColumn: string;        // CSV column for player name
  teamColumn: string;              // CSV column for team
  positionColumn: string;          // CSV column for position
  rankColumn: string;              // CSV column for expert rank
  
  // Stat Columns (9 categories)
  statColumns: {
    pts: string;                   // CSV column for points
    ast: string;                   // CSV column for assists
    reb: string;                   // CSV column for rebounds
    threes: string;                // CSV column for 3-pointers made
    fg_pct: string;                // CSV column for FG%
    ft_pct: string;                // CSV column for FT%
    stl: string;                   // CSV column for steals
    blk: string;                   // CSV column for blocks
    to: string;                    // CSV column for turnovers
  };
  
  // Metadata
  csvColumns: string[];            // All detected column names
  autoDetected: boolean;           // True if columns auto-matched
  savedAt: Date | null;            // When mapping was saved (if persisted)
}
```

**Validation Rules**:
- All required fields must map to valid CSV columns
- No duplicate mappings (one CSV column can't map to two system fields)
- All `statColumns` must be present (no partial mappings)
- `csvColumns` must contain all mapped column names

**Persistence**:
- Saved to localStorage after successful upload
- Loaded and auto-applied if CSV columns match exactly
- Key: `draft_helper:column_mapping`

---

### 5. ValidationReport

**Description**: Summary of data quality issues found during validation.

**Fields**:
```typescript
interface ValidationReport {
  // Summary Counts
  totalPlayers: number;            // Total players in upload
  validPlayers: number;            // Players with no errors
  matchedPlayers: number;          // Players matched to historical data
  unmatchedPlayers: string[];      // Player names without matches
  
  // Issue Categories
  errorCount: number;              // Blocking issues (prevents upload)
  warningCount: number;            // Non-blocking issues (requires confirmation)
  infoCount: number;               // Informational notices
  
  // Detailed Issues by Player
  playerIssues: Map<string, ValidationIssue[]>;
  
  // Threshold Failures
  fgThresholdFailures: string[];   // Players with < 5 FGA
  ftThresholdFailures: string[];   // Players with < 2 FTA
  
  // Metadata
  generatedAt: Date;
  csvFileName: string;
}
```

**Validation Rules**:
- Counts must be non-negative integers
- `totalPlayers` = `validPlayers` + (players with errors)
- `playerIssues` maps player ID to array of issues

**Display Logic**:
- Errors block upload (must fix)
- Warnings show confirmation dialog ("Proceed anyway?")
- Info issues display in tooltips only

---

### 6. DataQualityFlag

**Description**: Indicator of a specific data quality issue for a player.

**Fields**:
```typescript
interface DataQualityFlag {
  type: 'missing_stats' | 'threshold_fail' | 'position_mismatch' | 'rookie' | 'low_confidence_match';
  severity: 'error' | 'warning' | 'info';
  message: string;                 // User-friendly description
  field?: string;                  // Specific field affected (if applicable)
  context?: Record<string, any>;   // Additional debugging info
}
```

**Flag Types**:

| Type | Severity | Description |
|------|----------|-------------|
| `missing_stats` | warning | Missing >3 of 9 stat categories |
| `threshold_fail` | info | FG% or FT% below attempt thresholds |
| `position_mismatch` | info | Position differs between CSV and historical |
| `rookie` | info | No historical data (new player) |
| `low_confidence_match` | warning | Name match confidence < 90% |

---

### 7. ValidationIssue

**Description**: Specific validation error or warning for a player.

**Fields**:
```typescript
interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;                    // Machine-readable error code
  message: string;                 // User-friendly message
  field?: string;                  // Field that failed validation
  expectedValue?: string;          // What was expected
  actualValue?: string;            // What was found
}
```

**Error Codes**:
- `ERR_MISSING_NAME`: Player name is blank
- `ERR_MISSING_POSITION`: Position field is blank
- `ERR_INVALID_POSITION`: Position doesn't match valid patterns
- `WARN_INSUFFICIENT_STATS`: Missing >3 stat categories
- `WARN_DUPLICATE_NAME`: Multiple players with same name
- `INFO_NO_HISTORICAL`: No match found in historical data
- `INFO_BELOW_THRESHOLD`: FG%/FT% below minimum attempts

---

## Relationships Diagram

```
┌─────────────────┐
│  CSV File       │
└────────┬────────┘
         │ (parsed by PapaParse)
         ▼
┌─────────────────┐         ┌──────────────────┐
│ UploadedPlayer  │◄────────│ ColumnMapping    │
└────────┬────────┘         └──────────────────┘
         │                            │
         │ (name matching)            │ (persisted to localStorage)
         ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│ HistoricalStats │         │ localStorage     │
└────────┬────────┘         └──────────────────┘
         │
         │ (data merging)
         ▼
┌─────────────────┐
│IntegratedPlayer │
└────────┬────────┘
         │
         │ (validation)
         ▼
┌─────────────────┐         ┌──────────────────┐
│ValidationReport │◄────────│ ValidationIssue  │
└─────────────────┘         └──────────────────┘
         │
         └──────────────────►│ DataQualityFlag  │
                             └──────────────────┘
```

---

## Storage Schema

### localStorage Keys

```typescript
// Column mapping (persisted across sessions)
'draft_helper:column_mapping' → ColumnMapping

// Uploaded player data (current session)
'draft_helper:integrated_players' → IntegratedPlayer[]

// Validation report (current session)
'draft_helper:validation_report' → ValidationReport

// Historical stats (loaded on app init, cached)
'draft_helper:historical_stats' → Record<string, HistoricalStats>
```

### localStorage Size Estimates

- `ColumnMapping`: ~500 bytes
- `IntegratedPlayer` (200 players): ~150KB
- `ValidationReport`: ~10KB
- `HistoricalStats` (300 players): ~200KB

**Total for Data Integration**: ~360KB (well under 5MB limit)

---

## State Machine

### Upload Workflow States

```
[IDLE]
  │
  ├─ User selects CSV file
  │
  ▼
[PARSING]
  │
  ├─ PapaParse processes file
  │
  ▼
[MAPPING] ◄─── (auto-applied if columns match saved mapping)
  │
  ├─ User maps columns (or confirms auto-mapping)
  │
  ▼
[MATCHING]
  │
  ├─ Fuzzy name matching against historical data
  │
  ▼
[VALIDATING]
  │
  ├─ Check data completeness, thresholds, duplicates
  │
  ▼
[REVIEWING] ◄─── (only if warnings/errors exist)
  │
  ├─ User reviews validation report
  ├─ User overrides low-confidence matches (optional)
  ├─ User confirms warnings (if any)
  │
  ▼
[STORING]
  │
  ├─ Save to localStorage
  ├─ Update UI with integrated data
  │
  ▼
[COMPLETE]
```

### Error Recovery

- **Parsing Error**: Return to IDLE, show error message
- **Validation Errors**: Block at REVIEWING until fixed or upload cancelled
- **Storage Quota**: Warn at STORING, offer to clear old data
- **Manual Override**: Allow edits at REVIEWING, re-validate after changes

---

## Data Transformation Pipeline

```javascript
// Step 1: Parse CSV
CSV File → PapaParse → { data: [], meta: {}, errors: [] }

// Step 2: Map Columns
Raw CSV rows + ColumnMapping → UploadedPlayer[]

// Step 3: Match Names
UploadedPlayer[] + HistoricalStats[] → (player, match, confidence)[]

// Step 4: Merge Data
(UploadedPlayer + HistoricalStats + confidence) → IntegratedPlayer

// Step 5: Validate
IntegratedPlayer[] → ValidationReport + DataQualityFlags[]

// Step 6: Store
IntegratedPlayer[] → localStorage
```

---

## Validation Rules Summary

### Error-Level (Blocks Upload)
- Missing player name
- Missing position
- Invalid position format
- Invalid file format (not CSV)
- Malformed CSV structure

### Warning-Level (Requires Confirmation)
- Missing >3 of 9 stat categories
- Duplicate player names without team disambiguation
- File size >500 players
- Match confidence <90% (suggests manual review)

### Info-Level (Display Only)
- FG% below threshold (<5 FGA)
- FT% below threshold (<2 FTA)
- Position mismatch (CSV vs historical)
- Rookie player (no historical data)
- Storage quota >80%

---

## Entity Lifecycle

### UploadedPlayer
- **Created**: During CSV parsing
- **Modified**: Never (immutable)
- **Destroyed**: When new CSV uploaded

### HistoricalStats
- **Created**: On app initialization (loaded from JSON)
- **Modified**: Never (pre-generated data)
- **Destroyed**: Never (persisted across sessions)

### IntegratedPlayer
- **Created**: After name matching + validation
- **Modified**: When user overrides low-confidence match
- **Destroyed**: When new CSV uploaded

### ColumnMapping
- **Created**: When user confirms column mapping
- **Modified**: When user uploads new CSV with different columns
- **Destroyed**: Never (persisted until browser data cleared)

### ValidationReport
- **Created**: After validation step
- **Modified**: When user overrides matches (re-validation)
- **Destroyed**: When new CSV uploaded

---

## Summary

Data model complete with 7 entities, clear relationships, comprehensive validation rules, and state transitions. All entities designed for client-side processing with localStorage persistence. Total storage footprint: ~360KB for typical use case (200 players).
