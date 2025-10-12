# Data Model: Foundation (Phase 1)

**Date**: 2025-10-12  
**Feature**: Foundation web application setup  
**Source**: `/specs/002-foundation/spec.md`

## Core Entities

### Player
Primary entity representing a basketball player with statistical data.

**Fields**:
- `id`: string (unique identifier, e.g., "player_001")
- `name`: string (display name, e.g., "LeBron James")
- `team`: string (3-letter team code, e.g., "LAL")
- `positions`: string[] (eligible positions: ["PG", "SG", "SF", "PF", "C"])
- `stats`: PlayerStats object
- `expert_rank`: number | null (external expert ranking)
- `algo_rank`: number | null (algorithmic ranking, placeholder for Phase 1)

**Validation Rules**:
- `id` must be unique across all players
- `name` must be non-empty string
- `team` must be valid 3-letter NBA team code
- `positions` must contain at least one valid position code
- `stats` must be valid PlayerStats object
- `expert_rank` must be positive integer or null
- `algo_rank` must be positive integer or null

**Relationships**:
- One-to-one with PlayerStats
- Many-to-many with Position (through positions array)

### PlayerStats
Statistical data for a player in a specific time period.

**Fields**:
- `gp`: number (games played)
- `pts`: number (points per game)
- `ast`: number (assists per game)
- `reb`: number (rebounds per game)
- `threes`: number (three-pointers made per game)
- `fg_pct`: number (field goal percentage, 0.0-1.0)
- `ft_pct`: number (free throw percentage, 0.0-1.0)
- `stl`: number (steals per game)
- `blk`: number (blocks per game)
- `to`: number (turnovers per game)

**Validation Rules**:
- All numeric fields must be non-negative
- `gp` must be integer between 1-82
- Percentage fields (`fg_pct`, `ft_pct`) must be between 0.0-1.0
- Per-game stats should be reasonable (e.g., `pts` < 50, `ast` < 15)

### UIState
Client-side application state for user interface persistence.

**Fields**:
- `active_stat_view`: "2024-25" | "2025-26" (selected stat period)
- `search_query`: string (current player name search)
- `position_filter`: string | null (selected position filter)
- `sort_column`: string | null (currently sorted column name)
- `sort_direction`: "asc" | "desc" | null (sort direction)

**Validation Rules**:
- `active_stat_view` must be one of the defined stat periods
- `search_query` must be string (can be empty)
- `position_filter` must be valid position code or null
- `sort_column` must be valid column name or null
- `sort_direction` must be valid sort direction or null

**Storage**:
- Persisted to localStorage as JSON
- Falls back to session memory if localStorage unavailable
- Automatically restored on application load

### SampleDataBundle
Container for bundled player data sets.

**Fields**:
- `2024-25`: Player[] (actual stats from 2024-25 season)
- `2025-26`: Player[] (projected stats for 2025-26 season)
- `metadata`: DataMetadata object

**Validation Rules**:
- Each data set must contain 1-200 players
- All players must have valid Player structure
- Player IDs must be consistent across data sets
- Data sets must contain same players (matching by ID)

### DataMetadata
Metadata about the bundled sample data.

**Fields**:
- `last_updated`: string (ISO date string)
- `data_source`: string (description of data origin)
- `player_count`: number (number of players in data set)
- `stat_period`: string (description of time period)

## State Transitions

### Application Initialization
1. **Loading** → Load sample data bundles
2. **Data Validation** → Validate player data structure
3. **UI Restoration** → Restore UIState from localStorage
4. **Table Initialization** → Initialize Tabulator with data
5. **Ready** → Application ready for user interaction

### Stat View Toggle
1. **Current View** → User clicks stat view toggle
2. **Loading New Data** → Load alternate data set
3. **Table Update** → Update Tabulator with new data
4. **State Persistence** → Save new view preference to localStorage
5. **Updated View** → Display new stat period

### Search and Filter Operations
1. **User Input** → User types in search or selects filter
2. **Data Processing** → Apply filters to player data
3. **Table Update** → Update Tabulator display
4. **State Persistence** → Save search/filter state to localStorage
5. **Filtered View** → Display filtered results

## Data Flow

### Sample Data Loading
```
Static JSON Files → ES Module Import → Data Validation → Tabulator setData()
```

### User Interactions
```
User Input → Alpine.js Event Handler → Pure Filter Functions → Tabulator API → UI Update
```

### State Persistence
```
UI Change → UIState Update → localStorage Write → Fallback to Session Memory
```

## Performance Considerations

### Data Size Limits
- Maximum 200 players per data set
- Target bundle size: <100KB per JSON file
- Memory usage: <5MB total for all player data

### Search Performance
- Client-side string matching for <200 players
- Debounced search input (300ms delay)
- Indexed searching by player name

### Filter Performance
- Array filtering for position eligibility
- Pre-computed filter predicates
- Efficient Tabulator redraw cycles

## Error Handling

### Data Validation Errors
- Invalid player data structure → Show error message, load fallback data
- Missing required fields → Skip invalid players, log warnings
- Network loading failures → Show offline message, use cached data

### Storage Errors
- localStorage unavailable → Use session memory, show persistence warning
- JSON parse errors → Reset to default state, show recovery message
- Quota exceeded → Clear old data, show storage warning

### Table Errors
- Tabulator initialization failure → Show fallback table, log error
- Invalid sort column → Reset to default sort, show warning
- Data update failure → Retry update, show temporary error message