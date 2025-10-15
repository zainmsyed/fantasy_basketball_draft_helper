# Tasks: Core Logic Implementation

**Input**: Design documents from `/specs/004-core-logic/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No specific test requirements requested in specification - implementation-focused

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tasks are sized for 1-2 day completion per Incremental Development principle (Constitution VI).

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- **Size Limit**: Each task MUST be completable within 1-2 days (Constitution VI)
- Include exact file paths in descriptions

## Path Conventions
All paths relative to `frontend/` directory per established project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for core logic modules

- [ ] T001 Create core logic module directories in `src/modules/` (ranking-engine/, punt-strategy/, stat-display/, visual-indicators/)
- [ ] T002 [P] Create TypeScript type definitions in `src/types/` (player.ts, ranking.ts, strategy.ts)
- [ ] T003 [P] Create fantasy category constants in `src/data/categories.js` with all 9 statistical categories
- [ ] T004 [P] Setup performance monitoring utilities in `src/utils/performance.js` for <100ms requirement tracking

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core mathematical and data infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement pure Z-score calculation functions in `src/utils/calculations.js` (calculateZScore, calculateCategoryStats, calculateStandardDeviation)
- [ ] T006 [P] Create player qualification checking utilities in `src/utils/validators.js` (checkFGQualification, checkFTQualification)
- [ ] T007 [P] Implement statistical data formatters in `src/utils/formatters.js` (formatPercentage, formatStatValue)
- [ ] T008 Create core ranking service interface in `src/services/ranking-service.js` with caching and memoization
- [ ] T009 Setup LocalForage storage integration in `src/services/storage.js` for punt strategy persistence
- [ ] T010 [P] Implement error handling patterns for mathematical edge cases (division by zero, empty datasets)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Z-Score Ranking Algorithm (Priority: P1) 🎯 MVP

**Goal**: Implement algorithmic rankings using Z-scores across 9 fantasy categories with equal weighting

**Independent Test**: Load player data and verify algo ranks are calculated and displayed correctly alongside expert ranks

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create RankingEngine module structure in `src/modules/ranking-engine/index.js`
- [ ] T012 [P] [US1] Implement PlayerRanking interface and calculation logic in `src/modules/ranking-engine/player-ranking.js`
- [ ] T013 [US1] Implement Z-score calculation orchestration in `src/modules/ranking-engine/z-score-calculator.js` (depends on T005-T007)
- [ ] T014 [US1] Create ranking service implementation in `src/modules/ranking-engine/ranking-service.js` with <100ms performance target
- [ ] T015 [US1] Integrate with existing Tabulator component to display algo ranks in `src/modules/ranking-engine/table-integration.js`
- [ ] T016 [US1] Add performance monitoring for ranking calculations to ensure <100ms compliance
- [ ] T017 [US1] Implement equal weighting logic for all 9 categories with turnover inversion handling

**Checkpoint**: Z-score algorithm fully functional - users can see algorithmic rankings alongside expert rankings

---

## Phase 4: User Story 2 - Category Selection and Dynamic Reranking (Priority: P1)

**Goal**: Enable punt strategy customization with real-time ranking recalculation when categories are excluded

**Independent Test**: Select categories to punt and verify rankings update immediately with players reranked accordingly

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create PuntStrategy module structure in `src/modules/punt-strategy/index.js`
- [ ] T019 [P] [US2] Implement PuntStrategy data model in `src/modules/punt-strategy/strategy-model.js`
- [ ] T020 [US2] Create category selection UI component in `src/modules/punt-strategy/category-selector.js` with Alpine.js integration
- [ ] T021 [US2] Implement strategy persistence service in `src/modules/punt-strategy/strategy-storage.js` using LocalForage
- [ ] T022 [US2] Create real-time ranking update logic in `src/modules/punt-strategy/dynamic-reranking.js` with <100ms performance
- [ ] T023 [US2] Integrate category selection with ranking engine for immediate recalculation
- [ ] T024 [US2] Add strategy save/load functionality with name validation and local storage persistence
- [ ] T025 [US2] Implement auto-reranking when players are marked as drafted

**Checkpoint**: Punt strategies fully functional - users can customize rankings by excluding categories

---

## Phase 5: User Story 3 - Last Year vs Projected Stats Toggle (Priority: P2)

**Goal**: Enable switching between historical and projected stats while preserving punt strategy state

**Independent Test**: Toggle between stat views and verify correct data displays with rankings maintained for selected view

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create StatDisplay module structure in `src/modules/stat-display/index.js`
- [ ] T027 [P] [US3] Implement stat view configuration in `src/modules/stat-display/display-config.js`
- [ ] T028 [US3] Create toggle UI component in `src/modules/stat-display/stat-toggle.js` with Alpine.js reactivity
- [ ] T029 [US3] Implement stat view switching logic in `src/modules/stat-display/view-switcher.js` with <50ms performance
- [ ] T030 [US3] Update Tabulator integration for dynamic column data updates in `src/modules/stat-display/table-updater.js`
- [ ] T031 [US3] Ensure punt strategy preservation across stat view changes
- [ ] T032 [US3] Coordinate with ranking engine to recalculate based on selected stat view

**Checkpoint**: Stat view toggle fully functional - users can switch between projected and historical data

---

## Phase 6: User Story 4 - Visual Player Indicators (Priority: P2)

**Goal**: Highlight each player's best and worst statistical categories with dynamic updates based on punt strategy

**Independent Test**: Load player data and verify green/red highlighting appears correctly for each player's best/worst stats

### Implementation for User Story 4

- [ ] T033 [P] [US4] Create VisualIndicators module structure in `src/modules/visual-indicators/index.js`
- [ ] T034 [P] [US4] Implement best/worst category calculation in `src/modules/visual-indicators/indicator-calculator.js`
- [ ] T035 [US4] Create Tabulator custom formatters in `src/modules/visual-indicators/table-formatters.js` for green/red highlighting
- [ ] T036 [US4] Implement CSS classes for visual highlighting in `src/modules/visual-indicators/highlight-styles.js`
- [ ] T037 [US4] Add dynamic indicator updates when punt strategy changes with <50ms performance
- [ ] T038 [US4] Ensure proper exclusion of non-statistical columns (GP, Team, Position, Ranks) from highlighting
- [ ] T039 [US4] Integrate with stat display toggle to update indicators when view changes

**Checkpoint**: Visual indicators fully functional - users can quickly identify player strengths and weaknesses

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final integration

- [ ] T040 [P] Performance optimization across all modules to ensure <100ms response times
- [ ] T041 [P] Error handling improvements for edge cases (missing data, calculation failures)
- [ ] T042 Add comprehensive logging for debugging ranking calculations and user actions
- [ ] T043 [P] Code cleanup and TypeScript strict mode compliance across all modules
- [ ] T044 Integration testing for complete user workflows (rank→punt→toggle→highlight)
- [ ] T045 [P] Documentation updates for new modules and service interfaces
- [ ] T046 Memory usage optimization for large player datasets (200+ players)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US1 should complete first (core algorithm before customization)
  - US3 and US4 are P2 priority and can start once US1 is complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Should start after US1 core ranking is working - Integrates with ranking engine
- **User Story 3 (P2)**: Can start after US1 is complete - Needs ranking calculations for both stat views
- **User Story 4 (P2)**: Can start after US1 is complete - Needs category calculations for highlighting

### Within Each User Story

- Module structure before implementation
- Core logic before UI integration
- Base functionality before performance optimization
- Individual features before cross-module integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- US3 and US4 can be developed in parallel once US1 is complete

---

## Parallel Example: User Story 1

```bash
# Launch module structure and interfaces together:
Task: "Create RankingEngine module structure in src/modules/ranking-engine/index.js"
Task: "Implement PlayerRanking interface and calculation logic in src/modules/ranking-engine/player-ranking.js"

# After foundational work is complete, these can proceed in parallel:
Task: "Integrate with existing Tabulator component"
Task: "Add performance monitoring for ranking calculations"
```

---

## Implementation Strategy

### Incremental Development (Constitution VI Compliance)

**Daily Deliverable Rule**: Each task provides demonstrable user value within 1-2 days
**Progressive Enhancement**: Start with basic Z-score calculation, add customization features iteratively
**Early Validation**: Test core ranking algorithm before adding punt strategy complexity

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (basic module structure)
2. Complete Phase 2: Foundational (mathematical functions and core services)
3. Complete Phase 3: User Story 1 (basic Z-score ranking algorithm)
4. **STOP and VALIDATE**: Test algorithmic rankings independently
5. Deploy/demo core ranking functionality

### Incremental Delivery

1. Complete Setup + Foundational → Mathematical foundation ready
2. Add User Story 1 → Test basic rankings → Deploy/Demo (MVP!)
3. Add User Story 2 → Test punt strategies → Deploy/Demo  
4. Add User Story 3 → Test stat toggling → Deploy/Demo
5. Add User Story 4 → Test visual indicators → Deploy/Demo
6. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Z-score algorithm)
   - Developer B: User Story 2 (punt strategies) - starts after US1 core is working
   - Developer C: User Story 3 & 4 (display features) - starts after US1 is complete
3. Stories integrate seamlessly due to modular architecture

---

## Performance Targets

### Critical Requirements
- **Ranking calculations**: <100ms for 200 players (T014, T016, T022)
- **Category selection updates**: <100ms for reranking (T022, T025)
- **Stat view toggle**: <50ms for UI update (T029)
- **Visual indicator updates**: <50ms for highlighting changes (T037)

### Monitoring Tasks
- T004: Setup performance monitoring utilities
- T016: Add ranking calculation performance tracking
- T040: Performance optimization across all modules
- T046: Memory usage optimization for large datasets

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Mathematical accuracy is critical - extensive testing of Z-score calculations required
- Performance requirements are strict - monitor timing throughout development
- Modular architecture enables parallel development once foundation is complete
- Alpine.js reactivity ensures real-time UI updates
- LocalForage provides persistent storage without external dependencies