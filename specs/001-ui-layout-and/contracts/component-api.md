# UI Component API Contracts

**Feature**: UI Layout and Component Structure  
**Branch**: 001-ui-layout-and  
**Date**: October 11, 2025

## Overview

This document defines the public API contracts for all UI components. Since this is a client-side application without backend APIs, these contracts define the JavaScript module interfaces, event signatures, and component methods.

---

## 1. Layout Component

**Module**: `src/ui/layout.js`

### Factory Function

```javascript
createLayout(options?: LayoutOptions): LayoutComponent
```

**Parameters**:
```typescript
interface LayoutOptions {
  container?: HTMLElement;          // Container element (default: document.body)
  config?: LayoutConfig;             // Layout configuration (default: defaultLayout)
  eventBus?: EventTarget;            // Event bus instance (required)
}
```

**Returns**: `LayoutComponent`

### Public Methods

```javascript
interface LayoutComponent {
  // Render the layout structure
  render(): void;
  
  // Update layout configuration
  updateConfig(config: Partial<LayoutConfig>): void;
  
  // Get current configuration
  getConfig(): LayoutConfig;
  
  // Handle viewport resize
  handleResize(): void;
  
  // Destroy component and cleanup
  destroy(): void;
}
```

### Events Emitted

```javascript
// Fired when layout enters responsive mode (viewport < 1024px)
{
  type: 'layout:responsive-mode',
  detail: {
    isResponsive: boolean,
    viewportWidth: number
  }
}

// Fired when layout configuration changes
{
  type: 'layout:config-changed',
  detail: {
    config: LayoutConfig
  }
}
```

### Events Consumed

None (layout is top-level component)

---

## 2. Player Table Component

**Module**: `src/ui/table.js`

### Factory Function

```javascript
createPlayerTable(eventBus: EventTarget, options?: TableOptions): PlayerTableComponent
```

**Parameters**:
```typescript
interface TableOptions {
  container?: HTMLElement;           // Container element (default: .table-container)
  config?: TableConfig;              // Table configuration (default: defaultTableConfig)
}
```

**Returns**: `PlayerTableComponent`

### Public Methods

```javascript
interface PlayerTableComponent {
  // Render the table structure
  render(): void;
  
  // Update table with new player data
  updatePlayers(players: Player[]): void;
  
  // Update table configuration
  updateConfig(config: Partial<TableConfig>): void;
  
  // Get current configuration
  getConfig(): TableConfig;
  
  // Sort table by column
  sortBy(columnId: string, direction?: 'asc' | 'desc'): void;
  
  // Get current sort state
  getSortState(): { columnId: string | null, direction: 'asc' | 'desc' };
  
  // Destroy component and cleanup
  destroy(): void;
}
```

### Events Emitted

```javascript
// Fired when user clicks column header to sort
{
  type: 'table:sort-requested',
  detail: {
    columnId: string,
    direction: 'asc' | 'desc'
  }
}

// Fired after table is sorted
{
  type: 'table:sorted',
  detail: {
    columnId: string,
    direction: 'asc' | 'desc',
    sortedPlayers: Player[]
  }
}

// Fired when user clicks on a table row
{
  type: 'table:row-clicked',
  detail: {
    player: Player,
    rowIndex: number
  }
}
```

### Events Consumed

```javascript
// Filter table based on search text
{
  type: 'player:search',
  detail: {
    searchText: string
  }
}

// Filter table by position
{
  type: 'player:filter-position',
  detail: {
    positions: string[]  // e.g., ["PG", "SG"]
  }
}

// Update table when players are drafted
{
  type: 'player:drafted',
  detail: {
    playerId: string,
    isDrafted: boolean
  }
}
```

---

## 3. Controls Component

**Module**: `src/ui/controls.js`

### Factory Function

```javascript
createControls(eventBus: EventTarget, options?: ControlsOptions): ControlsComponent
```

**Parameters**:
```typescript
interface ControlsOptions {
  container?: HTMLElement;           // Container element (default: .header)
  controlGroups?: ControlGroup[];    // Control group configuration
}
```

**Returns**: `ControlsComponent`

### Public Methods

```javascript
interface ControlsComponent {
  // Render all control groups
  render(): void;
  
  // Update a specific control's state
  updateControl(controlId: string, updates: Partial<ControlItem>): void;
  
  // Get control value
  getControlValue(controlId: string): any;
  
  // Enable/disable a control
  setControlEnabled(controlId: string, enabled: boolean): void;
  
  // Get all category selections
  getSelectedCategories(): string[];
  
  // Set category selections
  setSelectedCategories(categoryIds: string[]): void;
  
  // Destroy component and cleanup
  destroy(): void;
}
```

### Events Emitted

```javascript
// Fired when upload button is clicked
{
  type: 'controls:upload-requested',
  detail: {}
}

// Fired when stats view toggle is changed
{
  type: 'controls:stats-view-changed',
  detail: {
    view: 'lastYear' | 'projected'
  }
}

// Fired when search input value changes
{
  type: 'controls:search-changed',
  detail: {
    searchText: string
  }
}

// Fired when category checkbox is toggled
{
  type: 'controls:category-toggled',
  detail: {
    categoryId: string,
    isSelected: boolean,
    allSelected: string[]
  }
}

// Fired when Save Strategy button is clicked
{
  type: 'controls:save-strategy-requested',
  detail: {
    selectedCategories: string[]
  }
}

// Fired when Load Strategy button is clicked
{
  type: 'controls:load-strategy-requested',
  detail: {}
}

// Fired when Export button is clicked
{
  type: 'controls:export-requested',
  detail: {}
}
```

### Events Consumed

```javascript
// Disable/enable controls based on app state
{
  type: 'app:state-changed',
  detail: {
    hasData: boolean,
    isLoading: boolean
  }
}
```

---

## 4. Team Summary Component

**Module**: `src/ui/summary.js`

### Factory Function

```javascript
createTeamSummary(eventBus: EventTarget, options?: SummaryOptions): TeamSummaryComponent
```

**Parameters**:
```typescript
interface SummaryOptions {
  container?: HTMLElement;           // Container element (default: .summary-panel)
  config?: SummaryPanel;             // Summary configuration
}
```

**Returns**: `TeamSummaryComponent`

### Public Methods

```javascript
interface TeamSummaryComponent {
  // Render the summary panel
  render(): void;
  
  // Update team players list
  updateTeamPlayers(players: Player[]): void;
  
  // Update category totals
  updateCategoryTotals(totals: CategoryTotal[]): void;
  
  // Get current team player count
  getPlayerCount(): number;
  
  // Get category totals
  getCategoryTotals(): CategoryTotal[];
  
  // Destroy component and cleanup
  destroy(): void;
}
```

### Events Emitted

```javascript
// Fired when user clicks on a player in the team list
{
  type: 'summary:player-clicked',
  detail: {
    player: Player
  }
}
```

### Events Consumed

```javascript
// Update summary when player is added to team
{
  type: 'player:added-to-team',
  detail: {
    player: Player
  }
}

// Update summary when player is removed from team
{
  type: 'player:removed-from-team',
  detail: {
    playerId: string
  }
}

// Recalculate totals when categories change
{
  type: 'controls:category-toggled',
  detail: {
    categoryId: string,
    isSelected: boolean,
    allSelected: string[]
  }
}
```

---

## 5. Event Bus

**Module**: `src/utils/event-bus.js`

### Class Definition

```javascript
class EventBus extends EventTarget {
  // Emit a custom event
  emit(eventName: string, detail?: any): void;
  
  // Listen to an event
  on(eventName: string, handler: (event: CustomEvent) => void): void;
  
  // Remove event listener
  off(eventName: string, handler: (event: CustomEvent) => void): void;
  
  // Listen to event once
  once(eventName: string, handler: (event: CustomEvent) => void): void;
}
```

### Usage Example

```javascript
import { EventBus } from './utils/event-bus.js';

const appEvents = new EventBus();

// Emit event
appEvents.emit('player:search', { searchText: 'LeBron' });

// Listen to event
appEvents.on('player:search', (event) => {
  const { searchText } = event.detail;
  console.log('Search for:', searchText);
});

// Remove listener
const handler = (event) => { /* ... */ };
appEvents.on('player:search', handler);
appEvents.off('player:search', handler);

// Listen once
appEvents.once('player:search', (event) => {
  // Fires only on first occurrence
});
```

---

## 6. Application Bootstrap

**Module**: `src/app.js`

### Initialization Function

```javascript
function initializeApp(config?: AppConfig): Application
```

**Parameters**:
```typescript
interface AppConfig {
  container?: HTMLElement;           // Root container (default: document.body)
  layoutConfig?: LayoutConfig;       // Layout configuration
  tableConfig?: TableConfig;         // Table configuration
}
```

**Returns**:
```typescript
interface Application {
  // Start the application
  start(): void;
  
  // Stop and cleanup
  stop(): void;
  
  // Get component instances
  getComponents(): {
    layout: LayoutComponent,
    table: PlayerTableComponent,
    controls: ControlsComponent,
    summary: TeamSummaryComponent
  };
  
  // Get event bus
  getEventBus(): EventBus;
}
```

### Lifecycle

```javascript
// 1. Create app instance
const app = initializeApp({
  container: document.getElementById('app')
});

// 2. Start app (renders UI)
app.start();

// 3. Access components if needed
const { table, controls } = app.getComponents();

// 4. Stop app (cleanup)
// app.stop();
```

---

## 7. Component Integration Flow

### Initialization Sequence

```
1. initializeApp()
   ↓
2. Create EventBus instance
   ↓
3. Create Layout component
   ↓
4. Create child components:
   - Controls (header)
   - PlayerTable (main)
   - TeamSummary (sidebar)
   ↓
5. Render Layout
   ↓
6. Render child components
   ↓
7. Bind event listeners
   ↓
8. App ready
```

### Event Flow Example: Search

```
User types in search input
   ↓
Controls component detects input change
   ↓
Controls emits 'controls:search-changed'
   ↓
PlayerTable listens and filters rows
   ↓
PlayerTable updates DOM
```

### Event Flow Example: Category Toggle

```
User clicks category checkbox
   ↓
Controls component detects click
   ↓
Controls updates CategoryControl state
   ↓
Controls emits 'controls:category-toggled'
   ↓
Multiple listeners respond:
  - PlayerTable (future: re-rank players)
  - TeamSummary (future: recalc totals)
   ↓
Components update DOM
```

---

## 8. Data Type Definitions

### Player

```typescript
interface Player {
  id: string;                        // Unique identifier
  name: string;                      // Player name
  team: string;                      // Team abbreviation (3 letters)
  position: string;                  // Position(s), e.g., "PG/SG"
  expertRank: number;                // Original ranking from CSV
  algoRank: number | null;           // Calculated ranking (null before calculation)
  stats: PlayerStats;                // Statistical data
  isDrafted: boolean;                // Draft status
  isMyTeam: boolean;                 // On user's team
}

interface PlayerStats {
  // Last year actual stats
  lastYear: {
    pts: number;
    ast: number;
    reb: number;
    threepm: number;
    fgpct: number;                   // Decimal (0.504 = 50.4%)
    ftpct: number;                   // Decimal
    stl: number;
    blk: number;
    to: number;
  };
  
  // Projected stats
  projected: {
    pts: number;
    ast: number;
    reb: number;
    threepm: number;
    fgpct: number;
    ftpct: number;
    stl: number;
    blk: number;
    to: number;
  };
}
```

### LayoutConfig

```typescript
interface LayoutConfig {
  headerHeight: number;              // Height in pixels
  summaryWidth: number;              // Width in pixels
  summaryPosition: 'right' | 'bottom';
  minViewportWidth: number;          // Minimum supported width
  isResponsiveMode: boolean;         // True when below min width
}
```

### TableConfig

```typescript
interface TableConfig {
  columns: TableColumn[];            // Array of 14 columns
  sortedBy: string | null;           // Currently sorted column ID
  sortDirection: 'asc' | 'desc';     // Sort direction
  rowHeight: number;                 // Row height in pixels
  hasAlternatingRows: boolean;       // Alternating row backgrounds
  emptyStateMessage: string;         // Message when no data
}

interface TableColumn {
  id: string;                        // Unique column ID
  label: string;                     // Display label
  dataType: 'text' | 'number' | 'percentage';
  alignment: 'left' | 'right' | 'center';
  width: string;                     // CSS width value
  isSortable: boolean;               // Can be sorted
  sortDirection: 'asc' | 'desc' | null;
  isVisible: boolean;                // Currently visible
}
```

### ControlGroup & ControlItem

```typescript
interface ControlGroup {
  id: string;                        // Unique group ID
  label: string;                     // Accessible label
  controls: ControlItem[];           // Controls in group
  position: number;                  // Order position
  spacing: string;                   // CSS spacing value
}

interface ControlItem {
  id: string;                        // Unique control ID
  type: 'button' | 'input' | 'toggle' | 'checkbox';
  label: string;                     // Display/accessible label
  placeholder: string | null;        // For inputs
  value: any;                        // Current value
  isDisabled: boolean;               // Disabled state
  ariaLabel: string;                 // ARIA label
}

interface CategoryControl extends ControlItem {
  id: string;                        // Category ID
  label: string;                     // Abbreviation (e.g., "PTS")
  fullName: string;                  // Full name
  isSelected: boolean;               // Selected state
  sortOrder: number;                 // Display order (0-8)
}
```

### SummaryPanel & CategoryTotal

```typescript
interface SummaryPanel {
  heading: string;                   // Panel title
  playerCount: number;               // Number of players
  emptyStateMessage: string;         // No players message
  categoryTotals: CategoryTotal[];   // 9 category totals
  isExpanded: boolean;               // Expanded state
  maxVisiblePlayers: number;         // Max before scroll
}

interface CategoryTotal {
  categoryId: string;                // Category identifier
  label: string;                     // Display label
  total: number;                     // Aggregated value
  unit: string;                      // Unit of measurement
  format: 'decimal' | 'percentage';  // Display format
}
```

---

## 9. Error Handling

### Error Types

```typescript
class ComponentError extends Error {
  constructor(
    message: string,
    public componentName: string,
    public code: string
  ) {
    super(message);
    this.name = 'ComponentError';
  }
}
```

### Error Codes

- `INVALID_CONFIG`: Configuration validation failed
- `RENDER_FAILED`: Component rendering failed
- `EVENT_ERROR`: Event emission/handling failed
- `DOM_NOT_FOUND`: Required DOM element not found

### Error Handling Pattern

```javascript
try {
  component.render();
} catch (error) {
  if (error instanceof ComponentError) {
    console.error(`[${error.componentName}] ${error.message}`);
    // Show user-friendly error message
    showErrorMessage(`Failed to load ${error.componentName}`);
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

---

## 10. Testing Contracts

### Component Test Interface

Each component should be testable with this pattern:

```javascript
describe('ComponentName', () => {
  let component;
  let eventBus;
  let container;
  
  beforeEach(() => {
    eventBus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);
    component = createComponent(eventBus, { container });
  });
  
  afterEach(() => {
    component.destroy();
    document.body.removeChild(container);
  });
  
  test('renders correctly', () => {
    component.render();
    expect(container.children.length).toBeGreaterThan(0);
  });
  
  test('emits events', (done) => {
    eventBus.on('component:event', (e) => {
      expect(e.detail).toBeDefined();
      done();
    });
    component.triggerAction();
  });
  
  test('responds to events', () => {
    component.render();
    eventBus.emit('external:event', { data: 'test' });
    // Assert component state changed
  });
});
```

---

## Summary

This contract document defines:

1. **5 core component APIs**: Layout, PlayerTable, Controls, TeamSummary, EventBus
2. **Application bootstrap API**: Initialization and lifecycle
3. **20+ event types**: For inter-component communication
4. **8 data type definitions**: TypeScript-style interfaces for type safety
5. **Error handling patterns**: Consistent error types and codes
6. **Testing contracts**: Standard testing interface for all components

All components follow these patterns:
- Factory function creation
- EventBus-based communication
- Public method API
- Destroy method for cleanup
- Configuration through options
