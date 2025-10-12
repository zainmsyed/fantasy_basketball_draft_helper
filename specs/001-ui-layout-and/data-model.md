# Data Model: UI Layout and Component Structure

**Feature**: UI Layout and Component Structure  
**Branch**: 001-ui-layout-and  
**Date**: October 11, 2025

## Overview

This data model defines the entities and structures required for the UI layout and component system. Since this feature focuses on the visual structure and component organization (not business data), the entities represent UI state, component configuration, and layout metadata.

---

## Entity Definitions

### 1. LayoutConfig

Represents the configuration and state of the main application layout.

**Purpose**: Defines dimensions, positioning, and visibility of the three main sections.

**Attributes**:
- `headerHeight` (number): Height of header section in pixels (e.g., 64)
- `summaryWidth` (number): Width of team summary panel in pixels (e.g., 300)
- `summaryPosition` (string): Position of summary panel - "right" | "bottom"
- `minViewportWidth` (number): Minimum supported viewport width (default: 1024)
- `isResponsiveMode` (boolean): Whether viewport is below minimum width

**Validation Rules**:
- `headerHeight` must be >= 48px (minimum for touch targets)
- `summaryWidth` must be >= 250px and <= 400px
- `summaryPosition` must be one of: "right", "bottom"
- `minViewportWidth` must be >= 1024px (per requirements)

**State Transitions**:
- Normal → ResponsiveMode: When viewport width < minViewportWidth
- ResponsiveMode → Normal: When viewport width >= minViewportWidth

**Example**:
```javascript
{
  headerHeight: 64,
  summaryWidth: 300,
  summaryPosition: "right",
  minViewportWidth: 1024,
  isResponsiveMode: false
}
```

---

### 2. TableColumn

Represents a single column in the player data table.

**Purpose**: Defines column metadata for rendering, sorting, and alignment.

**Attributes**:
- `id` (string): Unique column identifier (e.g., "playerName", "pts", "algoRank")
- `label` (string): Display label for column header (e.g., "Player Name", "PTS")
- `dataType` (string): Type of data - "text" | "number" | "percentage"
- `alignment` (string): Cell content alignment - "left" | "right" | "center"
- `width` (string): Column width - CSS value (e.g., "200px", "1fr", "minmax(150px, 1fr)")
- `isSortable` (boolean): Whether column can be sorted
- `sortDirection` (string | null): Current sort direction - "asc" | "desc" | null
- `isVisible` (boolean): Whether column is currently visible

**Validation Rules**:
- `id` must be unique within table
- `label` must not be empty
- `dataType` must be one of: "text", "number", "percentage"
- `alignment` must be one of: "left", "right", "center"
- `width` must be valid CSS width value
- `sortDirection` must be one of: "asc", "desc", null

**Relationships**:
- TableColumn belongs to TableConfig (14 columns per requirement FR-013)

**Example**:
```javascript
{
  id: "playerName",
  label: "Player Name",
  dataType: "text",
  alignment: "left",
  width: "minmax(180px, 2fr)",
  isSortable: true,
  sortDirection: null,
  isVisible: true
}
```

---

### 3. TableConfig

Represents the configuration and state of the player data table.

**Purpose**: Manages table columns, sorting state, and display options.

**Attributes**:
- `columns` (TableColumn[]): Array of 14 table columns (per requirement FR-013)
- `sortedBy` (string | null): ID of currently sorted column
- `sortDirection` (string): Current sort direction - "asc" | "desc"
- `rowHeight` (number): Height of each table row in pixels (minimum 36px per FR-019)
- `hasAlternatingRows` (boolean): Whether rows have alternating backgrounds
- `emptyStateMessage` (string): Message to display when no data (per FR-018)

**Validation Rules**:
- `columns` array must contain exactly 14 columns
- `columns` must follow required order: Player Name, Team, Position, Expert Rank, Algo Rank, PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO
- `rowHeight` must be >= 36px (per FR-019)
- `sortedBy` must reference a valid column ID if not null

**Column Order (Required)**:
1. playerName
2. team
3. position
4. expertRank
5. algoRank
6. pts
7. ast
8. reb
9. threepm
10. fgpct
11. ftpct
12. stl
13. blk
14. to

**Example**:
```javascript
{
  columns: [
    { id: "playerName", label: "Player Name", /* ... */ },
    { id: "team", label: "Team", /* ... */ },
    // ... 12 more columns
  ],
  sortedBy: "algoRank",
  sortDirection: "asc",
  rowHeight: 40,
  hasAlternatingRows: true,
  emptyStateMessage: "No players loaded. Upload a CSV to get started."
}
```

---

### 4. ControlGroup

Represents a logical group of controls in the header section.

**Purpose**: Defines grouping, positioning, and spacing of related controls.

**Attributes**:
- `id` (string): Unique group identifier (e.g., "fileOps", "viewOptions", "filters", "strategy")
- `label` (string): Accessible label for the group (e.g., "File Operations")
- `controls` (ControlItem[]): Array of control items in this group
- `position` (number): Order position in header (0-based, left to right)
- `spacing` (string): Internal spacing between controls (CSS value)

**Validation Rules**:
- `id` must be unique within header
- `label` must not be empty
- `controls` array must not be empty
- `position` must be >= 0
- `spacing` must be valid CSS spacing value

**Required Groups (per FR-006)**:
1. File Operations (upload button)
2. View Options (stats toggle)
3. Filters (search input, category checkboxes)
4. Strategy Management (save/load/export buttons)

**Example**:
```javascript
{
  id: "fileOps",
  label: "File Operations",
  controls: [
    { id: "uploadBtn", type: "button", label: "Upload CSV", /* ... */ }
  ],
  position: 0,
  spacing: "var(--space-2)"
}
```

---

### 5. ControlItem

Represents an individual control element in the header.

**Purpose**: Defines properties and state of buttons, inputs, toggles, and checkboxes.

**Attributes**:
- `id` (string): Unique control identifier (e.g., "uploadBtn", "searchInput", "ptsCheckbox")
- `type` (string): Control type - "button" | "input" | "toggle" | "checkbox"
- `label` (string): Display label or accessible label
- `placeholder` (string | null): Placeholder text (for inputs)
- `value` (any): Current value of control
- `isDisabled` (boolean): Whether control is disabled
- `ariaLabel` (string): ARIA label for accessibility

**Validation Rules**:
- `id` must be unique across all controls
- `type` must be one of: "button", "input", "toggle", "checkbox"
- `label` must not be empty
- Button types must have clear action labels
- Input types must have placeholder or label

**Control Types**:
1. **Button**: Upload, Save, Load, Export
2. **Input**: Search field
3. **Toggle**: Last Year / Projected stats toggle
4. **Checkbox**: Category selection (9 checkboxes per FR-010)

**Example**:
```javascript
{
  id: "searchInput",
  type: "input",
  label: "Search Players",
  placeholder: "Search players...",
  value: "",
  isDisabled: false,
  ariaLabel: "Search players by name"
}
```

---

### 6. CategoryControl

Represents a statistical category checkbox control (specialization of ControlItem).

**Purpose**: Manages individual category selection for punt strategy.

**Attributes**:
- `id` (string): Category identifier (e.g., "pts", "ast", "reb", "threepm", "fgpct", "ftpct", "stl", "blk", "to")
- `label` (string): Display label (e.g., "PTS", "AST", "3PM")
- `fullName` (string): Full category name (e.g., "Points", "Assists", "Three-Pointers Made")
- `isSelected` (boolean): Whether category is currently selected (included in rankings)
- `sortOrder` (number): Display order in category list (0-8)

**Validation Rules**:
- `id` must be one of the 9 standard categories
- `label` must match standard abbreviations
- `sortOrder` must be unique and between 0-8

**Required Categories (per requirements 4.1.2)**:
1. pts (Points)
2. ast (Assists)
3. reb (Rebounds)
4. threepm (Three-Pointers Made)
5. fgpct (Field Goal Percentage)
6. ftpct (Free Throw Percentage)
7. stl (Steals)
8. blk (Blocks)
9. to (Turnovers)

**Example**:
```javascript
{
  id: "pts",
  label: "PTS",
  fullName: "Points",
  isSelected: true,
  sortOrder: 0
}
```

---

### 7. SummaryPanel

Represents the team summary panel configuration and state.

**Purpose**: Manages display of drafted team players and category totals.

**Attributes**:
- `heading` (string): Panel title (default: "My Team")
- `playerCount` (number): Number of players on team
- `emptyStateMessage` (string): Message when no players drafted
- `categoryTotals` (CategoryTotal[]): Array of 9 category totals
- `isExpanded` (boolean): Whether panel is expanded (for future collapsible feature)
- `maxVisiblePlayers` (number): Maximum players visible before scrolling

**Validation Rules**:
- `playerCount` must be >= 0
- `categoryTotals` must contain exactly 9 entries (all categories)
- `maxVisiblePlayers` must be >= 5

**Example**:
```javascript
{
  heading: "My Team",
  playerCount: 0,
  emptyStateMessage: "No players drafted yet. Build your team by selecting players.",
  categoryTotals: [
    { categoryId: "pts", label: "PTS", total: 0, unit: "per week" },
    // ... 8 more categories
  ],
  isExpanded: true,
  maxVisiblePlayers: 10
}
```

---

### 8. CategoryTotal

Represents a single category's aggregated statistics in the team summary.

**Purpose**: Displays weekly projected totals for each category.

**Attributes**:
- `categoryId` (string): Category identifier matching CategoryControl
- `label` (string): Display label (e.g., "PTS", "AST")
- `total` (number): Aggregated total value
- `unit` (string): Unit of measurement (default: "per week")
- `format` (string): Display format - "decimal" | "percentage"

**Validation Rules**:
- `categoryId` must match one of 9 standard categories
- `total` must be a valid number (can be 0)
- `format` must be one of: "decimal", "percentage"

**Formatting Rules**:
- Count stats (PTS, AST, REB, 3PM, STL, BLK, TO): Display as decimal with 1 digit (e.g., "126.5")
- Percentage stats (FG%, FT%): Display as percentage with 1 digit (e.g., "48.3%")

**Example**:
```javascript
{
  categoryId: "pts",
  label: "PTS",
  total: 126.5,
  unit: "per week",
  format: "decimal"
}
```

---

### 9. VisualTheme

Represents the design system configuration (CSS custom properties).

**Purpose**: Centralizes theming values for consistent styling.

**Attributes**:
- `primitiveTokens` (object): Base color, spacing, and typography values
- `semanticTokens` (object): Usage-specific token mappings
- `breakpoints` (object): Responsive breakpoint definitions

**Primitive Token Categories**:
- Colors: gray scale, blue (primary), green (success), red (error)
- Spacing: 4px-based scale (4, 8, 12, 16, 24, 32, 48, 64)
- Typography: font families, sizes, weights, line heights

**Semantic Token Categories**:
- Layout: header-bg, table-border, panel-bg
- Interactive: primary-button, hover-state, active-state
- Feedback: highlight-best (green), highlight-worst (red)
- States: disabled-opacity, drafted-opacity

**Example**:
```javascript
{
  primitiveTokens: {
    colors: {
      gray50: "#f9fafb",
      gray100: "#f3f4f6",
      blue500: "#3b82f6",
      green500: "#10b981",
      red500: "#ef4444"
    },
    spacing: {
      space1: "4px",
      space2: "8px",
      space4: "16px",
      space6: "24px"
    },
    typography: {
      fontBase: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSizeSm: "14px",
      fontSizeBase: "16px"
    }
  },
  semanticTokens: {
    headerBg: "var(--color-gray-50)",
    primaryButton: "var(--color-blue-500)",
    highlightBest: "var(--color-green-500)",
    highlightWorst: "var(--color-red-500)"
  },
  breakpoints: {
    tablet: "1024px",
    desktop: "1280px",
    wide: "1920px"
  }
}
```

---

## Entity Relationships

```
LayoutConfig
  └── (defines main structure)

TableConfig
  ├── TableColumn[] (14 columns)
  └── (references sortedBy column)

ControlGroup[]
  └── ControlItem[]
      └── CategoryControl (9 instances)

SummaryPanel
  └── CategoryTotal[] (9 totals)

VisualTheme
  └── (applied to all components)
```

---

## State Management

### UI State Structure

```javascript
const uiState = {
  layout: LayoutConfig,
  table: TableConfig,
  header: {
    controlGroups: ControlGroup[]
  },
  summary: SummaryPanel,
  theme: VisualTheme
};
```

### State Updates

UI state is managed in memory (not persisted to LocalStorage for this feature). State updates trigger DOM re-renders via component methods.

**Update Triggers**:
- Window resize → Updates `layout.isResponsiveMode`
- Column header click → Updates `table.sortedBy` and `table.sortDirection`
- Category checkbox toggle → Updates `CategoryControl.isSelected`
- Search input change → Triggers filter (no state change in this feature)

---

## Data Validation

### Client-Side Validation Rules

All validation occurs in JavaScript before updating state or rendering UI.

**Required Validations**:
1. Layout dimensions within min/max bounds
2. Table columns match required 14-column structure
3. Column order matches specification
4. Control IDs are unique
5. Category controls match 9 required categories
6. Summary totals are valid numbers

**Validation Utilities**:
```javascript
function validateLayoutConfig(config) {
  if (config.headerHeight < 48) {
    throw new Error("Header height must be at least 48px");
  }
  if (config.summaryWidth < 250 || config.summaryWidth > 400) {
    throw new Error("Summary width must be between 250-400px");
  }
  // ... more validations
}

function validateTableColumns(columns) {
  if (columns.length !== 14) {
    throw new Error("Table must have exactly 14 columns");
  }
  // Validate column order matches requirement
  const requiredOrder = [
    "playerName", "team", "position", "expertRank", "algoRank",
    "pts", "ast", "reb", "threepm", "fgpct", "ftpct", "stl", "blk", "to"
  ];
  columns.forEach((col, idx) => {
    if (col.id !== requiredOrder[idx]) {
      throw new Error(`Column ${idx} must be ${requiredOrder[idx]}, got ${col.id}`);
    }
  });
}
```

---

## Initialization Data

### Default Configuration

```javascript
// Default layout configuration
const defaultLayout = {
  headerHeight: 64,
  summaryWidth: 300,
  summaryPosition: "right",
  minViewportWidth: 1024,
  isResponsiveMode: false
};

// Default table configuration (14 columns)
const defaultTableConfig = {
  columns: [
    { id: "playerName", label: "Player Name", dataType: "text", alignment: "left", width: "minmax(180px, 2fr)", isSortable: true, sortDirection: null, isVisible: true },
    { id: "team", label: "Team", dataType: "text", alignment: "center", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "position", label: "Pos", dataType: "text", alignment: "center", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "expertRank", label: "Expert Rank", dataType: "number", alignment: "right", width: "100px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "algoRank", label: "Algo Rank", dataType: "number", alignment: "right", width: "100px", isSortable: true, sortDirection: "asc", isVisible: true },
    { id: "pts", label: "PTS", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "ast", label: "AST", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "reb", label: "REB", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "threepm", label: "3PM", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "fgpct", label: "FG%", dataType: "percentage", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "ftpct", label: "FT%", dataType: "percentage", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "stl", label: "STL", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "blk", label: "BLK", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true },
    { id: "to", label: "TO", dataType: "number", alignment: "right", width: "80px", isSortable: true, sortDirection: null, isVisible: true }
  ],
  sortedBy: "algoRank",
  sortDirection: "asc",
  rowHeight: 40,
  hasAlternatingRows: true,
  emptyStateMessage: "No players loaded. Upload a CSV to get started."
};

// Default category controls (9 categories, all selected initially)
const defaultCategories = [
  { id: "pts", label: "PTS", fullName: "Points", isSelected: true, sortOrder: 0 },
  { id: "ast", label: "AST", fullName: "Assists", isSelected: true, sortOrder: 1 },
  { id: "reb", label: "REB", fullName: "Rebounds", isSelected: true, sortOrder: 2 },
  { id: "threepm", label: "3PM", fullName: "Three-Pointers Made", isSelected: true, sortOrder: 3 },
  { id: "fgpct", label: "FG%", fullName: "Field Goal Percentage", isSelected: true, sortOrder: 4 },
  { id: "ftpct", label: "FT%", fullName: "Free Throw Percentage", isSelected: true, sortOrder: 5 },
  { id: "stl", label: "STL", fullName: "Steals", isSelected: true, sortOrder: 6 },
  { id: "blk", label: "BLK", fullName: "Blocks", isSelected: true, sortOrder: 7 },
  { id: "to", label: "TO", fullName: "Turnovers", isSelected: true, sortOrder: 8 }
];

// Default summary panel
const defaultSummary = {
  heading: "My Team",
  playerCount: 0,
  emptyStateMessage: "No players drafted yet. Build your team by selecting players.",
  categoryTotals: [
    { categoryId: "pts", label: "PTS", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "ast", label: "AST", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "reb", label: "REB", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "threepm", label: "3PM", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "fgpct", label: "FG%", total: 0, unit: "", format: "percentage" },
    { categoryId: "ftpct", label: "FT%", total: 0, unit: "", format: "percentage" },
    { categoryId: "stl", label: "STL", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "blk", label: "BLK", total: 0, unit: "per week", format: "decimal" },
    { categoryId: "to", label: "TO", total: 0, unit: "per week", format: "decimal" }
  ],
  isExpanded: true,
  maxVisiblePlayers: 10
};
```

---

## Summary

This data model defines 9 core entities that represent the UI structure, configuration, and state:

1. **LayoutConfig**: Main app layout dimensions and responsive state
2. **TableColumn**: Individual table column metadata (14 instances)
3. **TableConfig**: Table structure and sorting state
4. **ControlGroup**: Logical grouping of header controls (4 groups)
5. **ControlItem**: Individual control elements (buttons, inputs, toggles)
6. **CategoryControl**: Specialized category checkboxes (9 instances)
7. **SummaryPanel**: Team summary panel configuration
8. **CategoryTotal**: Individual category totals (9 instances)
9. **VisualTheme**: Design system tokens and theming

These entities are managed in-memory (not persisted in LocalStorage for this feature) and drive the component rendering and interaction logic.
