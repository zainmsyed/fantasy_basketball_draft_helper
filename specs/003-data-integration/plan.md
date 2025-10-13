# Implementation Plan: Data Integration

**Branch**: `003-data-integration` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-data-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Data Integration feature enables users to upload CSV files with player rankings, automatically matches them with pre-loaded historical statistics, and validates data completeness. Technical approach uses PapaParse for CSV parsing, fuzzy string matching for player name resolution, and browser localStorage for persistence. The feature implements a column mapping interface with smart defaults, three-tier validation (Error/Warning/Info), and manual override controls for low-confidence matches.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript + ES2022 (compiled to ES2020 for browser compatibility)  
**Primary Dependencies**: Alpine.js (reactivity), Tailwind CSS + DaisyUI (styling), Tabulator (data tables)  
**Storage**: LocalForage (enhanced localStorage) - client-side only  
**Testing**: Vitest (fast unit testing), Playwright (integration testing)  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single-page web application (frontend only)  
**Performance Goals**: <100ms UI interactions, <3s CSV processing (200 players), <1MB bundle size  
**Constraints**: No backend dependencies, offline-capable, client-side data processing only  
**Scale/Scope**: 200 players max, 9 fantasy categories, local storage under 5MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Modular Architecture**: Feature uses 3 independent modules: csv-processor (parsing), name-matcher (fuzzy matching), data-validator (completeness checks). Each module has clear inputs/outputs and is independently testable.
- [x] **Minimal Dependencies**: PapaParse (~45KB) for CSV parsing justified - complex edge case handling. Fuse.js (~12KB) for fuzzy matching justified - proven algorithm. No duplicate functionality.
- [x] **Pure Functions First**: Name matching, validation rules, and column mapping logic implemented as pure functions. File I/O and localStorage confined to service layer.
- [x] **Performance-First Design**: CSV parsing target <3s for 200 players. Name matching <1s. Validation <100ms. Bundle impact: ~57KB total for new dependencies.
- [x] **Client-Side Data Sovereignty**: All processing client-side. Pre-loaded JSON file (no API calls). localStorage for persistence. Fully offline-capable.
- [x] **Incremental Development**: P1 stories (upload, mapping, matching) = 3-4 days. P2 stories (validation, edge cases) = 2 days. Each story independently deployable.

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
frontend/
├── src/
│   ├── modules/
│   │   ├── data/
│   │   │   ├── csv-parser.js          # PapaParse wrapper, column detection
│   │   │   ├── name-matcher.js        # Fuzzy matching algorithm
│   │   │   ├── data-merger.js         # Combine CSV + JSON data
│   │   │   └── data-validator.js      # Completeness validation
│   │   └── ui/
│   │       ├── column-mapper.js       # Alpine component for mapping UI
│   │       └── validation-reporter.js # Display validation results
│   ├── utils/
│   │   ├── storage.js                # localStorage operations
│   │   ├── validators.js             # Validation rules (pure functions)
│   │   └── string-utils.js           # String normalization, comparison
│   ├── types/
│   │   └── player.d.ts               # TypeScript definitions
├── tests/
│   ├── csv-parser.test.js
│   ├── name-matcher.test.js
│   ├── data-validator.test.js
│   └── integration/
│       └── upload-workflow.test.js
└── public/
    └── data/
        └── last_year_stats.json      # Production historical data (pre-generated from data-pipeline)

data-pipeline/                         # Python preprocessing (separate from frontend)
├── src/
│   └── fetch_stats.py                # nba_api script
└── data/
    └── output/
        └── last_year_stats.json      # Generated file copied to frontend/public
```

**Structure Decision**: Single-project frontend application with separate data pipeline. The frontend is self-contained with all data integration modules under `src/modules/data/`. The Python data pipeline exists independently and its output is copied to the frontend during build. This maintains clean separation between preprocessing (Python) and runtime (JavaScript).

## Complexity Tracking

*No Constitution violations - this section is not applicable.*

All principles satisfied:
- Modular architecture: 3 independent data modules + 2 UI components
- Minimal dependencies: Only 2 justified additions (PapaParse 45KB, Fuse.js 12KB)
- Pure functions: Name matching, validation, column detection all pure
- Performance targets: All operations under specified thresholds
- Client-side sovereignty: No external APIs, fully offline
- Incremental development: 5 independently deliverable user stories
