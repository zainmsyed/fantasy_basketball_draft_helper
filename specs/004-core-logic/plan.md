# Implementation Plan: Core Logic Implementation

**Branch**: `004-core-logic` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-core-logic/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the core ranking algorithm using Z-score calculations across 9 fantasy basketball categories, with dynamic punt strategy customization, stat view toggling between historical and projected data, and visual player indicators. This feature provides the mathematical foundation for data-driven draft decisions.

## Technical Context

**Language/Version**: TypeScript + ES2022 (compiled to ES2020 for browser compatibility)  
**Primary Dependencies**: Alpine.js (reactivity), Tailwind CSS + DaisyUI (styling), Tabulator (data tables)  
**Storage**: LocalForage (enhanced localStorage) - client-side only  
**Testing**: Vitest (fast unit testing), Playwright (integration testing)  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single-page web application (frontend only)  
**Performance Goals**: <100ms UI interactions, <3s CSV processing (200 players), <1MB bundle size  
**Constraints**: No backend dependencies, offline-capable, client-side data processing only  
**Scale/Scope**: 200 players max, 9 fantasy categories, local storage under 5MB

**Core Algorithm Requirements**:
- Z-score calculation engine for statistical normalization
- Real-time ranking recalculation (<100ms for 200 players)
- Dynamic category inclusion/exclusion for punt strategies
- Dual data source handling (historical vs projected stats)
- Visual highlighting system for best/worst player categories
- Integration with existing Tabulator data table component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Phase 0 Check (Initial)**: ✅ PASSED  
**Phase 1 Check (Post-Design)**: ✅ PASSED

- [x] **Modular Architecture**: ✅ Four independent modules (ranking-engine, punt-strategy, stat-display, visual-indicators) with clear service interfaces
- [x] **Minimal Dependencies**: ✅ No new dependencies required; using existing Alpine.js, Tabulator, LocalForage stack
- [x] **Pure Functions First**: ✅ Z-score calculations implemented as pure functions in utils/calculations.js; side effects isolated to services
- [x] **Performance-First Design**: ✅ <100ms response times verified through memoization and incremental updates; performance monitoring built-in
- [x] **Client-Side Data Sovereignty**: ✅ All calculations local; no external APIs; LocalForage persistence maintains user control
- [x] **Incremental Development**: ✅ Feature divided into 4 user stories, each deliverable in 1-2 days with independent value

**Design Validation**: All architectural decisions align with constitutional principles. Ready for implementation.

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
frontend/
├── src/
│   ├── modules/
│   │   ├── ranking-engine/     # Z-score calculations and ranking logic
│   │   ├── punt-strategy/      # Category selection and management
│   │   ├── stat-display/       # Historical vs projected toggle
│   │   └── visual-indicators/  # Player highlighting system
│   ├── utils/
│   │   ├── calculations.js     # Pure mathematical functions
│   │   ├── validators.js       # Data validation utilities
│   │   └── formatters.js       # Display formatting helpers
│   ├── types/
│   │   ├── player.ts           # Player data structures
│   │   ├── ranking.ts          # Ranking algorithm types
│   │   └── strategy.ts         # Punt strategy definitions
│   ├── data/
│   │   └── categories.js       # Fantasy category definitions
│   └── services/
│       ├── storage.js          # LocalForage integration
│       └── ranking-service.js  # Core ranking orchestration
├── tests/
│   ├── unit/
│   │   ├── z-score.test.js     # Algorithm accuracy tests
│   │   ├── punt-strategy.test.js
│   │   └── visual-indicators.test.js
│   ├── integration/
│   │   ├── ranking-flow.test.js
│   │   └── stat-toggle.test.js
│   └── performance/
│       └── ranking-benchmark.test.js
└── public/
    └── data/
        └── last_year_stats.json  # Pre-generated historical data
```

**Structure Decision**: Using existing frontend modular structure with dedicated modules for each core logic component. This maintains clear separation of concerns while integrating with the established Alpine.js reactive system and Tabulator table component.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
