# Task Breakdown: UI Layout and Component Structure

**Feature**: UI Layout and Component Structure  
**Branch**: `001-ui-layout-and`  
**Date**: October 11, 2025  
**Spec**: [spec.md](./spec.md)

## Summary

This task breakdown organizes implementation by user story to enable independent development and testing. Each user story represents a complete, testable increment that delivers value independently.

**Total Tasks**: 45  
**Estimated Duration**: 15-20 hours  
**Parallelization Opportunities**: 15+ tasks can be done in parallel  
**MVP Scope**: User Story 1 (Core Application Shell Display)

---

## Phase 1: Setup & Project Initialization

**Goal**: Establish project structure, dependencies, and development environment.

### T001: Create Project Directory Structure
**File(s)**: File system  
**Description**: Create all necessary directories for source code, styles, tests, and assets.
```bash
mkdir -p src/ui
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/core
mkdir -p src/data
mkdir -p public/assets
mkdir -p tests/unit/ui
mkdir -p tests/integration/ui
```
**Acceptance**: All directories exist and are empty.

### T002: Initialize Package Configuration
**File(s)**: `package.json`  
**Description**: Create package.json with project metadata, no runtime dependencies, Jest for testing.
```json
{
  "name": "basketball-draft-helper",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```
**Acceptance**: `npm test` command exists (may fail with no tests yet).

### T003: Configure Jest for ES6 Modules
**File(s)**: `jest.config.js`  
**Description**: Configure Jest to work with ES6 modules and DOM testing.
```javascript
export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js'],
};
```
**Acceptance**: Jest configuration loads without errors.

### T004: Create CSS Variables File
**File(s)**: `src/styles/variables.css`  
**Description**: Define two-tier CSS custom properties (primitive + semantic tokens) per research decision #4.
- Primitive tokens: colors (gray, blue, green, red), spacing (4px scale), typography
- Semantic tokens: layout, table, buttons, interactive states, text
**Acceptance**: Variables file has 40+ custom properties organized in documented sections.

### T005: Create EventBus Utility [P]
**File(s)**: `src/utils/event-bus.js`  
**Description**: Implement CustomEvent-based pub/sub class extending EventTarget per research decision #5.
- Methods: emit(), on(), off(), once()
- Wraps native EventTarget with convenience methods
**Acceptance**: EventBus class can emit events and listeners receive them.

**Checkpoint**: ✓ Project structure complete, development tools configured

---

## Phase 2: Foundational Tasks (Blocking Prerequisites)

**Goal**: Create foundational infrastructure that all user stories depend on.

### T006: Create Main HTML Entry Point
**File(s)**: `src/index.html`  
**Description**: Create semantic HTML5 structure with app container, CSS imports, and module script tag.
- DOCTYPE, meta tags, title
- CSS imports in order (variables first)
- Script tag with type="module" for app.js
- Single div#app container
**Acceptance**: HTML validates, loads without console errors.

### T007: Create Application Bootstrap [P]
**File(s)**: `src/app.js`  
**Description**: Implement initializeApp() function that creates EventBus and coordinates components.
- Create global EventBus instance
- Provide start() and stop() lifecycle methods
- Return public API: getComponents(), getEventBus()
- Auto-start on DOMContentLoaded
**Acceptance**: App bootstraps, logs "Application ready!" to console.

### T008: Write EventBus Unit Tests [P]
**File(s)**: `tests/unit/utils/event-bus.test.js`  
**Description**: Test EventBus emit/on/off/once methods.
- Test event emission with detail payload
- Test multiple listeners
- Test listener removal
- Test once() fires only once
**Acceptance**: All EventBus tests pass.

**Checkpoint**: ✓ Foundation ready for component development

---

## Phase 3: User Story 1 - Core Application Shell Display (Priority: P1)

**Story Goal**: Display clean, organized interface with three distinct sections visible on load.

**Independent Test**: Open application → verify header, table area, and summary panel are visible and properly positioned with empty/placeholder content.

### T009: Create Layout Configuration Data Model
**File(s)**: `src/ui/layout.js` (constants section)  
**Description**: Define DEFAULT_LAYOUT_CONFIG object with headerHeight, summaryWidth, summaryPosition, minViewportWidth per data-model.md LayoutConfig entity.
```javascript
const DEFAULT_LAYOUT_CONFIG = {
  headerHeight: 64,
  summaryWidth: 300,
  summaryPosition: 'right',
  minViewportWidth: 1024,
  isResponsiveMode: false
};
```
**Acceptance**: Config object matches data model specification.

### T010: Implement Layout Component Factory Function
**File(s)**: `src/ui/layout.js`  
**Description**: Create createLayout() factory per contracts/component-api.md Layout contract.
- Accept options: container, config, eventBus
- Validate eventBus is provided (throw error if missing)
- Return public API: render(), updateConfig(), getConfig(), handleResize(), destroy()
**Acceptance**: Factory returns object with all required methods.

### T011: Implement Layout Render Method
**File(s)**: `src/ui/layout.js`  
**Description**: Implement render() method that creates semantic HTML structure.
- header.header with role="banner"
- main.table-container with role="main"
- aside.summary-panel with role="complementary"
- Bind resize event listener
**Acceptance**: Calling render() creates three sections in DOM.

### T012: Create Layout CSS Grid Styles
**File(s)**: `src/styles/layout.css`  
**Description**: Implement CSS Grid layout per research decision #1.
- .app-container with grid-template-areas
- grid-template-rows: auto 1fr
- grid-template-columns: 1fr 300px
- Position each section in named grid areas
- Reset styles: box-sizing, margin, padding
- Base html/body styles
**Acceptance**: Three sections positioned correctly at 1024px+ viewport.

### T013: Implement Responsive Layout Behavior [P]
**File(s)**: `src/styles/layout.css`  
**Description**: Add media queries for responsive behavior per research decision #8.
- @media (max-width: 1023px): Display warning message via ::before
- @media (max-width: 1280px): Adjust grid-template-columns to 1fr 250px
- Enable horizontal scroll for table below 1024px
**Acceptance**: Warning appears below 1024px, layout adjusts at 1280px.

### T014: Implement Layout Resize Handler [P]
**File(s)**: `src/ui/layout.js`  
**Description**: Implement handleResize() method that detects responsive mode changes.
- Check window.innerWidth against minViewportWidth
- Update isResponsiveMode state
- Emit 'layout:responsive-mode' event when state changes
**Acceptance**: Event fires when crossing 1024px threshold.

### T015: Style Header Section [P]
**File(s)**: `src/styles/layout.css`  
**Description**: Apply styles to .header section.
- Background: var(--header-bg)
- Border-bottom: 1px solid var(--header-border)
- Padding: var(--space-4)
- z-index: 100
**Acceptance**: Header visually distinct with background color and border.

### T016: Style Table Container Section [P]
**File(s)**: `src/styles/layout.css`  
**Description**: Apply styles to .table-container section.
- Background: var(--main-bg)
- Overflow-y: auto
- Padding: var(--space-4)
**Acceptance**: Table area scrollable, takes remaining space.

### T017: Style Summary Panel Section [P]
**File(s)**: `src/styles/layout.css`  
**Description**: Apply styles to .summary-panel section.
- Background: var(--panel-bg)
- Border-left: 1px solid var(--header-border)
- Padding: var(--space-4)
- Overflow-y: auto
**Acceptance**: Summary panel visually distinct on right side.

### T018: Integrate Layout Component into App Bootstrap
**File(s)**: `src/app.js`  
**Description**: Import createLayout and instantiate in initializeApp().
- Import createLayout from './ui/layout.js'
- Create layout instance with eventBus
- Call layout.render() in start() method
- Store in components object
**Acceptance**: App.start() renders layout with three sections.

### T019: Write Layout Component Unit Tests
**File(s)**: `tests/unit/ui/layout.test.js`  
**Description**: Test Layout component methods and events.
- Test render() creates three sections
- Test handleResize() emits responsive-mode event
- Test updateConfig() updates configuration
- Test destroy() removes event listeners
**Acceptance**: All layout tests pass.

### T020: Write Layout Integration Test
**File(s)**: `tests/integration/ui/layout-flow.test.js`  
**Description**: Test layout initialization through app bootstrap.
- Test app.start() renders layout
- Test layout sections are positioned correctly
- Test resize triggers responsive mode
**Acceptance**: Integration test passes.

### T021: Manual Visual Verification Checklist
**File(s)**: Documentation (checklist in quickstart.md)  
**Description**: Create and execute manual testing checklist for User Story 1.
- [ ] Three sections visible on load
- [ ] Header spans full width at top
- [ ] Table area takes remaining space
- [ ] Summary panel fixed on right (300px)
- [ ] Sections have distinct backgrounds
- [ ] Resizing maintains structure
- [ ] Warning appears below 1024px
- [ ] Console shows "Application ready!"
**Acceptance**: All checklist items verified ✓

**Checkpoint**: ✓ User Story 1 complete - Core shell displays correctly

---

## Phase 4: User Story 2 - Player Data Table Structure (Priority: P1)

**Story Goal**: View all available players in a structured table with stats and rankings.

**Independent Test**: Load mock player data → verify table displays all 14 required columns with proper headers, alignment, and sticky header behavior.

### T022: Create TableConfig Data Model
**File(s)**: `src/ui/table.js` (constants section)  
**Description**: Define DEFAULT_TABLE_CONFIG per data-model.md TableConfig entity.
- 14 columns array in required order (playerName, team, position, expertRank, algoRank, 9 stats)
- Each column: id, label, dataType, alignment, width, isSortable, sortDirection, isVisible
- Table config: sortedBy, sortDirection, rowHeight, hasAlternatingRows, emptyStateMessage
**Acceptance**: Config matches spec FR-013 column order exactly.

### T023: Implement PlayerTable Component Factory Function
**File(s)**: `src/ui/table.js`  
**Description**: Create createPlayerTable() factory per contracts/component-api.md.
- Accept eventBus (required) and options: container, config
- Initialize players array (empty)
- Return public API: render(), updatePlayers(), sortBy(), getSortState(), destroy()
**Acceptance**: Factory returns object with all required methods.

### T024: Implement Table Render Method - Empty State
**File(s)**: `src/ui/table.js`  
**Description**: Implement render() to display empty state when no players.
- Check if players array is empty
- Display emptyStateMessage in .table-empty-state div
- Use semantic HTML: role="status" for screen readers
**Acceptance**: Empty state shows "No players loaded. Upload a CSV to get started."

### T025: Implement Table Render Method - Header Row
**File(s)**: `src/ui/table.js`  
**Description**: Implement table header generation.
- Create <table role="grid"> element
- Generate <thead> with <tr role="row">
- For each column in config.columns, create <th role="columnheader">
- Add data-column attribute with column id
- Add sort indicator span if isSortable
- Add aria-sort attribute based on sortDirection
**Acceptance**: Table renders with 14 column headers matching FR-013 order.

### T026: Implement Table Render Method - Data Rows [P]
**File(s)**: `src/ui/table.js`  
**Description**: Implement table body generation.
- Create <tbody> element
- For each player, create <tr role="row"> with data-player-id attribute
- For each column, create <td> with proper alignment class
- Format cell content based on column dataType (text/number/percentage)
- Add click handler to emit 'table:row-clicked' event
**Acceptance**: Table renders player rows with aligned data.

### T027: Create Table CSS Styles
**File(s)**: `src/styles/table.css`  
**Description**: Style player table per research decision #2 (sticky headers).
- .player-table: width 100%, border-collapse separate
- thead th: position sticky, top 0, z-index 10
- tbody tr: border-bottom, hover transition
- tbody tr:hover: background var(--table-row-hover)
- tbody tr:nth-child(even): alternating background
- td alignment classes: .align-left, .align-right, .align-center
- .table-empty-state: centered, muted text
**Acceptance**: Sticky headers work, rows have hover state, alternating backgrounds.

### T028: Implement Table Sort Click Handler [P]
**File(s)**: `src/ui/table.js`  
**Description**: Add click listeners to sortable column headers.
- Bind click event to th[data-column] elements
- On click, determine new sort direction (toggle asc/desc)
- Emit 'table:sort-requested' event with columnId and direction
- Call sortBy() method
**Acceptance**: Clicking column header emits event and sorts table.

### T029: Implement Table sortBy Method [P]
**File(s)**: `src/ui/table.js`  
**Description**: Implement sortBy(columnId, direction) method.
- Update config.sortedBy and config.sortDirection
- Sort players array based on column dataType
- Handle null values (always sort to end)
- Re-render table with sorted data
- Emit 'table:sorted' event with sorted players
**Acceptance**: Table data sorts correctly by any column.

### T030: Add Table Performance Optimizations [P]
**File(s)**: `src/styles/table.css`  
**Description**: Add CSS performance optimizations per research decision #3.
- .table-row: contain layout style paint, will-change transform
- .table-container: -webkit-overflow-scrolling touch
**Acceptance**: Table scrolls smoothly at 60fps with 200+ rows.

### T031: Integrate PlayerTable into App Bootstrap
**File(s)**: `src/app.js`  
**Description**: Import createPlayerTable and instantiate.
- Import createPlayerTable from './ui/table.js'
- Create table instance with eventBus
- Call table.render() after layout.render()
- Store in components object
**Acceptance**: Table renders empty state on app start.

### T032: Create Mock Player Data Helper [P]
**File(s)**: `src/utils/mock-data.js`  
**Description**: Create generateMockPlayers(count) function for testing.
- Generate array of Player objects per contracts/component-api.md Player interface
- Include all required fields: id, name, team, position, ranks, stats
- Use realistic player names and team abbreviations
**Acceptance**: Can generate 200 mock players for testing.

### T033: Write PlayerTable Unit Tests
**File(s)**: `tests/unit/ui/table.test.js`  
**Description**: Test PlayerTable component.
- Test render() displays empty state when no players
- Test render() displays 14 columns with correct headers
- Test updatePlayers() renders rows
- Test sortBy() changes sort order
- Test row click emits event
**Acceptance**: All table tests pass.

### T034: Manual Table Testing with Mock Data
**File(s)**: Browser console testing  
**Description**: Load 200 mock players and verify table behavior.
```javascript
const mockPlayers = generateMockPlayers(200);
app.getComponents().table.updatePlayers(mockPlayers);
```
- [ ] All 14 columns visible with correct headers
- [ ] 200 rows render without performance issues
- [ ] Sticky headers remain visible while scrolling
- [ ] Hover state works on rows
- [ ] Alternating row backgrounds visible
- [ ] Clicking column header sorts table
- [ ] Numeric columns align right, text columns align left
**Acceptance**: All checklist items verified ✓

**Checkpoint**: ✓ User Story 2 complete - Table structure functional

---

## Phase 5: User Story 3 - Control Panel Organization (Priority: P2)

**Story Goal**: All control actions grouped together at the top for quick access.

**Independent Test**: Verify all control elements (upload button, category checkboxes, toggle switches, search bar, strategy buttons) are present in header and grouped logically.

### T035: Create ControlGroup and ControlItem Data Models
**File(s)**: `src/ui/controls.js` (constants section)  
**Description**: Define DEFAULT_CONTROL_GROUPS per data-model.md ControlGroup entity.
- 4 groups: File Operations, View Options, Filters, Strategy Management
- File Ops: Upload button
- View Options: Stats toggle (lastYear/projected)
- Filters: Search input, 9 category checkboxes
- Strategy: Save/Load/Export buttons
**Acceptance**: Control groups match FR-006 requirements.

### T036: Implement Controls Component Factory Function
**File(s)**: `src/ui/controls.js`  
**Description**: Create createControls() factory per contracts/component-api.md.
- Accept eventBus (required) and options: container, controlGroups
- Return API: render(), updateControl(), getControlValue(), setControlEnabled(), getSelectedCategories(), setSelectedCategories(), destroy()
**Acceptance**: Factory returns object with all required methods.

### T037: Implement Controls Render Method - Button Group
**File(s)**: `src/ui/controls.js`  
**Description**: Render File Operations and Strategy Management button groups.
- Create .control-group divs for each group
- Render buttons with labels, aria-labels
- Bind click handlers to emit events: 'controls:upload-requested', 'controls:save-strategy-requested', etc.
**Acceptance**: Upload, Save, Load, Export buttons render and emit events.

### T038: Implement Controls Render Method - Search Input [P]
**File(s)**: `src/ui/controls.js`  
**Description**: Render search input in Filters group.
- Create input[type="search"] with id, placeholder, aria-label
- Bind input event to emit 'controls:search-changed' with debouncing (300ms)
- Include <label> element (can be visually hidden)
**Acceptance**: Search input emits event on typing with 300ms debounce.

### T039: Implement Controls Render Method - Category Checkboxes [P]
**File(s)**: `src/ui/controls.js`  
**Description**: Render 9 category checkboxes in Filters group.
- For each category (PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO)
- Create checkbox input with id, label, checked state
- Bind change event to emit 'controls:category-toggled' with categoryId, isSelected, allSelected
- Use fieldset/legend for semantic grouping
**Acceptance**: 9 checkboxes render, all checked by default, emit events on toggle.

### T040: Implement Controls Render Method - Stats Toggle [P]
**File(s)**: `src/ui/controls.js`  
**Description**: Render toggle switch for stats view (lastYear/projected).
- Create toggle UI (checkbox styled as switch or radio buttons)
- Bind change event to emit 'controls:stats-view-changed' with view value
- Default to 'projected' view
**Acceptance**: Toggle switches between two views, emits event.

### T041: Create Controls CSS Styles
**File(s)**: `src/styles/controls.css`  
**Description**: Style header controls per spec FR-028 visual requirements.
- .controls: flexbox layout with gap, wrap
- .control-group: flex with gap, logical grouping
- button: padding, border-radius, colors from CSS vars
- button.primary: primary button styles with hover state
- input[type="search"]: border, border-radius, focus outline
- checkbox: minimum 24px touch target
**Acceptance**: Controls are organized in logical groups with proper spacing.

### T042: Integrate Controls into App Bootstrap
**File(s)**: `src/app.js`  
**Description**: Import createControls and instantiate.
- Import createControls from './ui/controls.js'
- Create controls instance with eventBus
- Call controls.render() after layout.render()
- Store in components object
**Acceptance**: Controls render in header on app start.

### T043: Write Controls Component Unit Tests
**File(s)**: `tests/unit/ui/controls.test.js`  
**Description**: Test Controls component.
- Test render() creates all 4 control groups
- Test button clicks emit correct events
- Test search input emits with debounce
- Test category toggles update state
- Test getSelectedCategories() returns correct array
**Acceptance**: All controls tests pass.

### T044: Manual Controls Testing
**File(s)**: Browser testing  
**Description**: Verify control interactions.
- [ ] Upload button visible and clickable
- [ ] Search input accepts text
- [ ] All 9 category checkboxes visible and labeled
- [ ] Stats toggle switches views
- [ ] Save/Load/Export buttons visible
- [ ] Controls organized in 4 logical groups
- [ ] All controls have hover states
- [ ] Spacing is consistent (8px/16px/24px)
**Acceptance**: All checklist items verified ✓

**Checkpoint**: ✓ User Story 3 complete - Controls organized and functional

---

## Phase 6: User Story 4 - Team Summary Panel Display (Priority: P2)

**Story Goal**: Dedicated area showing drafted players and combined statistics.

**Independent Test**: Verify team summary panel positioned correctly, displays empty state, and has designated areas for player list and category totals.

### T045: Create SummaryPanel Data Model
**File(s)**: `src/ui/summary.js` (constants section)  
**Description**: Define DEFAULT_SUMMARY_CONFIG per data-model.md SummaryPanel entity.
- heading: "My Team"
- playerCount: 0
- emptyStateMessage: "No players drafted yet. Build your team by selecting players."
- categoryTotals: Array of 9 CategoryTotal objects (all zeros initially)
- isExpanded: true
- maxVisiblePlayers: 10
**Acceptance**: Config matches FR-021 through FR-027 requirements.

### T046: Implement TeamSummary Component Factory Function
**File(s)**: `src/ui/summary.js`  
**Description**: Create createTeamSummary() factory per contracts/component-api.md.
- Accept eventBus (required) and options: container, config
- Initialize teamPlayers array (empty)
- Return API: render(), updateTeamPlayers(), updateCategoryTotals(), getPlayerCount(), getCategoryTotals(), destroy()
**Acceptance**: Factory returns object with all required methods.

### T047: Implement Summary Render Method - Empty State
**File(s)**: `src/ui/summary.js`  
**Description**: Render empty state when no players on team.
- Display heading with player count: "My Team (0)"
- Show emptyStateMessage in .summary-empty-state
- Render category totals section with all zeros
**Acceptance**: Empty state displays with message and zero totals.

### T048: Implement Summary Render Method - Player List [P]
**File(s)**: `src/ui/summary.js`  
**Description**: Render list of drafted team players.
- Create scrollable .summary-player-list container
- For each player, create .summary-player-item with name, position, team
- Add click handler to emit 'summary:player-clicked' event
- Limit visible players to maxVisiblePlayers with scroll
**Acceptance**: Player list renders and scrolls after 10 players.

### T049: Implement Summary Render Method - Category Totals [P]
**File(s)**: `src/ui/summary.js`  
**Description**: Render category totals section.
- Create .category-totals container
- For each CategoryTotal, create .category-total with label and value
- Format values based on format type (decimal: "126.5", percentage: "48.3%")
- Align labels left, values right
**Acceptance**: 9 category totals display with proper formatting.

### T050: Create Summary CSS Styles
**File(s)**: `src/styles/summary.css`  
**Description**: Style team summary panel.
- .summary-panel h2: heading styles
- .summary-player-count: muted secondary text
- .summary-empty-state: centered, muted
- .summary-player-list: scrollable, max-height based on maxVisiblePlayers
- .summary-player-item: padding, border, hover state
- .category-totals: margin-top
- .category-total: flex justify-between, border-bottom
- .category-total-label: font-weight medium
- .category-total-value: font-weight semibold
**Acceptance**: Summary panel visually organized with clear sections.

### T051: Implement updateCategoryTotals Method [P]
**File(s)**: `src/ui/summary.js`  
**Description**: Calculate and update category totals from team players.
- Accept array of Player objects
- Sum each category across all players
- Handle percentage stats correctly (weighted average by games played)
- Update categoryTotals array
- Re-render category totals section
**Acceptance**: Totals calculate correctly when players added.

### T052: Integrate TeamSummary into App Bootstrap
**File(s)**: `src/app.js`  
**Description**: Import createTeamSummary and instantiate.
- Import createTeamSummary from './ui/summary.js'
- Create summary instance with eventBus
- Call summary.render() after layout.render()
- Store in components object
**Acceptance**: Summary panel renders empty state on app start.

### T053: Write TeamSummary Unit Tests
**File(s)**: `tests/unit/ui/summary.test.js`  
**Description**: Test TeamSummary component.
- Test render() displays empty state
- Test updateTeamPlayers() renders player list
- Test updateCategoryTotals() calculates sums correctly
- Test player click emits event
- Test getPlayerCount() returns correct count
**Acceptance**: All summary tests pass.

### T054: Manual Summary Testing
**File(s)**: Browser console testing  
**Description**: Verify summary panel with mock team data.
```javascript
const mockTeam = generateMockPlayers(5);
app.getComponents().summary.updateTeamPlayers(mockTeam);
app.getComponents().summary.updateCategoryTotals(mockTeam);
```
- [ ] Panel positioned on right side (300px width)
- [ ] Heading shows "My Team (5)"
- [ ] 5 players listed with name, position, team
- [ ] Player list is scrollable if >10 players
- [ ] All 9 category totals display
- [ ] Totals formatted correctly (decimals and percentages)
- [ ] Player items have hover state
- [ ] Panel scrolls independently from main table
**Acceptance**: All checklist items verified ✓

**Checkpoint**: ✓ User Story 4 complete - Summary panel functional

---

## Phase 7: User Story 5 - Visual Hierarchy and Spacing (Priority: P3)

**Story Goal**: Consistent spacing, typography, and visual hierarchy throughout interface.

**Independent Test**: Measure spacing between elements, verify font sizes follow consistent scale, confirm visual emphasis highlights important information.

### T055: Audit and Refine Spacing Scale
**File(s)**: `src/styles/variables.css`, all CSS files  
**Description**: Review all CSS files for spacing consistency.
- Ensure all padding/margin uses CSS variables (--space-1 through --space-16)
- Minimum 8px spacing between distinct elements (--space-2)
- Consistent spacing within component groups
- Verify 4px base scale is followed
**Acceptance**: No hardcoded spacing values, all use CSS variables.

### T056: Audit and Refine Typography Scale [P]
**File(s)**: `src/styles/variables.css`, all CSS files  
**Description**: Review all typography for consistency.
- Headings use larger sizes (--font-size-lg, --font-size-xl)
- Body text uses --font-size-base or --font-size-sm
- Font weights: semibold/bold for headings, medium for labels, normal for body
- Line heights: tight for headings, normal for body
- Ensure minimum 14px font size (--font-size-sm)
**Acceptance**: Typography follows consistent scale, proper hierarchy visible.

### T057: Refine Table Row Visual Separation [P]
**File(s)**: `src/styles/table.css`  
**Description**: Improve row distinction for scanning per FR-020.
- Decide: alternating backgrounds OR horizontal borders (not both)
- If alternating: every even row gets --table-row-alt background
- If borders: 1px border-bottom on every row
- Ensure sufficient contrast for readability (test with 200 rows)
**Acceptance**: Users can track across columns without losing place.

### T058: Ensure Interactive Element Touch Targets [P]
**File(s)**: `src/styles/controls.css`, `src/styles/table.css`  
**Description**: Verify all interactive elements meet minimum size per FR-036.
- Buttons: minimum 32px height
- Checkboxes: minimum 24px click area (can use padding on label)
- Table column headers: minimum 36px height
- Input fields: minimum 32px height
**Acceptance**: All interactive elements meet touch target minimums.

### T059: Add Visual Affordance for Interactivity [P]
**File(s)**: All CSS files  
**Description**: Ensure all interactive elements have clear hover/focus states.
- Buttons: background color change on hover
- Links: underline or color change on hover
- Table rows: background change on hover
- Inputs: outline on focus (2px solid primary color)
- Column headers: cursor pointer, subtle background change
**Acceptance**: Hover states visible within 100ms per SC-004.

### T060: Audit Color Contrast Ratios [P]
**File(s)**: `src/styles/variables.css`  
**Description**: Verify color contrast meets WCAG 2.1 AA (4.5:1 for normal text).
- Test text-primary on main-bg: should be >4.5:1
- Test text-secondary on main-bg: should be >4.5:1
- Test button-primary-text on button-primary-bg: should be >4.5:1
- Use browser DevTools or online contrast checker
- Adjust colors if needed
**Acceptance**: All text colors pass 4.5:1 contrast ratio.

### T061: Document Design System in CSS Comments
**File(s)**: `src/styles/variables.css`  
**Description**: Add comprehensive comments to CSS variables file.
- Explain two-tier token system (primitive vs semantic)
- Document spacing scale rationale (4px base)
- List color palette with usage guidelines
- Note typography scale with hierarchy
**Acceptance**: Variables file has clear documentation for future developers.

### T062: Final Visual Polish Pass
**File(s)**: All CSS files  
**Description**: Review entire UI for visual consistency.
- Border radii consistent (--radius-sm, --radius-md)
- Shadows used appropriately (--shadow-sm for subtle depth)
- Colors limited to defined palette (no one-off colors)
- Spacing feels rhythmic and intentional
- Visual hierarchy guides eye to important elements (player names, rankings)
**Acceptance**: UI feels polished and professional.

### T063: Manual Visual Hierarchy Testing
**File(s)**: Browser testing with complete UI  
**Description**: Verify visual hierarchy with full data.
- [ ] Headings larger and bolder than body text
- [ ] Player names stand out in table (bold or larger)
- [ ] Rankings visually emphasized
- [ ] Consistent 8px minimum spacing between elements
- [ ] Interactive elements have 32px+ height
- [ ] Hover states respond within 100ms
- [ ] Alternating rows or borders aid scanning
- [ ] Summary panel visually distinct from main content
**Acceptance**: All checklist items verified ✓

**Checkpoint**: ✓ User Story 5 complete - Visual hierarchy polished

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final integration, performance validation, documentation.

### T064: Performance Testing with 200+ Players
**File(s)**: Browser DevTools Performance tab  
**Description**: Validate performance targets per success criteria.
- Generate 300 mock players
- Measure initial render time (target: <500ms)
- Measure scroll frame rate (target: 60fps)
- Measure sort operation time (target: <100ms)
- Measure hover response time (target: <100ms, per SC-004)
**Acceptance**: All performance targets met per constitution.

### T065: Accessibility Audit
**File(s)**: All HTML/CSS/JS files  
**Description**: Verify WCAG 2.1 AA compliance per research decision #10.
- Run Lighthouse accessibility audit (target: 95+ score)
- Test keyboard navigation (Tab, Enter, Space, Arrow keys)
- Test with screen reader (VoiceOver/NVDA) - basic navigation
- Verify all ARIA attributes correct
- Ensure no focus traps
**Acceptance**: Lighthouse accessibility score 95+, keyboard navigation works.

### T066: Cross-Browser Testing
**File(s)**: Complete application  
**Description**: Test on target browsers per constitution.
- Chrome latest: Full functionality
- Firefox latest: Full functionality
- Safari latest: Full functionality
- Edge latest: Full functionality
- Verify CSS Grid, Flexbox, CustomEvents support
**Acceptance**: Application works identically on all four browsers.

### T067: Bundle Size Validation
**File(s)**: All JS and CSS files  
**Description**: Verify bundle size meets <100KB target per constitution.
- Measure all JS files combined (should be <20KB)
- Measure all CSS files combined (should be <15KB)
- Total <35KB uncompressed, <20KB gzipped
- No dependencies, so only source code counts
**Acceptance**: Total bundle size <100KB gzipped (far below target).

### T068: Update README with Quickstart
**File(s)**: `README.md`  
**Description**: Document project setup and usage.
- Copy quickstart guide content from specs/001-ui-layout-and/quickstart.md
- Add project overview, tech stack, browser support
- Include screenshots or ASCII art of layout
- Link to constitution and specs
**Acceptance**: New developers can set up project from README.

### T069: Create Demo Mode with Mock Data
**File(s)**: `src/utils/demo.js`  
**Description**: Add demo mode for showcasing UI without CSV upload.
- Generate 200 realistic mock players
- Auto-load on app start if no data present
- Add "Demo Mode" indicator in header
- Helpful for development and demonstrations
**Acceptance**: App shows realistic data on first load.

### T070: Final Integration Test
**File(s)**: Manual end-to-end test  
**Description**: Execute complete user flow through all features.
1. Open application
2. Verify three sections render
3. Verify 200 players display in table
4. Click column headers to sort (test 3 columns)
5. Type in search box (verify debounce)
6. Toggle category checkboxes (test 3 categories)
7. Switch stats view toggle
8. Resize browser window (test responsive mode)
9. Verify summary panel shows correct totals
10. Check console for errors
**Acceptance**: All steps complete without errors, UI responsive.

**Checkpoint**: ✓ Feature complete, ready for PR review

---

## Dependencies Between User Stories

```
User Story 1 (Core Shell) ← Foundation for all others
  ├─→ User Story 2 (Table Structure) ← Requires layout
  ├─→ User Story 3 (Controls) ← Requires layout
  └─→ User Story 4 (Summary) ← Requires layout

User Story 2, 3, 4 ← Independent from each other, can be parallelized

User Story 5 (Visual Polish) ← Depends on all others being complete
```

**Critical Path**: Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1: Shell) → Phases 4-6 can be parallel → Phase 7 (US5: Polish) → Phase 8 (Integration)

---

## Parallel Execution Opportunities

### Parallel Track A: After Phase 3 (User Story 1) Complete
- T022-T034: Player Table (User Story 2)
- T035-T044: Controls (User Story 3)
- T045-T054: Team Summary (User Story 4)

**Estimated savings**: ~8 hours if three developers work in parallel

### Parallel Track B: Within User Story Phases
- CSS files can be created independently (marked [P])
- Unit tests can be written in parallel with implementation (marked [P])
- Different component render methods can be built in parallel (marked [P])

**Estimated savings**: ~4 hours with proper task distribution

### Parallel Track C: Polish Phase (Phase 7)
- All T055-T063 can be done in parallel by different developers
- Each task touches different files or different aspects

**Estimated savings**: ~3 hours with team collaboration

---

## Implementation Strategy

### MVP Scope (Week 1)
**Goal**: Deliver User Story 1 (Core Shell) only
- Phase 1: Setup (T001-T005) - 2 hours
- Phase 2: Foundation (T006-T008) - 2 hours
- Phase 3: User Story 1 (T009-T021) - 6 hours
- **Total**: 10 hours, ~1.5 days

**Deliverable**: Application loads with three-section layout, empty but functional structure.

### Increment 2 (Week 2)
**Goal**: Add User Story 2 (Table Structure)
- Phase 4: User Story 2 (T022-T034) - 6 hours
- **Total**: 6 hours, ~1 day

**Deliverable**: Table displays 200+ players with sortable columns.

### Increment 3 (Week 2-3)
**Goal**: Add User Stories 3 & 4 in parallel
- Phase 5: User Story 3 (T035-T044) - 4 hours
- Phase 6: User Story 4 (T045-T054) - 4 hours
- **Total**: 8 hours, ~1 day (if parallel), ~2 days (if sequential)

**Deliverable**: Complete UI with all interactive controls and summary panel.

### Increment 4 (Week 3)
**Goal**: Polish and ship
- Phase 7: User Story 5 (T055-T063) - 4 hours
- Phase 8: Polish (T064-T070) - 3 hours
- **Total**: 7 hours, ~1 day

**Deliverable**: Production-ready UI foundation for subsequent features.

---

## Testing Strategy

### Unit Tests (Jest)
- **Target Coverage**: 80%+ for component logic
- **Files**: 5 test files (event-bus, layout, table, controls, summary)
- **Run Frequency**: On every commit (pre-commit hook recommended)

### Integration Tests
- **Target**: 2-3 key flows (layout initialization, component communication)
- **Files**: 1-2 integration test files
- **Run Frequency**: Before PR merge

### Manual Testing
- **Target**: Visual verification, accessibility, cross-browser
- **Checklists**: Provided in tasks T021, T034, T044, T054, T063
- **Run Frequency**: After each user story completion

### Performance Testing
- **Target**: Validate all success criteria (SC-001 through SC-010)
- **Tools**: Browser DevTools Performance tab, Lighthouse
- **Run Frequency**: Before final release (Task T064)

---

## Estimated Timeline

| Phase | Tasks | Hours | Dependencies |
|-------|-------|-------|--------------|
| Phase 1: Setup | T001-T005 | 2h | None |
| Phase 2: Foundation | T006-T008 | 2h | Phase 1 |
| Phase 3: US1 (Shell) | T009-T021 | 6h | Phase 2 |
| Phase 4: US2 (Table) | T022-T034 | 6h | Phase 3 |
| Phase 5: US3 (Controls) | T035-T044 | 4h | Phase 3 |
| Phase 6: US4 (Summary) | T045-T054 | 4h | Phase 3 |
| Phase 7: US5 (Polish) | T055-T063 | 4h | Phases 4-6 |
| Phase 8: Final Polish | T064-T070 | 3h | Phase 7 |
| **Total** | **70 tasks** | **31h** | |

**With parallelization**: ~20 hours (2.5 days for 1 developer, 1.5 days for 2 developers)

---

## Success Metrics

Upon completion of all tasks, the feature should achieve:

✅ **User Story Success**:
- US1: Three sections visible and properly positioned
- US2: Table displays 200+ players with 14 columns, sortable
- US3: All controls organized in logical groups, fully functional
- US4: Summary panel shows team and category totals
- US5: Consistent spacing, typography, visual hierarchy

✅ **Success Criteria Met**:
- SC-001: Sections identifiable within 5 seconds
- SC-002: Controls locatable within 10 seconds
- SC-003: 200 rows scroll at 60fps
- SC-004: Hover states respond within 100ms
- SC-005: Layout renders within 3 seconds
- SC-006: Users can track across table rows
- SC-007: Usable layout 1024px-1920px
- SC-008: Sticky headers work
- SC-009: All category totals visible
- SC-010: 80% can identify where to start

✅ **Technical Quality**:
- 80%+ unit test coverage
- All constitution gates passed
- <100KB bundle size (far below limit)
- WCAG 2.1 AA compliant
- Works on Chrome, Firefox, Safari, Edge

✅ **Documentation Complete**:
- README updated with quickstart
- All CSS variables documented
- Component APIs match contracts
- Manual testing checklists executed

---

## Next Steps After This Feature

After completing the UI Layout and Component Structure feature, the following features can be built on this foundation:

1. **CSV Upload and Parsing** - Implement file upload to populate table with real data
2. **Z-Score Ranking Algorithm** - Calculate custom rankings based on punt strategy
3. **Draft Tracking** - Mark players as drafted, move to "My Team"
4. **Strategy Save/Load** - Persist punt strategies to LocalStorage
5. **Export Rankings** - Download customized rankings as CSV
6. **Visual Highlighting** - Color-code best/worst players in each category
7. **Basketball Reference Integration** - Fetch live player data from API

Each subsequent feature will use the UI components, event bus, and styling foundation established in this feature.

---

**End of Task Breakdown**