# Quickstart: Foundation (Phase 1)

**Date**: 2025-10-12  
**Feature**: Foundation web application setup  
**Target Audience**: Developers implementing the foundation infrastructure

## Overview

This quickstart guide helps you implement the foundation phase of the Basketball Draft Helper. You'll create a single-page web application with Vite + Alpine.js that displays basketball player data in a sortable, filterable table using Tabulator.

## Prerequisites

- Node.js 18+ and npm
- Modern browser for testing (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Code editor with JavaScript/HTML support

## Project Setup (30 minutes)

### 1. Initialize Vite Project

```bash
# Create new Vite project
npm create vite@latest basketball-draft-helper -- --template vanilla
cd basketball-draft-helper
npm install

# Install core dependencies
npm install alpinejs tabulator-tables
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography daisyui

# Install development dependencies
npm install -D vitest @vitest/ui playwright @playwright/test
```

### 2. Configure Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
}
```

### 3. Project Structure

Create the following directory structure:
```
src/
├── modules/
│   ├── ui/
│   │   └── alpine-store.js
│   ├── table/
│   │   └── tabulator-config.js
│   └── data/
│       └── sample-loader.js
├── utils/
│   ├── filters.js
│   ├── search.js
│   └── storage.js
├── data/
│   ├── sample-2024.json
│   └── sample-2025.json
└── styles/
    └── main.css
```

## Core Implementation (2-3 hours)

### 1. HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Basketball Draft Helper</title>
</head>
<body class="bg-base-100 min-h-screen">
  <div id="app" x-data="draftHelper" class="container mx-auto px-4 py-6">
    <!-- Top Controls -->
    <div class="card bg-base-200 shadow-lg mb-6 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Upload Placeholder -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">CSV Upload (Phase 2)</span>
          </label>
          <input type="file" class="file-input file-input-bordered" disabled />
        </div>
        
        <!-- Stat View Toggle -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Stats View</span>
          </label>
          <select x-model="activeStatView" @change="changeStatView" class="select select-bordered">
            <option value="2024-25">2024-25 Actual</option>
            <option value="2025-26">2025-26 Projected</option>
          </select>
        </div>
        
        <!-- Search -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Search Player</span>
          </label>
          <input x-model="searchQuery" @input="debounceSearch" 
                 type="text" placeholder="Enter player name..." class="input input-bordered" />
        </div>
        
        <!-- Position Filter -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Position</span>
          </label>
          <select x-model="positionFilter" @change="applyFilters" class="select select-bordered">
            <option value="">All Positions</option>
            <option value="PG">Point Guard</option>
            <option value="SG">Shooting Guard</option>
            <option value="SF">Small Forward</option>
            <option value="PF">Power Forward</option>
            <option value="C">Center</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Player Table -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">Player Rankings</h2>
        <div id="player-table" class="w-full"></div>
      </div>
    </div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### 2. Main Application (`src/main.js`)

```javascript
import Alpine from 'alpinejs'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import './styles/main.css'
import 'tabulator-tables/dist/css/tabulator.min.css'

import { createDraftHelperStore } from './modules/ui/alpine-store.js'
import { createTableConfig } from './modules/table/tabulator-config.js'
import { loadSampleData } from './modules/data/sample-loader.js'

// Make Tabulator globally available
window.Tabulator = Tabulator

// Initialize Alpine.js store
Alpine.data('draftHelper', createDraftHelperStore)

// Start Alpine.js
Alpine.start()

console.log('Basketball Draft Helper - Foundation Phase Loaded')
```

### 3. Alpine.js Store (`src/modules/ui/alpine-store.js`)

```javascript
import { loadSampleData } from '../data/sample-loader.js'
import { createTableConfig } from '../table/tabulator-config.js'
import { loadUIState, saveUIState } from '../../utils/storage.js'
import { searchPlayers, filterByPosition } from '../../utils/filters.js'

export function createDraftHelperStore() {
  return {
    // State
    activeStatView: '2024-25',
    searchQuery: '',
    positionFilter: '',
    table: null,
    allPlayers: [],
    filteredPlayers: [],
    searchTimeout: null,

    // Initialization
    async init() {
      try {
        // Load saved UI state
        const savedState = loadUIState()
        if (savedState) {
          this.activeStatView = savedState.activeStatView || '2024-25'
          this.searchQuery = savedState.searchQuery || ''
          this.positionFilter = savedState.positionFilter || ''
        }

        // Load initial data
        await this.loadData()
        
        // Initialize table
        this.initializeTable()
        
        console.log('Draft helper initialized successfully')
      } catch (error) {
        console.error('Initialization failed:', error)
        this.showError('Failed to load player data. Please refresh the page.')
      }
    },

    // Data Management
    async loadData() {
      this.allPlayers = await loadSampleData(this.activeStatView)
      this.filteredPlayers = [...this.allPlayers]
    },

    async changeStatView() {
      try {
        await this.loadData()
        this.table.setData(this.filteredPlayers)
        this.applyFilters()
        this.saveState()
      } catch (error) {
        console.error('Failed to change stat view:', error)
        this.showError('Failed to load stats data')
      }
    },

    // Table Management
    initializeTable() {
      const config = createTableConfig(this.filteredPlayers)
      this.table = new Tabulator("#player-table", config)
      
      // Bind table events
      this.table.on("dataSorted", () => {
        this.saveState()
      })
    },

    // Filtering and Search
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
      }, 300)
    },

    applyFilters() {
      let filtered = [...this.allPlayers]
      
      // Apply search filter
      if (this.searchQuery.trim()) {
        filtered = searchPlayers(filtered, this.searchQuery.trim())
      }
      
      // Apply position filter
      if (this.positionFilter) {
        filtered = filterByPosition(filtered, [this.positionFilter])
      }
      
      this.filteredPlayers = filtered
      this.table.setData(this.filteredPlayers)
      this.saveState()
    },

    // State Persistence
    saveState() {
      const state = {
        activeStatView: this.activeStatView,
        searchQuery: this.searchQuery,
        positionFilter: this.positionFilter,
        sortColumn: null, // TODO: Get from table
        sortDirection: null // TODO: Get from table
      }
      saveUIState(state)
    },

    // Error Handling
    showError(message) {
      // TODO: Implement user-friendly error display
      alert(message)
    }
  }
}
```

### 4. Sample Data Structure (`src/data/sample-2024.json`)

```json
{
  "players": [
    {
      "id": "player_001",
      "name": "LeBron James",
      "team": "LAL",
      "positions": ["SF", "PF"],
      "stats": {
        "gp": 71,
        "pts": 25.7,
        "ast": 8.3,
        "reb": 7.3,
        "threes": 2.1,
        "fg_pct": 0.540,
        "ft_pct": 0.750,
        "stl": 1.3,
        "blk": 0.5,
        "to": 3.5
      },
      "expert_rank": 15,
      "algo_rank": null
    },
    {
      "id": "player_002", 
      "name": "Nikola Jokic",
      "team": "DEN",
      "positions": ["C"],
      "stats": {
        "gp": 79,
        "pts": 26.4,
        "ast": 9.0,
        "reb": 12.4,
        "threes": 0.9,
        "fg_pct": 0.632,
        "ft_pct": 0.822,
        "stl": 1.3,
        "blk": 0.7,
        "to": 3.0
      },
      "expert_rank": 1,
      "algo_rank": null
    }
  ]
}
```

## Testing Setup (1 hour)

### 1. Unit Tests (`tests/unit/filters.test.js`)

```javascript
import { describe, it, expect } from 'vitest'
import { searchPlayers, filterByPosition } from '../../src/utils/filters.js'

describe('Player Filtering', () => {
  const samplePlayers = [
    { name: 'LeBron James', positions: ['SF', 'PF'] },
    { name: 'Stephen Curry', positions: ['PG'] }
  ]

  it('should search players by name', () => {
    const results = searchPlayers(samplePlayers, 'lebron')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('LeBron James')
  })

  it('should filter players by position', () => {
    const results = filterByPosition(samplePlayers, ['PG'])
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Stephen Curry')
  })
})
```

### 2. Integration Test (`tests/integration/app.test.js`)

```javascript
import { test, expect } from '@playwright/test'

test('app loads and displays player table', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Check that main elements are present
  await expect(page.locator('#player-table')).toBeVisible()
  await expect(page.locator('select')).toHaveCount(2) // stat view + position filter
  
  // Test stat view toggle
  await page.selectOption('[x-model="activeStatView"]', '2025-26')
  await expect(page.locator('#player-table')).toBeVisible()
})
```

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Run integration tests  
npm run test:e2e

# Type checking (if using TypeScript)
npm run type-check
```

## Validation Checklist

### Functional Requirements
- [ ] App loads with Vite + Alpine.js + Tailwind/DaisyUI
- [ ] Player table displays with Tabulator
- [ ] Sample data loads (both 2024-25 and 2025-26)
- [ ] Sorting works on all columns (ascending/descending)
- [ ] Search filters players by name
- [ ] Position filter works with multi-position eligibility
- [ ] Stat view toggle switches between data sets
- [ ] UI state persists in localStorage

### Performance Requirements  
- [ ] Initial load < 2 seconds
- [ ] Table interactions < 100ms
- [ ] Bundle size < 500KB (excluding sample data)
- [ ] No console errors in browser

### User Experience
- [ ] All controls are clearly labeled
- [ ] Error messages are user-friendly
- [ ] Responsive design works on mobile
- [ ] Table sorting provides visual feedback
- [ ] Empty states handled gracefully

## Next Steps

After completing the foundation:

1. **Phase 2**: CSV import and data processing
2. **Phase 3**: Z-score ranking algorithm
3. **Phase 4**: Draft tracking functionality
4. **Phase 5**: Strategy management and persistence

## Troubleshooting

### Common Issues

**Table not rendering**:
- Check browser console for Tabulator errors
- Verify sample data structure matches schema
- Ensure Alpine.js initialized before table creation

**Search not working**:
- Check debounce timeout is clearing properly
- Verify filter functions are pure (no side effects)
- Test with simple string matching first

**State not persisting**:
- Check localStorage permissions in browser
- Verify JSON serialization of state object
- Test fallback to sessionStorage

**Performance issues**:
- Profile table rendering with large datasets
- Check for memory leaks in event listeners
- Optimize filter functions for large arrays