# Research: UI Layout and Component Structure

**Feature**: UI Layout and Component Structure  
**Branch**: 001-ui-layout-and  
**Date**: October 11, 2025

## Research Objectives

This research phase resolves technical unknowns and establishes best practices for implementing the foundational UI structure using vanilla JavaScript, HTML5, and CSS3.

---

## 1. Layout Techniques for Three-Section Design

### Decision: CSS Grid for Main Layout, Flexbox for Internal Sections

**Rationale**:
- CSS Grid provides precise control over the three main sections (header, table, summary)
- Grid's `grid-template-areas` enables semantic, readable layout definitions
- Flexbox handles internal component layouts (button groups, table cells, category lists)
- Both are fully supported in target browsers (Chrome, Firefox, Safari, Edge)
- No framework overhead, aligns with constitution's "no CSS frameworks" requirement

**Alternatives Considered**:
1. **Flexbox Only**: Rejected because managing three distinct sections (especially sidebar vs main content) is more complex with flexbox
2. **CSS Float/Position**: Rejected as legacy approach, harder to maintain, less semantic
3. **Table Layout**: Rejected as non-semantic and inflexible for responsive adjustments

**Implementation Details**:
```css
/* Main grid layout */
.app-container {
  display: grid;
  grid-template-areas:
    "header header"
    "table summary";
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 300px;
  height: 100vh;
}

.header { grid-area: header; }
.table { grid-area: table; }
.summary { grid-area: summary; }
```

---

## 2. Sticky Table Headers Implementation

### Decision: CSS `position: sticky` with Wrapper Approach

**Rationale**:
- Native CSS `position: sticky` provides 60fps performance without JavaScript
- Works seamlessly with scrolling containers
- Maintains table structure and semantics
- Requires proper parent/child positioning context (parent with overflow, sticky child)
- Supported in all target browsers without polyfills

**Alternatives Considered**:
1. **JavaScript-based Cloning**: Rejected due to complexity, maintenance overhead, and potential performance issues
2. **Fixed Positioning**: Rejected because requires calculating widths dynamically and breaks table flow
3. **Virtual Scrolling Library**: Rejected as adds dependency (violates constitution)

**Implementation Details**:
```css
.table-container {
  overflow-y: auto;
  height: calc(100vh - header-height);
}

.table thead th {
  position: sticky;
  top: 0;
  background: var(--header-bg);
  z-index: 10;
}
```

---

## 3. Performance Optimization for 200+ Table Rows

### Decision: Native DOM Rendering with CSS Optimization, No Virtualization (MVP)

**Rationale**:
- Modern browsers can handle 200 rows efficiently with proper CSS (transform, will-change)
- Constitution requires <100ms re-ranking for 200 players, feasible without virtualization
- Virtual scrolling adds complexity and may be premature optimization for MVP
- CSS containment and GPU acceleration sufficient for smooth 60fps scrolling
- If performance issues arise with 300+ rows, virtual scrolling can be added later

**Alternatives Considered**:
1. **Virtual Scrolling (Infinite Scroll)**: Rejected for MVP as added complexity; revisit if users need 500+ rows
2. **Pagination**: Rejected as breaks user flow during live drafts (need to see all players)
3. **Canvas Rendering**: Rejected as sacrifices accessibility, semantic HTML, and maintainability

**Implementation Details**:
```css
/* Performance optimizations */
.table-row {
  contain: layout style paint;
  will-change: transform;
}

.table-container {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
```

**Performance Monitoring**:
- Track render time for initial 200 rows (target: <500ms)
- Monitor scroll frame rate (target: 60fps)
- Measure re-paint performance on hover (target: <16ms)

---

## 4. CSS Custom Properties (Variables) Strategy

### Decision: Two-Tier System - Primitive Tokens + Semantic Tokens

**Rationale**:
- Primitive tokens define base values (colors, spacing, fonts)
- Semantic tokens map primitives to usage contexts (primary-button, table-header)
- Enables consistent theming across components
- Supports future dark mode or customization
- Aligns with constitution's "CSS Custom Properties for theming"

**Alternatives Considered**:
1. **Flat Variable Structure**: Rejected as leads to inconsistency and hard-to-maintain relationships
2. **SASS/LESS Variables**: Rejected as requires build tooling and violates "no CSS frameworks"
3. **Hardcoded Values**: Rejected as makes updates tedious and inconsistent

**Implementation Details**:
```css
/* variables.css - Primitive tokens */
:root {
  /* Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-blue-500: #3b82f6;
  --color-green-500: #10b981;
  --color-red-500: #ef4444;
  
  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Typography */
  --font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
}

/* Semantic tokens */
:root {
  --header-bg: var(--color-gray-50);
  --table-border: var(--color-gray-100);
  --primary-button: var(--color-blue-500);
  --highlight-best: var(--color-green-500);
  --highlight-worst: var(--color-red-500);
}
```

---

## 5. Component Communication Pattern

### Decision: CustomEvent-based Pub/Sub with EventTarget

**Rationale**:
- Native browser API, no dependencies required
- Loose coupling between UI components (controls don't know about table internals)
- Type-safe through custom event detail objects
- Easily testable (can dispatch and listen to events in tests)
- Aligns with constitution's "Event-Driven Communication"

**Alternatives Considered**:
1. **Direct Function Calls**: Rejected as creates tight coupling between components
2. **Global State Object**: Rejected as harder to track changes and test
3. **Observer Pattern Library**: Rejected as adds dependency

**Implementation Details**:
```javascript
// Event emitter utility
class EventBus extends EventTarget {
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  on(eventName, handler) {
    this.addEventListener(eventName, handler);
  }
  
  off(eventName, handler) {
    this.removeEventListener(eventName, handler);
  }
}

// Global bus instance
const appEvents = new EventBus();

// Example: Controls emit search event
appEvents.emit('player:search', { searchText: 'LeBron' });

// Example: Table listens for search event
appEvents.on('player:search', (event) => {
  const { searchText } = event.detail;
  filterPlayers(searchText);
});
```

---

## 6. Semantic HTML Structure

### Decision: HTML5 Semantic Elements with ARIA Landmarks

**Rationale**:
- Improves accessibility for screen readers
- Better document structure and maintainability
- No cost (native HTML5), aligns with "HTML-first approach"
- Supports SEO (though not critical for this app)

**Alternatives Considered**:
1. **Generic div/span Only**: Rejected as sacrifices accessibility and semantic meaning
2. **Custom Elements (Web Components)**: Rejected for MVP as added complexity; may revisit for reusable components

**Implementation Details**:
```html
<div class="app-container">
  <header class="header" role="banner">
    <nav class="controls" role="navigation" aria-label="Draft controls">
      <!-- Upload, toggle, search, categories, strategy buttons -->
    </nav>
  </header>
  
  <main class="table-container" role="main">
    <table class="player-table" role="grid" aria-label="Player rankings">
      <thead>
        <tr role="row">
          <th role="columnheader" aria-sort="ascending">Player Name</th>
          <!-- Other columns -->
        </tr>
      </thead>
      <tbody>
        <!-- Player rows -->
      </tbody>
    </table>
  </main>
  
  <aside class="summary-panel" role="complementary" aria-label="Team summary">
    <!-- My team section -->
  </aside>
</div>
```

---

## 7. Module Pattern for UI Components

### Decision: ES6 Modules with Factory Functions

**Rationale**:
- ES6 modules provide native import/export (no bundler required for modern browsers)
- Factory functions return encapsulated component instances
- Supports dependency injection (can pass in event bus, storage, etc.)
- Easy to test (can mock dependencies)
- Aligns with constitution's module design rules

**Alternatives Considered**:
1. **Class-based Components**: Considered but factory functions are lighter and more flexible
2. **IIFE Pattern**: Rejected as ES6 modules are now standard
3. **Global Namespace**: Rejected as violates "no global variables" constitution rule

**Implementation Details**:
```javascript
// ui/table.js
export function createPlayerTable(eventBus, options = {}) {
  const container = options.container || document.querySelector('.table-container');
  let players = [];
  
  function render() {
    // Render table HTML
  }
  
  function handleSort(column) {
    // Sort logic
    eventBus.emit('table:sorted', { column });
  }
  
  // Public API
  return {
    render,
    updatePlayers(newPlayers) {
      players = newPlayers;
      render();
    },
    destroy() {
      // Cleanup event listeners
    }
  };
}
```

---

## 8. Responsive Behavior Strategy

### Decision: CSS Media Queries with Graceful Degradation

**Rationale**:
- Constitution specifies minimum 1024px viewport (desktop-first)
- Below 1024px: display message or enable horizontal scroll (acceptable for MVP)
- CSS media queries handle viewport changes without JavaScript
- Future enhancement can add mobile-specific layout

**Alternatives Considered**:
1. **JavaScript-based Resize Detection**: Rejected as CSS media queries are more performant
2. **Mobile-First Design**: Rejected as constitution specifies desktop-first approach
3. **Fully Responsive Design**: Deferred to post-MVP (constitution: "Mobile-Last Approach")

**Implementation Details**:
```css
/* Desktop default (1024px+) */
.app-container {
  grid-template-columns: 1fr 300px;
}

/* Tablet/small desktop (1024px - 1280px) */
@media (max-width: 1280px) {
  .app-container {
    grid-template-columns: 1fr 250px;
  }
}

/* Below minimum (< 1024px) */
@media (max-width: 1023px) {
  .app-container::before {
    content: "Desktop browser recommended (1024px+ width)";
    /* Display warning message */
  }
  
  /* Alternative: allow horizontal scroll */
  .table-container {
    overflow-x: auto;
  }
}
```

---

## 9. Testing Strategy

### Decision: Jest for Unit Tests, Manual Testing for Visual/Layout

**Rationale**:
- Constitution specifies Jest for testing
- Unit tests for component logic (event handling, data updates, DOM manipulation)
- Manual testing required for visual verification (layout, spacing, colors)
- No visual regression testing for MVP (can add Percy/Chromatic later)

**Alternatives Considered**:
1. **Automated Visual Testing**: Deferred to post-MVP (added complexity)
2. **End-to-End Testing (Playwright/Cypress)**: Deferred as this feature has no user workflows yet
3. **No Testing**: Rejected as violates constitution's testing requirements

**Implementation Details**:
```javascript
// tests/unit/ui/table.test.js
import { createPlayerTable } from '../../../src/ui/table.js';

describe('PlayerTable Component', () => {
  let eventBus;
  let container;
  
  beforeEach(() => {
    eventBus = new EventTarget();
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  test('renders empty state when no players', () => {
    const table = createPlayerTable(eventBus, { container });
    table.render();
    expect(container.textContent).toContain('No players loaded');
  });
  
  test('emits sort event when column header clicked', () => {
    const table = createPlayerTable(eventBus, { container });
    const handler = jest.fn();
    eventBus.addEventListener('table:sorted', handler);
    
    // Simulate click on column header
    const header = container.querySelector('th[data-column="name"]');
    header.click();
    
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { column: 'name' }
      })
    );
  });
});
```

---

## 10. Accessibility Considerations

### Decision: ARIA Attributes + Keyboard Navigation

**Rationale**:
- ARIA roles and labels improve screen reader support
- Keyboard navigation essential for table sorting and control interactions
- Follows WCAG 2.1 Level AA guidelines (constitution requires 4.5:1 contrast ratio)
- No additional dependencies required

**Alternatives Considered**:
1. **No Accessibility Features**: Rejected as poor user experience and legal liability
2. **Full WCAG 2.1 AAA Compliance**: Deferred to post-MVP (Level AA sufficient for MVP)

**Implementation Details**:
```html
<!-- Sortable table headers with keyboard support -->
<th role="columnheader" 
    aria-sort="ascending" 
    tabindex="0"
    data-column="name">
  Player Name
  <span aria-hidden="true">↑</span>
</th>

<!-- Button controls with accessible labels -->
<button type="button" 
        class="upload-btn"
        aria-label="Upload player rankings CSV file">
  Upload CSV
</button>

<!-- Search input with label -->
<label for="player-search" class="visually-hidden">Search players</label>
<input type="search" 
       id="player-search"
       placeholder="Search players..."
       aria-label="Search players by name">
```

---

## Summary of Key Decisions

| Decision Area | Chosen Approach | Key Benefit |
|--------------|----------------|-------------|
| Main Layout | CSS Grid with template areas | Semantic, precise control over 3 sections |
| Sticky Headers | CSS position: sticky | Native performance, no JavaScript |
| Table Performance | CSS optimization (no virtualization) | Simpler, sufficient for 200 rows |
| Theming | CSS custom properties (2-tier) | Consistent, maintainable styling |
| Component Communication | CustomEvent-based pub/sub | Loose coupling, testable |
| HTML Structure | Semantic HTML5 + ARIA | Accessible, maintainable |
| Module Pattern | ES6 modules with factories | Native, dependency-injectable |
| Responsive | Media queries, desktop-first | Constitution-aligned, simple |
| Testing | Jest unit tests + manual visual | Practical for MVP, expandable |
| Accessibility | ARIA + keyboard nav (WCAG AA) | Inclusive, legal compliance |

---

## Open Questions & Future Research

### Deferred to Future Features
1. **Virtual Scrolling**: Revisit if users need 500+ player support
2. **Dark Mode**: Theming system supports it, but not MVP requirement
3. **Mobile Optimization**: Constitution specifies mobile-last approach
4. **Automated Visual Regression**: Consider Percy or Chromatic post-MVP
5. **Service Worker**: For offline support, but not needed for static UI structure

### No Blockers
All technical unknowns have been resolved. Implementation can proceed to Phase 1 (Design & Contracts).
