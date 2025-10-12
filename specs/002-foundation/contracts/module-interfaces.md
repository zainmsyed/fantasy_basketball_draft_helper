# API Contracts: Foundation (Phase 1)

**Date**: 2025-10-12  
**Feature**: Foundation web application setup  
**Type**: Client-side JavaScript Module Interfaces

## Module Interfaces

Since this is a client-side only application, these contracts define JavaScript module interfaces rather than HTTP API endpoints.

### Data Module (`src/modules/data/`)

#### `loadSampleData(statPeriod: string): Promise<Player[]>`
Loads sample player data for specified time period.

**Parameters**:
- `statPeriod`: "2024-25" | "2025-26"

**Returns**: Promise resolving to array of Player objects

**Errors**:
- `DataLoadError`: File not found or invalid JSON
- `ValidationError`: Player data structure invalid

```javascript
// Usage example
import { loadSampleData } from '@/modules/data/loader.js';

try {
  const players = await loadSampleData('2023-24');
  console.log(`Loaded ${players.length} players`);
} catch (error) {
  console.error('Data loading failed:', error.message);
}
```

#### `validatePlayerData(players: any[]): Player[]`
Validates and cleans raw player data.

**Parameters**:
- `players`: Array of raw player objects

**Returns**: Array of validated Player objects

**Errors**:
- `ValidationError`: Invalid player structure
- `SchemaError`: Missing required fields

### Table Module (`src/modules/table/`)

#### `initializeTable(containerId: string, options: TableOptions): TabulatorInstance`
Initializes Tabulator data table with configuration.

**Parameters**:
- `containerId`: DOM element ID for table container
- `options`: Table configuration object

**Returns**: Configured Tabulator instance

**TableOptions Interface**:
```javascript
{
  data: Player[],
  sortable: boolean,
  searchable: boolean,
  responsive: boolean,
  pagination: boolean | number
}
```

#### `updateTableData(table: TabulatorInstance, players: Player[]): void`
Updates table with new player data.

**Parameters**:
- `table`: Tabulator instance
- `players`: New player data array

**Side Effects**: Updates table display, maintains current sort/filter state

#### `applyFilters(table: TabulatorInstance, filters: FilterOptions): void`
Applies search and position filters to table.

**Parameters**:
- `table`: Tabulator instance  
- `filters`: Filter configuration object

**FilterOptions Interface**:
```javascript
{
  searchQuery: string,
  positions: string[],
  teamFilter?: string
}
```

### UI Module (`src/modules/ui/`)

#### `createAlpineStore(initialState: UIState): AlpineStore`
Creates Alpine.js reactive store for UI state management.

**Parameters**:
- `initialState`: Initial UI state object

**Returns**: Alpine.js store object with reactive properties and methods

**AlpineStore Interface**:
```javascript
{
  // State
  activeStatView: string,
  searchQuery: string,
  positionFilter: string | null,
  
  // Methods
  toggleStatView(): void,
  updateSearch(query: string): void,
  setPositionFilter(position: string | null): void,
  saveState(): void,
  resetFilters(): void
}
```

#### `bindTableEvents(table: TabulatorInstance, store: AlpineStore): void`
Binds table events to Alpine.js store updates.

**Parameters**:
- `table`: Tabulator instance
- `store`: Alpine.js store

**Side Effects**: Sets up event listeners for sort changes, cell clicks, etc.

### Storage Module (`src/utils/storage.js`)

#### `saveUIState(state: UIState): boolean`
Persists UI state to localStorage with fallback.

**Parameters**:
- `state`: Current UI state object

**Returns**: Boolean indicating save success

**Storage Strategy**:
1. Attempt localStorage write
2. Fallback to sessionStorage
3. Fallback to in-memory storage

#### `loadUIState(): UIState | null`
Loads persisted UI state from storage.

**Returns**: Saved UI state or null if not found

#### `clearUIState(): void`
Clears all persisted UI state from storage.

### Filter Utilities (`src/utils/filters.js`)

#### `searchPlayers(players: Player[], query: string): Player[]`
Pure function for player name searching.

**Parameters**:
- `players`: Array of players to search
- `query`: Search query string

**Returns**: Filtered array of matching players

**Algorithm**: Case-insensitive partial string matching on player names

#### `filterByPosition(players: Player[], positions: string[]): Player[]`
Pure function for position-based filtering.

**Parameters**:
- `players`: Array of players to filter
- `positions`: Array of position codes to include

**Returns**: Filtered array of players matching position criteria

**Logic**: Includes players whose position array intersects with filter positions

#### `sortPlayers(players: Player[], column: string, direction: 'asc' | 'desc'): Player[]`
Pure function for player data sorting.

**Parameters**:
- `players`: Array of players to sort
- `column`: Column/field name to sort by
- `direction`: Sort direction

**Returns**: New sorted array (does not mutate input)

## Error Handling Contracts

### Standard Error Types

#### `DataLoadError`
Thrown when sample data files cannot be loaded or parsed.

**Properties**:
- `name`: "DataLoadError"
- `message`: Human-readable error description
- `cause`: Original error object
- `filePath`: Path to failed data file

#### `ValidationError`
Thrown when player data fails validation checks.

**Properties**:
- `name`: "ValidationError"
- `message`: Human-readable validation failure description
- `invalidPlayers`: Array of players that failed validation
- `schema`: Expected data schema

#### `StorageError`
Thrown when localStorage operations fail.

**Properties**:
- `name`: "StorageError"
- `message`: Storage operation failure description
- `fallbackUsed`: Boolean indicating if fallback storage was used

### Error Recovery Patterns

#### Data Loading Failures
```javascript
try {
  const players = await loadSampleData('2023-24');
} catch (error) {
  if (error instanceof DataLoadError) {
    // Show user-friendly message, load fallback data
    console.warn('Using fallback player data');
    const players = await loadSampleData('fallback');
  }
}
```

#### Storage Failures
```javascript
try {
  saveUIState(currentState);
} catch (error) {
  if (error instanceof StorageError) {
    // Show warning about lost persistence
    showStorageWarning(error.fallbackUsed);
  }
}
```

## Performance Contracts

### Response Time Requirements
- `loadSampleData()`: < 500ms for 200 players
- `updateTableData()`: < 100ms for data set changes
- `applyFilters()`: < 50ms for search/filter operations
- `saveUIState()`: < 10ms for state persistence

### Memory Usage Limits
- Total player data: < 5MB in memory
- UI state: < 1KB in localStorage
- Table instance: < 2MB including rendered DOM

### Bundle Size Targets
- Data module: < 10KB
- Table module: < 15KB (excluding Tabulator library)
- UI module: < 8KB
- Utilities: < 5KB each

## Browser Compatibility

### Supported Features
- ES2020 modules (dynamic imports)
- localStorage with fallback detection
- CSS Grid and Flexbox for layout
- Fetch API for data loading

### Fallback Strategies
- localStorage unavailable → sessionStorage → in-memory
- ES modules unsupported → UMD builds with script tags
- CSS Grid unsupported → Flexbox layout
- Fetch unavailable → XMLHttpRequest polyfill