# Quick Start Guide: UI Layout and Component Structure

**Feature**: UI Layout and Component Structure  
**Branch**: 001-ui-layout-and  
**Date**: October 11, 2025

## Overview

This guide helps developers implement the foundational UI structure for the Basketball Draft Helper application. Follow these steps to create the three-section layout, component system, and styling foundation.

---

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge latest version)
- Text editor or IDE
- Basic knowledge of HTML5, CSS3, and JavaScript ES6+
- Local web server (e.g., Python's `http.server`, Node's `http-server`, or VS Code Live Server)

**No build tools or dependencies required** - this is vanilla JavaScript!

---

## Project Setup

### 1. Clone and Navigate

```bash
cd /home/zain/Documents/coding/draft_helper
git checkout 001-ui-layout-and
```

### 2. Create Directory Structure

```bash
# Create source directories
mkdir -p src/ui
mkdir -p src/utils
mkdir -p src/styles
mkdir -p public/assets

# Create test directories
mkdir -p tests/unit/ui
mkdir -p tests/integration/ui
```

---

## Implementation Steps

### Step 1: Create HTML Structure (10 minutes)

Create `src/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basketball Draft Helper</title>
  
  <!-- CSS files (load in order) -->
  <link rel="stylesheet" href="styles/variables.css">
  <link rel="stylesheet" href="styles/layout.css">
  <link rel="stylesheet" href="styles/table.css">
  <link rel="stylesheet" href="styles/controls.css">
  <link rel="stylesheet" href="styles/summary.css">
</head>
<body>
  <div id="app" class="app-container">
    <!-- Layout component will render here -->
  </div>
  
  <!-- JavaScript modules (load as ES6 modules) -->
  <script type="module" src="app.js"></script>
</body>
</html>
```

**Checkpoint**: Open in browser - you should see a blank page with the title "Basketball Draft Helper"

---

### Step 2: Create CSS Variables (15 minutes)

Create `src/styles/variables.css`:

```css
/**
 * Design System - CSS Custom Properties
 * Two-tier token system: Primitive + Semantic
 */

:root {
  /* ===== PRIMITIVE TOKENS ===== */
  
  /* Color palette */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  --color-blue-50: #eff6ff;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  
  --color-green-50: #f0fdf4;
  --color-green-500: #10b981;
  
  --color-red-50: #fef2f2;
  --color-red-500: #ef4444;
  
  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Typography */
  --font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  --font-mono: 'Monaco', 'Menlo', 'Consolas', monospace;
  
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* ===== SEMANTIC TOKENS ===== */
  
  /* Layout */
  --header-bg: var(--color-gray-50);
  --header-border: var(--color-gray-200);
  --main-bg: var(--color-white);
  --panel-bg: var(--color-gray-50);
  
  /* Table */
  --table-border: var(--color-gray-200);
  --table-header-bg: var(--color-white);
  --table-row-hover: var(--color-gray-50);
  --table-row-alt: var(--color-gray-50);
  
  /* Buttons */
  --button-primary-bg: var(--color-blue-500);
  --button-primary-hover: var(--color-blue-600);
  --button-primary-text: var(--color-white);
  
  /* Interactive states */
  --highlight-best: var(--color-green-500);
  --highlight-best-bg: var(--color-green-50);
  --highlight-worst: var(--color-red-500);
  --highlight-worst-bg: var(--color-red-50);
  
  /* Text */
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --text-muted: var(--color-gray-400);
  
  /* States */
  --disabled-opacity: 0.5;
  --drafted-opacity: 0.5;
}
```

**Checkpoint**: Variables are defined but not yet used

---

### Step 3: Create Layout Styles (20 minutes)

Create `src/styles/layout.css`:

```css
/**
 * Main Application Layout
 * Three-section grid: Header, Table, Summary
 */

/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: var(--font-base);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* Main app container - CSS Grid layout */
.app-container {
  display: grid;
  grid-template-areas:
    "header header"
    "table summary";
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 300px;
  height: 100vh;
  overflow: hidden;
}

/* Header section */
.header {
  grid-area: header;
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  padding: var(--space-4);
  z-index: 100;
}

/* Main table area */
.table-container {
  grid-area: table;
  overflow-y: auto;
  background: var(--main-bg);
  padding: var(--space-4);
}

/* Team summary panel */
.summary-panel {
  grid-area: summary;
  background: var(--panel-bg);
  border-left: 1px solid var(--header-border);
  padding: var(--space-4);
  overflow-y: auto;
}

/* Responsive behavior - below 1024px */
@media (max-width: 1023px) {
  .app-container::before {
    content: "Desktop browser recommended (minimum 1024px width)";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--color-red-500);
    color: white;
    padding: var(--space-2);
    text-align: center;
    z-index: 1000;
    font-size: var(--font-size-sm);
  }
  
  /* Alternative: enable horizontal scrolling */
  .table-container {
    overflow-x: auto;
  }
}

/* Tablet adjustments */
@media (max-width: 1280px) {
  .app-container {
    grid-template-columns: 1fr 250px;
  }
}
```

**Checkpoint**: Layout grid defined but sections are empty

---

### Step 4: Create Event Bus Utility (10 minutes)

Create `src/utils/event-bus.js`:

```javascript
/**
 * Event Bus for component communication
 * Extends native EventTarget for custom event pub/sub
 */

export class EventBus extends EventTarget {
  /**
   * Emit a custom event
   * @param {string} eventName - Event name (e.g., 'player:search')
   * @param {any} detail - Event payload
   */
  emit(eventName, detail = null) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  /**
   * Listen to an event
   * @param {string} eventName - Event name to listen for
   * @param {Function} handler - Event handler function
   */
  on(eventName, handler) {
    this.addEventListener(eventName, handler);
  }
  
  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Handler to remove
   */
  off(eventName, handler) {
    this.removeEventListener(eventName, handler);
  }
  
  /**
   * Listen to event once
   * @param {string} eventName - Event name
   * @param {Function} handler - Handler function
   */
  once(eventName, handler) {
    const wrappedHandler = (event) => {
      handler(event);
      this.off(eventName, wrappedHandler);
    };
    this.on(eventName, wrappedHandler);
  }
}
```

**Checkpoint**: Event bus created, can be imported in other modules

---

### Step 5: Create Layout Component (30 minutes)

Create `src/ui/layout.js`:

```javascript
/**
 * Layout Component
 * Manages the three-section app structure
 */

const DEFAULT_CONFIG = {
  headerHeight: 64,
  summaryWidth: 300,
  summaryPosition: 'right',
  minViewportWidth: 1024,
  isResponsiveMode: false
};

export function createLayout(options = {}) {
  const {
    container = document.getElementById('app'),
    config = DEFAULT_CONFIG,
    eventBus
  } = options;
  
  if (!eventBus) {
    throw new Error('EventBus is required for Layout component');
  }
  
  let currentConfig = { ...config };
  
  /**
   * Render the layout structure
   */
  function render() {
    container.innerHTML = `
      <header class="header" role="banner">
        <nav class="controls" role="navigation" aria-label="Draft controls">
          <!-- Controls component will render here -->
        </nav>
      </header>
      
      <main class="table-container" role="main">
        <!-- Player table component will render here -->
      </main>
      
      <aside class="summary-panel" role="complementary" aria-label="Team summary">
        <!-- Team summary component will render here -->
      </aside>
    `;
    
    // Setup resize listener
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
  }
  
  /**
   * Handle viewport resize
   */
  function handleResize() {
    const viewportWidth = window.innerWidth;
    const wasResponsive = currentConfig.isResponsiveMode;
    const isResponsive = viewportWidth < currentConfig.minViewportWidth;
    
    if (wasResponsive !== isResponsive) {
      currentConfig.isResponsiveMode = isResponsive;
      eventBus.emit('layout:responsive-mode', {
        isResponsive,
        viewportWidth
      });
    }
  }
  
  /**
   * Update layout configuration
   */
  function updateConfig(newConfig) {
    currentConfig = { ...currentConfig, ...newConfig };
    eventBus.emit('layout:config-changed', {
      config: currentConfig
    });
  }
  
  /**
   * Get current configuration
   */
  function getConfig() {
    return { ...currentConfig };
  }
  
  /**
   * Cleanup
   */
  function destroy() {
    window.removeEventListener('resize', handleResize);
  }
  
  // Public API
  return {
    render,
    updateConfig,
    getConfig,
    handleResize,
    destroy
  };
}
```

**Checkpoint**: Layout component defined, ready to be used

---

### Step 6: Create Application Bootstrap (20 minutes)

Create `src/app.js`:

```javascript
/**
 * Application Bootstrap
 * Initializes and coordinates all components
 */

import { EventBus } from './utils/event-bus.js';
import { createLayout } from './ui/layout.js';

/**
 * Initialize the application
 */
function initializeApp(config = {}) {
  const {
    container = document.getElementById('app')
  } = config;
  
  // Create event bus for component communication
  const eventBus = new EventBus();
  
  // Create layout component
  const layout = createLayout({
    container,
    eventBus
  });
  
  // Store component references
  const components = {
    layout
  };
  
  /**
   * Start the application
   */
  function start() {
    console.log('🏀 Basketball Draft Helper - Starting...');
    
    // Render layout
    layout.render();
    
    console.log('✅ Layout rendered');
    console.log('📊 Application ready!');
  }
  
  /**
   * Stop and cleanup
   */
  function stop() {
    layout.destroy();
    console.log('🛑 Application stopped');
  }
  
  /**
   * Get component instances
   */
  function getComponents() {
    return components;
  }
  
  /**
   * Get event bus
   */
  function getEventBus() {
    return eventBus;
  }
  
  // Public API
  return {
    start,
    stop,
    getComponents,
    getEventBus
  };
}

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = initializeApp();
    app.start();
    
    // Expose app instance for debugging
    window.draftHelper = app;
  });
} else {
  const app = initializeApp();
  app.start();
  window.draftHelper = app;
}
```

**Checkpoint**: Open in browser - you should see the three-section layout with empty sections

---

### Step 7: Add Remaining Placeholder Styles (15 minutes)

Create `src/styles/table.css`:

```css
/**
 * Player Table Styles
 */

.player-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.player-table thead th {
  position: sticky;
  top: 0;
  background: var(--table-header-bg);
  border-bottom: 2px solid var(--table-border);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
}

.player-table tbody tr {
  border-bottom: 1px solid var(--table-border);
  transition: background-color 0.15s ease;
}

.player-table tbody tr:hover {
  background: var(--table-row-hover);
}

.player-table tbody tr:nth-child(even) {
  background: var(--table-row-alt);
}

.player-table tbody td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
}

/* Empty state */
.table-empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}
```

Create `src/styles/controls.css`:

```css
/**
 * Header Controls Styles
 */

.controls {
  display: flex;
  gap: var(--space-6);
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

/* Buttons */
button {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.15s ease;
}

button.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

button.primary:hover {
  background: var(--button-primary-hover);
}

/* Inputs */
input[type="search"],
input[type="text"] {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--table-border);
  border-radius: var(--radius-md);
  font-family: var(--font-base);
  font-size: var(--font-size-sm);
}

input[type="search"]:focus,
input[type="text"]:focus {
  outline: 2px solid var(--button-primary-bg);
  outline-offset: -1px;
}
```

Create `src/styles/summary.css`:

```css
/**
 * Team Summary Panel Styles
 */

.summary-panel h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.summary-player-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.summary-empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.category-totals {
  margin-top: var(--space-6);
}

.category-total {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--table-border);
  font-size: var(--font-size-sm);
}

.category-total-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.category-total-value {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}
```

**Checkpoint**: Open in browser - layout should be fully styled with three distinct sections

---

## Testing

### Manual Testing Checklist

Open `src/index.html` in a browser and verify:

- [ ] Page loads without errors (check browser console)
- [ ] Three sections are visible: header, main table area, summary panel
- [ ] Header section spans full width at top
- [ ] Table area takes remaining vertical space
- [ ] Summary panel is fixed on the right side (300px width)
- [ ] Sections have distinct background colors
- [ ] Resizing window maintains layout structure
- [ ] Below 1024px width, warning message appears
- [ ] Console shows "Application ready!" message

### Unit Testing Setup (Optional for MVP)

Create `tests/unit/ui/layout.test.js`:

```javascript
import { createLayout } from '../../../src/ui/layout.js';
import { EventBus } from '../../../src/utils/event-bus.js';

describe('Layout Component', () => {
  let eventBus;
  let container;
  let layout;
  
  beforeEach(() => {
    eventBus = new EventBus();
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
    
    layout = createLayout({ container, eventBus });
  });
  
  afterEach(() => {
    layout.destroy();
    document.body.removeChild(container);
  });
  
  test('renders three main sections', () => {
    layout.render();
    
    expect(container.querySelector('.header')).toBeTruthy();
    expect(container.querySelector('.table-container')).toBeTruthy();
    expect(container.querySelector('.summary-panel')).toBeTruthy();
  });
  
  test('emits responsive mode event', (done) => {
    eventBus.on('layout:responsive-mode', (event) => {
      expect(event.detail.isResponsive).toBeDefined();
      done();
    });
    
    layout.render();
    window.innerWidth = 800; // Simulate small viewport
    layout.handleResize();
  });
});
```

Run tests with Jest (if configured):
```bash
npm test
```

---

## Next Steps

After completing this quickstart, the UI layout foundation is complete. Next features to implement:

1. **Player Table Component** (`src/ui/table.js`)
   - Render 14-column table structure
   - Implement sorting functionality
   - Add empty state display

2. **Controls Component** (`src/ui/controls.js`)
   - Create button groups
   - Add category checkboxes
   - Implement search input

3. **Team Summary Component** (`src/ui/summary.js`)
   - Display player count and list
   - Show category totals
   - Handle empty state

4. **Integration Testing**
   - Test component communication via events
   - Verify layout responsiveness
   - Performance testing with mock data

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Ensure you're running a local web server. Modern browsers require ES6 modules to be served over HTTP/HTTPS, not file:// protocol.

```bash
# Python 3
python3 -m http.server 8000

# Node.js (install http-server globally first)
npx http-server

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### Issue: Styles not applying

**Solution**: Check CSS file order in `index.html`. Variables must load first:
```html
<link rel="stylesheet" href="styles/variables.css">  <!-- First! -->
<link rel="stylesheet" href="styles/layout.css">
```

### Issue: Console errors about EventBus

**Solution**: Ensure all components receive the eventBus instance:
```javascript
const layout = createLayout({ container, eventBus }); // ✅ Pass eventBus
const layout = createLayout({ container }); // ❌ Will throw error
```

---

## Success Criteria

You've successfully completed this quickstart when:

✅ Application loads without console errors  
✅ Three sections are visible and properly positioned  
✅ Layout is responsive (warning shows below 1024px)  
✅ CSS variables are working (inspect element to verify)  
✅ Event bus is initialized and accessible  
✅ Console shows "Application ready!" message  

**Estimated completion time**: 2-3 hours for a developer familiar with vanilla JavaScript

---

## Resources

- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Component APIs**: [contracts/component-api.md](./contracts/component-api.md)
- **Research Decisions**: [research.md](./research.md)
- **Constitution**: [/CONSTITUTION.md](../../CONSTITUTION.md)

## Support

For questions or issues:
1. Review the specification and contracts
2. Check browser console for errors
3. Verify file paths and module imports
4. Ensure local server is running

---

**Happy coding! 🏀**
