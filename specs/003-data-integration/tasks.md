# Tasks: Data Integration

**Input**: Design documents from `/specs/003-data-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/module-interfaces.md

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tasks are sized for 1-2 day completion per Incremental Development principle (Constitution VI).

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- **Size Limit**: Each task MUST be completable within 1-2 days (Constitution VI)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install new NPM dependencies: `npm install papaparse fuse.js uuid` in frontend/
- [x] T002 [P] Create module directory structure: `frontend/src/modules/data/` and `frontend/src/modules/ui/`
- [x] T003 [P] Create utilities directory: `frontend/src/utils/` for shared helper functions
- [x] T004 [P] Create test fixtures directory: `frontend/tests/fixtures/` with sample CSV files

**Checkpoint**: Project structure ready for module development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript type definitions in `frontend/src/types/player.d.ts` for: UploadedPlayer, HistoricalStats, IntegratedPlayer, ColumnMapping, ValidationReport, DataQualityFlag, ValidationIssue
- [x] T006 [P] Implement string normalization utilities in `frontend/src/utils/string-utils.js`: normalizeName() using Unicode NFD normalization for accent removal (é→e, ć→c), case handling (toLowerCase), whitespace trimming and collapsing
- [x] T007 [P] Implement storage utilities in `frontend/src/utils/storage.js`: saveColumnMapping(), loadColumnMapping(), checkStorageQuota(), saveIntegratedPlayers()
- [x] T008 [P] Implement validation rule functions in `frontend/src/utils/validators.js`: isValidPosition(), isValidPercentage(), countNonNullStats() (pure functions)
 - [x] T009 Load historical stats JSON on app initialization: fetch `frontend/public/data/last_year_stats.json` and cache in Alpine.js store; implement retry logic (3 attempts) and display critical error to user if fetch fails after all retries
- [x] T010 Create error message constants in `frontend/src/config/constants.js`: ERROR_MESSAGES map, PERFORMANCE_TARGETS, VALIDATION_THRESHOLDS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload CSV with Player Rankings (Priority: P1) 🎯 MVP

**Goal**: User can upload CSV file, see data preview, and verify file format compatibility

**Independent Test**: Select a CSV file, upload it, see preview of first 10 rows with detected columns

### Implementation for User Story 1

 - [x] T011 [P] [US1] Implement CSV parser module in `frontend/src/modules/data/csv-parser.js`: parseCSV() function using PapaParse with header detection, dynamic typing, error handling
 - [x] T012 [US1] Add file input UI component to `frontend/index.html`: file input with "Upload CSV" button, accept=".csv" attribute, styled with DaisyUI
 - [x] T013 [US1] Create upload handler in Alpine.js component: trigger parseCSV() on file selection, handle loading state
 - [x] T014 [US1] Implement data preview UI in `frontend/index.html`: table showing first 10 rows, column headers, row count display
 - [x] T015 [US1] Add error handling for invalid files: detect non-CSV files, show user-friendly error messages, handle malformed CSV with specific row numbers
 - [x] T016 [US1] Add file size validation: check file size <5MB, warn if >500 players detected, display file info (name, size, row count)
 - [x] T017 [US1] Performance validation: log CSV parsing time, ensure <3s for 200 players, add console warnings if threshold exceeded
 - [x] T012 [US1] Add file input UI component to `frontend/index.html`: file input with "Upload CSV" button, accept=".csv" attribute, styled with DaisyUI
 - [x] T013 [US1] Create upload handler in Alpine.js component: trigger parseCSV() on file selection, handle loading state
 - [x] T014 [US1] Implement data preview UI in `frontend/index.html`: table showing first 10 rows, column headers, row count display
 - [x] T015 [US1] Add error handling for invalid files: detect non-CSV files, show user-friendly error messages, handle malformed CSV with specific row numbers
 - [x] T016 [US1] Add file size validation: check file size <5MB, warn if >500 players detected, display file info (name, size, row count)
 - [x] T017 [US1] Performance validation: log CSV parsing time, ensure <3s for 200 players, add console warnings if threshold exceeded

**Checkpoint**: At this point, users can upload CSV files and see data preview - US1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Map CSV Columns to Required Fields (Priority: P1)

**Goal**: User can map their CSV columns to system fields with auto-detection and saved mappings

**Independent Test**: Upload CSV with non-standard column names, use dropdowns to map each field, see preview update, confirm mapping

### Implementation for User Story 2

 - [x] T018 [P] [US2] Implement column auto-detection logic in `frontend/src/modules/data/csv-parser.js`: autoDetectMapping() function with pattern matching for common column names (player, name, pts, ast, etc.)
 - [x] T019 [P] [US2] Create Alpine.js column mapper component in `frontend/src/modules/ui/column-mapper.js`: reactive data for csvColumns, mapping state, isComplete computed property
 - [x] T020 [US2] Build column mapping UI in `frontend/index.html`: dropdown selectors for each required field (13 total: name, team, position, rank, 9 stats), styled with DaisyUI
 - [x] T020 [US2] Build column mapping UI in `frontend/index.html`: dropdown selectors for each required field (13 total: name, team, position, rank, 9 stats), styled with DaisyUI
 - [x] T021 [US2] Implement mapping persistence: loadSavedMapping() from localStorage, auto-apply if columns match exactly, save after successful upload
 - [x] T022 [US2] Add mapping validation: check all required fields mapped, disable "Confirm" button until complete, display missing field warnings
- [x] T023 [US2] Implement preview update on mapping change: when user selects column, update preview table to show data under correct field names
 - [x] T023 [US2] Implement preview update on mapping change: when user selects column, update preview table to show data under correct field names
- [x] T024 [US2] Add reset and manual override controls: "Reset Mapping" button, manual edit option for auto-detected mappings
 - [x] T024 [US2] Add reset and manual override controls: "Reset Mapping" button, manual edit option for auto-detected mappings
 - [x] T025 [US2] Create UploadedPlayer entities: transform mapped CSV rows into UploadedPlayer objects with projectedStats, handle percentage normalization (54 → 0.54)

**Checkpoint**: At this point, users can map columns and see correctly structured data - US1 AND US2 both work independently

---

## Phase 5: User Story 3 - Match Player Names with Historical Stats (Priority: P1)

**Goal**: System automatically matches uploaded players to historical data with fuzzy matching

**Independent Test**: Upload CSV, observe automatic matching, verify matched players show historical stats, unmatched show indicators

### Implementation for User Story 3
npm test --silent
 - [x] T026 [P] [US3] Implement name matching algorithm in `frontend/src/modules/data/name-matcher.js`: matchPlayers() function using Fuse.js with 85% threshold, exact match first, fuzzy fallback
- [x] T027 [US3] Implement team-based disambiguation: when multiple high-confidence matches, use team as secondary criterion, handle duplicate player names
 - [x] T027 [US3] Implement team-based disambiguation: when multiple high-confidence matches, use team as secondary criterion, handle duplicate player names
- [x] T028 [P] [US3] Implement data merger in `frontend/src/modules/data/data-merger.js`: mergePlayerData() combines UploadedPlayer + HistoricalStats → IntegratedPlayer, generate UUIDs
 - [x] T028 [P] [US3] Implement data merger in `frontend/src/modules/data/data-merger.js`: mergePlayerData() combines UploadedPlayer + HistoricalStats → IntegratedPlayer, generate UUIDs
 - [x] T029 [US3] Add matching process to upload workflow: after column mapping confirmed, run name matching, show progress indicator during processing
 - [x] T030 [US3] Display match results: show match rate summary ("X/Y players matched"), add visual indicators for matched vs unmatched players, display match confidence percentages
 - [x] T031 [US3] Handle unmatched players: set hasHistoricalData=false, display "No historical data" badge, include in player table with projections only
 - [x] T028 [P] [US3] Implement data merger in `frontend/src/modules/data/data-merger.js`: mergePlayerData() combines UploadedPlayer + HistoricalStats → IntegratedPlayer, generate UUIDs
 - [x] T029 [US3] Add matching process to upload workflow: after column mapping confirmed, run name matching, show progress indicator during processing
 - [x] T030 [US3] Display match results: show match rate summary ("X/Y players matched"), add visual indicators for matched vs unmatched players, display match confidence percentages
 - [x] T031 [US3] Handle unmatched players: set hasHistoricalData=false, display "No historical data" badge, include in player table with projections only
- [x] T032 [US3] Implement manual match override UI for low-confidence matches: show inline edit controls when confidence <90%, dropdown of alternative matches, confirm/cancel actions
 - [x] T032 [US3] Implement manual match override UI for low-confidence matches: show inline edit controls when confidence <90%, dropdown of alternative matches, confirm/cancel actions
- [x] T033 [US3] Performance validation: ensure name matching completes <1s for 200 players, log timing, display in console
 - [x] T033 [US3] Performance validation: ensure name matching completes <1s for 200 players, log timing, display in console

**Checkpoint**: At this point, players are matched to historical data - US1, US2, AND US3 all work independently

---

## Phase 6: User Story 4 - Validate Data Completeness (Priority: P2)

**Goal**: System validates player data and highlights quality issues with three-tier severity

**Independent Test**: Upload CSV with intentionally incomplete data, verify issues are identified and reported correctly

### Implementation for User Story 4

 - [x] T034 [P] [US4] Implement data validator module in `frontend/src/modules/data/data-validator.js`: validatePlayers() function, validateSinglePlayer() for manual overrides
 - [x] T035 [US4] Implement three-tier validation rules: Error (missing name/position), Warning (missing >3 stats, low confidence), Info (threshold failures, position mismatch)
 - [x] T036 [P] [US4] Create Alpine.js validation reporter component in `frontend/src/modules/ui/validation-reporter.js`: reactive state for report, filterSeverity, hasErrors computed properties
 - [x] T037 [US4] Build validation reporter UI in `frontend/index.html`: severity banners (red/yellow/blue), expandable details section, player issue list with tooltips
 - [x] T038 [US4] Add validation to upload workflow: run after data merging, generate ValidationReport, display before final confirmation
 - [x] T039 [US4] Implement error blocking: disable "Confirm Upload" button if errors exist, show blocking message
 - [x] T040 [US4] Implement warning confirmation dialog: show modal for warnings, "Proceed anyway" button, list all warning issues
 - [x] T041 [US4] Add info-level indicators: display blue badges for threshold failures, position mismatches, dismissible info messages
 - [x] T042 [US4] Add filter controls: filter players by validation severity, show only problematic players option

**Checkpoint**: At this point, data validation is complete - US1, US2, US3, AND US4 all work independently

---

## Phase 7: User Story 5 - Handle Data Merging Edge Cases (Priority: P2)

**Goal**: System gracefully handles edge cases: duplicates, special characters, rookies, position mismatches

**Independent Test**: Create CSV with edge case scenarios, verify appropriate handling for each

### Implementation for User Story 5

- [x] T043 [P] [US5] Add character normalization to name matching: NFD normalization, accent removal, handle special characters (Jokić, Dončić)
- [x] T044 [P] [US5] Implement duplicate name handling: detect duplicate names, show both options in manual override, use team for disambiguation
- [x] T045 [US5] Add position mismatch detection: compare CSV position vs historical position, flag discrepancy with info icon, use CSV as source of truth
- [x] T046 [US5] Add rookie player detection: identify players without historical data, display "Rookie - No historical data" badge, include with projections only
 - [x] T047 [US5] Handle large file warnings: detect >500 players, show performance warning modal, recommend trimming to top 200-250
 - [x] T048 [US5] Add encoding detection: attempt UTF-8 decoding, handle non-UTF-8 files, display encoding error with recommendations
- [x] T049 [US5] Handle missing headers: detect CSVs without header row, display error message asking user to add headers
- [x] T050 [US5] Handle blank player names: skip rows with blank names, report in validation summary with row numbers

**Checkpoint**: At this point, all edge cases are handled - All user stories (US1-US5) work independently

**Status update (2025-10-14)**: US5 edge-case tasks (T043 - T050) were implemented and verified: name normalization, duplicate handling, position mismatch detection, rookie detection (UI badge), large-file warnings, encoding detection/fallbacks, missing-header detection, and skipping blank player rows with reporting. Frontend unit/integration tests were run and passed after these changes.

---

## Phase 8: Data Persistence & Storage

**Purpose**: Save integrated data to localStorage with quota monitoring

- [x] T051 [Storage] Implement storage quota monitoring: call checkStorageQuota() before large writes, show 80% warning banner, handle quota exceeded errors
- [x] T052 [Storage] Add re-upload warning: detect existing draft tracking data, show warning dialog before overwriting, "Proceed" and "Cancel" options
- [x] T053 [Storage] Store integrated players: save IntegratedPlayer[] to localStorage after successful upload, handle storage errors gracefully
- [x] T054 [Storage] Store column mapping: save ColumnMapping after successful upload, update savedAt timestamp
- [x] T055 [Storage] Store validation report: save ValidationReport for reference, display in UI on demand
- [x] T056 [Storage] Add clear data functionality: "Clear Upload Data" button, confirmation dialog, remove from localStorage

Status update (2025-10-14): Implemented Phase 8 storage features. Summary:
- T051: quota monitoring via `checkStorageQuota()` with 80% warning added before saving.
- T052: re-upload detection and confirmation modal implemented (`showReuploadModal`).
- T053: `saveIntegratedPlayers` persists integrated players; `loadIntegratedPlayers` added.
- T054: `saveColumnMapping` now records `savedAt` timestamp.
- T055: validation report persistence (`saveValidationReport`/`loadValidationReport`) implemented.
- T056: Clear Upload Data UI and `clearUploadData()` implemented; wired to a button in the mapping UI.

All related frontend tests were executed and passed after these changes.

**Checkpoint**: Data persistence complete, all user stories remain independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 [P] Add loading states: spinners during CSV parsing, "Matching players..." indicator, progress percentage for large files
- [x] T058 [P] Add success messages: "CSV uploaded successfully", "X/Y players matched", toast notifications with DaisyUI
- [x] T059 [P] Performance optimization: benchmark all operations, optimize Fuse.js indexing, cache normalized names
- [x] T060 [P] Accessibility improvements: ARIA labels for form controls, keyboard navigation for column mapping, screen reader announcements
- [x] T061 [P] Error recovery: add "Try Again" buttons, preserve partial state on errors, undo functionality for mappings
- [x] T062 [P] Documentation: update README with CSV upload instructions, add JSDoc comments to all modules, create developer quickstart
- [x] T063 Code cleanup: remove console.logs, extract magic numbers to constants, refactor duplicate logic
- [x] T064 Visual polish: improve spacing, add animations for state transitions, enhance error message styling
- [x] T065 Cross-browser testing: test in Chrome, Firefox, Safari, Edge, verify localStorage compatibility
- [x] T066 Run quickstart.md validation: verify all examples work, test with sample CSV files, validate performance targets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start immediately after Foundational
  - US2 (Phase 4): Can start after Foundational, integrates with US1 output
  - US3 (Phase 5): Can start after Foundational, integrates with US2 output
  - US4 (Phase 6): Can start after Foundational, validates US3 output
  - US5 (Phase 7): Can start after Foundational, enhances US3 matching
- **Storage (Phase 8)**: Depends on US1-US5 completion
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

**Critical Path**: Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Storage → Polish

- **US1 (P1)**: Foundational only - No dependencies on other stories
- **US2 (P1)**: Foundational + US1 (needs parsed CSV data for integration/testing) - Extends US1. Note: US2 module code can be written in parallel with US1, but workflow integration and testing require US1 completion
- **US3 (P1)**: Foundational + US2 (needs mapped data) - Extends US2
- **US4 (P2)**: Foundational + US3 (validates integrated data) - Enhances US3
- **US5 (P2)**: Foundational + US3 (enhances matching) - Can be developed in parallel with US4

**Note**: While stories build on each other, each remains independently testable with its own acceptance criteria.

### Within Each User Story

- Implementation tasks follow natural dependencies:
  - US1: Parse → UI → Error handling → Validation
  - US2: Auto-detect → UI → Persistence → Preview
  - US3: Match algorithm → Merger → UI → Override controls
  - US4: Validator → Rules → UI → Workflow integration
  - US5: Edge case handlers → Detection → UI feedback

### Parallel Opportunities

**Setup Phase**: T002, T003, T004 can run in parallel (different directories)

**Foundational Phase**: T006, T007, T008 can run in parallel (different files)

**Within User Stories**:
- US1: T011 can run in parallel with T012 (module vs UI)
- US2: T018 can run in parallel with T019 (logic vs component)
- US3: T026 can run in parallel with T028 (matching vs merging)
- US4: T034 can run in parallel with T036 (validator vs UI component)
- US5: T043, T044 can run in parallel (different edge cases)

**Polish Phase**: T057, T058, T059, T060, T061, T062 can run in parallel (different concerns)

---

## Parallel Example: User Story 3

```bash
# These tasks within US3 can start simultaneously:

Task T026 [P]: "Implement name matching algorithm in frontend/src/modules/data/name-matcher.js"
Task T028 [P]: "Implement data merger in frontend/src/modules/data/data-merger.js"

# Then these depend on completion of T026, T028:
Task T029: "Add matching process to upload workflow"
Task T030: "Display match results"
```

---

## Implementation Strategy

### Incremental Development (Constitution VI Compliance)

**Daily Deliverable Rule**: Each task provides demonstrable progress within 1-2 days
**Progressive Enhancement**: Start with minimal working version, enhance iteratively
**Early Validation**: Test each user story independently before moving to next

### MVP First (User Stories 1-3 Only)

**Week 1 - Days 1-2**: Complete Phase 1 + Phase 2 (Foundation)
**Week 1 - Days 3-4**: Complete Phase 3 (US1 - Upload CSV) → Test independently
**Week 1 - Day 5 + Week 2 - Day 1**: Complete Phase 4 (US2 - Column Mapping) → Test independently
**Week 2 - Days 2-3**: Complete Phase 5 (US3 - Name Matching) → Test independently
**Week 2 - Day 4**: **STOP and VALIDATE**: Test US1-US3 together as MVP
**Week 2 - Day 5**: Deploy/demo MVP if ready

### Full Feature Delivery

**Week 3 - Days 1-2**: Complete Phase 6 (US4 - Validation)
**Week 3 - Day 3**: Complete Phase 7 (US5 - Edge Cases)
**Week 3 - Day 4**: Complete Phase 8 (Storage)
**Week 3 - Day 5**: Complete Phase 9 (Polish)

### Timeline Summary

- **Setup + Foundational**: 2 days
- **US1 (Upload)**: 1.5 days
- **US2 (Mapping)**: 1.5 days
- **US3 (Matching)**: 2 days
- **US4 (Validation)**: 2 days
- **US5 (Edge Cases)**: 1.5 days
- **Storage**: 1.5 days
- **Polish**: 2 days

**Total**: ~14 days (3 weeks) for full feature
**MVP (US1-US3)**: ~7 days (1.5 weeks)

### Parallel Team Strategy

With 2 developers after Foundational phase:

**Week 1-2** (MVP Development):
- Developer A: US1 → US2 (upload and mapping flow)
- Developer B: US3 (name matching algorithms)
- Sync point: Integrate US2 → US3 handoff

**Week 3** (Enhancement):
- Developer A: US4 (validation)
- Developer B: US5 (edge cases)
- Both: Storage + Polish together

---

## Task Count Summary

- **Setup**: 4 tasks
- **Foundational**: 6 tasks
- **User Story 1 (P1)**: 7 tasks
- **User Story 2 (P1)**: 8 tasks
- **User Story 3 (P1)**: 8 tasks
- **User Story 4 (P2)**: 9 tasks
- **User Story 5 (P2)**: 8 tasks
- **Storage**: 6 tasks
- **Polish**: 10 tasks

**Total**: 66 tasks

**Parallelizable tasks**: 24 tasks marked with [P] (36% can run concurrently)

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label (US1-US5) maps task to specific user story for traceability
- Each user story has clear independent test criteria from spec.md
- Tests NOT included per specification (not explicitly requested)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Each story delivers user value incrementally
- Constitution VI compliant: All tasks completable within 1-2 days
