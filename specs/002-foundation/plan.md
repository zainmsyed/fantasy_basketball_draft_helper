# Implementation Plan: Foundation (Phase 1)

**Branch**: `002-foundation` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-foundation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Foundation phase establishes the core web application infrastructure using Vite + TypeScript + Alpine.js with a player data table using Tabulator. Creates basic UI layout with Tailwind CSS + DaisyUI, implements client-side sorting/filtering, and loads bundled sample basketball player data. Provides stat view toggle between 2024-25 actual and 2025-26 projected stats with localStorage persistence.

## Technical Context

**Language/Version**: TypeScript + ES2022 (compiled to ES2020 for browser compatibility)
**Primary Dependencies**: Alpine.js (~15kb reactivity), Tailwind CSS + DaisyUI (styling), Tabulator (data tables)
**Storage**: localStorage with graceful fallback (client-side only)
**Testing**: Vitest for unit testing, Playwright for integration testing
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Single-page web application (frontend only)
**Performance Goals**: <100ms UI interactions, <2s initial load, <500KB bundle size (excluding sample data)
**Constraints**: No backend dependencies, offline-capable, client-side data processing only
**Scale/Scope**: ≤200 players bundled sample data, standard NBA position system (PG,SG,SF,PF,C), 14 stat columns
**Sample Data**: 2024-25 actual stats + 2025-26 projected stats (data sourcing strategy TBD)## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Modular Architecture**: Feature implementation uses independent modules (UI components, data layer, table manager)
- [x] **Minimal Dependencies**: Alpine.js (~15kb), Tailwind/DaisyUI (utility-first), Tabulator (feature-complete table) - all justified
- [x] **Pure Functions First**: Player data filtering, sorting, and search logic implemented as pure functions
- [x] **Performance-First Design**: <100ms interactions specified, <2s load time, <500KB bundle target
- [x] **Client-Side Data Sovereignty**: All processing client-side, bundled sample data, localStorage persistence
- [x] **Incremental Development**: Foundation broken into 3 user stories, each 1-2 day increments with user value

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
# Basketball Draft Helper - Frontend Only (Single-page Application)
src/
├── modules/
│   ├── ui/              # Alpine.js components and UI state management
│   ├── table/           # Tabulator configuration and table management
│   └── data/            # Sample data loading and management
├── utils/
│   ├── filters.js       # Pure functions for player filtering
│   ├── search.js        # Player name search functionality
│   └── storage.js       # localStorage wrapper with fallback
├── types/
│   └── player.ts        # TypeScript type definitions
├── data/
│   ├── sample-2024.json # 2024-25 actual stats sample
│   └── sample-2025.json # 2025-26 projected stats sample (TBD source)
└── styles/
    └── main.css         # Tailwind imports and custom styles

public/
├── index.html          # Single-page app entry point
└── assets/             # Static assets

tests/                  # Testing structure TBD (Phase 0 research)
```

**Structure Decision**: Single-page application structure selected. No backend needed for Phase 1 foundation. Modular frontend organization separates UI concerns (Alpine.js), data management (sample data), and pure utility functions (filtering/search). Follows constitution's modular architecture principle.

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design completion*

- [x] **Modular Architecture**: ✅ Clear module separation (ui/, table/, data/, utils/) with defined interfaces
- [x] **Minimal Dependencies**: ✅ Alpine.js (15kb), Tabulator (feature-complete), Tailwind/DaisyUI (utility-first) - all justified
- [x] **Pure Functions First**: ✅ Filter/search utilities are pure functions, side effects isolated to storage module
- [x] **Performance-First Design**: ✅ <100ms interactions, <2s load, <500KB bundle, debounced search, efficient table updates
- [x] **Client-Side Data Sovereignty**: ✅ No external APIs, bundled sample data, localStorage with fallback
- [x] **Incremental Development**: ✅ 3 user stories (app shell, search/filter, stat toggle) each 1-2 day increments

**Gate Status**: ✅ PASSED - All constitution principles satisfied

## Complexity Tracking

*No violations requiring justification*
