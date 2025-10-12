# Implementation Plan: UI Layout and Component Structure

**Branch**: `001-ui-layout-and` | **Date**: October 11, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-layout-and/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes the foundational UI structure for the Basketball Draft Helper application. The primary requirement is a single-page application with three distinct sections: a header controls area for user actions, a main player data table displaying 200+ players with 14 columns, and a team summary panel for tracking drafted players. The technical approach uses vanilla JavaScript with HTML5 and CSS3, implementing a semantic HTML structure with CSS Grid/Flexbox for layout, custom CSS properties for theming, and DOM manipulation via native JavaScript APIs for dynamic content updates.

## Technical Context

**Language/Version**: JavaScript ES6+ (ES2015+) with HTML5 and CSS3  
**Primary Dependencies**: None (vanilla JavaScript, no frameworks per constitution ADR-001)  
**Storage**: Browser LocalStorage API (for state persistence, not used in this UI structure feature)  
**Testing**: Manual testing for layout/visual verification, automated tests via Jest for component logic  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge latest versions), desktop-first (minimum 1024px viewport)  
**Project Type**: Single-page web application (static HTML/CSS/JS)  
**Performance Goals**: 60fps scrolling for 200+ table rows, <100ms hover response, <3 seconds initial render  
**Constraints**: <100KB total bundle size (per constitution), no external CSS frameworks, offline-capable, minimum 1024px viewport width  
**Scale/Scope**: Single-page interface with 3 main sections, 14 table columns, support for 200+ player rows, 9 category controls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technology Stack Compliance

- ✅ **Vanilla JavaScript**: Using native JavaScript ES6+ without React/Vue/Angular frameworks
- ✅ **No Heavy Frameworks**: Zero framework dependencies, pure HTML/CSS/JS
- ✅ **HTML-First Approach**: Semantic HTML structure with progressive JavaScript enhancement
- ✅ **CSS Custom Properties**: Using CSS variables for theming (no CSS frameworks)
- ✅ **No External Dependencies**: This UI feature requires no external libraries

### Code Organization Compliance

- ✅ **Single Responsibility**: Each UI module (table.js, controls.js, summary.js) handles one component
- ✅ **Module Structure**: Follows constitution file structure (src/ui/ directory)
- ✅ **Event-Driven Communication**: Components will use CustomEvent for loose coupling

### Performance Compliance

- ✅ **Initial Load**: Target <3 seconds for complete layout render (constitution requirement)
- ✅ **Interaction Response**: <100ms for all hover states and clicks (16ms visual feedback + computation)
- ✅ **Scrolling Performance**: 60fps target for table with 200+ rows (constitution requirement)

### Bundle Size Compliance

- ✅ **JavaScript Budget**: UI modules estimated at <20KB (well under 100KB constitution limit)
- ✅ **CSS Budget**: Layout styles estimated at <15KB (minimal, custom CSS)
- ✅ **No Framework Overhead**: Zero framework weight

### Constraints Compliance

- ✅ **Offline-First**: UI structure is static HTML/CSS, no network dependencies
- ✅ **Browser Compatibility**: Using standard web APIs (Grid, Flexbox, CustomEvents) supported in target browsers
- ✅ **Desktop-Optimized**: Minimum 1024px viewport as specified in constitution

**GATE STATUS**: ✅ **PASSED** - All constitution requirements met. No violations to justify.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── ui/                      # User interface modules (this feature)
│   ├── layout.js           # Main application shell and section management
│   ├── table.js            # Player data table component
│   ├── controls.js         # Header controls component
│   └── summary.js          # Team summary panel component
├── core/                    # Business logic (future features)
│   ├── ranking.js          # Z-score calculations
│   ├── storage.js          # LocalStorage abstraction
│   └── stats.js            # Statistical utilities
├── data/                    # Data handling (future features)
│   ├── csv-parser.js       # CSV upload and parsing
│   └── api-client.js       # Basketball Reference integration
├── utils/                   # Shared utilities
│   └── helpers.js          # Common DOM/data helper functions
├── styles/                  # CSS modules
│   ├── variables.css       # CSS custom properties (theme)
│   ├── layout.css          # Main layout styles
│   ├── table.css           # Table-specific styles
│   ├── controls.css        # Header controls styles
│   └── summary.css         # Team summary panel styles
├── app.js                   # Application bootstrap and initialization
└── index.html               # Main HTML entry point

tests/
├── unit/
│   └── ui/                  # UI component unit tests
│       ├── layout.test.js
│       ├── table.test.js
│       ├── controls.test.js
│       └── summary.test.js
└── integration/
    └── ui/                  # UI integration tests
        └── layout-flow.test.js

public/                      # Static assets
└── assets/
    └── icons/              # UI icons (if needed)
```

**Structure Decision**: Single-project web application structure following the constitution's defined layout. This feature implements the `src/ui/` and `src/styles/` directories with the foundational layout components. The structure supports the vanilla JavaScript approach with modular CSS files using custom properties for theming. The `index.html` serves as the entry point, `app.js` initializes the application, and UI modules are independently testable. Future features will add to `src/core/` and `src/data/` without modifying this UI structure.

## Complexity Tracking

*No violations detected - section not applicable*

All implementation decisions align with constitution requirements. No complexity justifications needed.
