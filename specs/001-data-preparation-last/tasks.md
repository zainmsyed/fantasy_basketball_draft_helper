# Tasks: Data Preparation - Last Season Stats

**Input**: Design documents from `/specs/001-data-preparation-last/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification, so test tasks are omitted per instructions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tasks MUST be sized for 1-2 day completion per Incremental Development principle (Constitution VI).

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- **Size Limit**: Each task MUST be completable within 1-2 days (Constitution VI)
- Include exact file paths in descriptions

## Path Conventions
Based on project structure from plan.md: `data-pipeline/` for Python preprocessing, `src/` for web app integration

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create modular data pipeline directory structure (data-pipeline/src/, data-pipeline/tests/, data-pipeline/data/input/, data-pipeline/data/output/)
- [x] T002 [P] Initialize Python requirements.txt with nba_api>=1.1.14, pandas>=2.0, fuzzywuzzy>=0.18, python-Levenshtein>=0.20
- [x] T003 [P] Setup Python virtual environment and dependency installation instructions in README
- [x] T004 [P] Create logging configuration in data-pipeline/src/utils/logger.py with INFO level default
- [x] T005 [P] Copy fantrax.csv to data-pipeline/data/input/fantrax.csv from documents directory
 - [x] T001 Create modular data pipeline directory structure (data-pipeline/src/, data-pipeline/tests/, data-pipeline/data/input/, data-pipeline/data/output/)
 - [x] T002 [P] Initialize Python requirements.txt with nba_api>=1.1.14, pandas>=2.0, fuzzywuzzy>=0.18, python-Levenshtein>=0.20
 - [x] T003 [P] Setup Python virtual environment and dependency installation instructions in README
 - [x] T004 [P] Create logging configuration in data-pipeline/src/utils/logger.py with INFO level default
 - [x] T005 [P] Copy fantrax.csv to data-pipeline/data/input/fantrax.csv from documents directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create PlayerStats dataclass model in data-pipeline/src/models/player_stats.py with validation methods
- [ ] T007 [P] Create CSVPlayer dataclass model in data-pipeline/src/models/player_stats.py with validation rules
- [ ] T008 [P] Create PlayerMatch dataclass model in data-pipeline/src/models/player_stats.py for matching results
- [ ] T009 [P] Create ValidationReport dataclass model in data-pipeline/src/models/validation_report.py with metrics fields
- [ ] T010 Create FileHandler utility class in data-pipeline/src/utils/file_handler.py for CSV and JSON I/O operations
- [ ] T011 [P] Create custom exception classes in data-pipeline/src/utils/exceptions.py (APIUnavailableError, ValidationError, CSVParsingError)
- [ ] T012 Setup main script entry point in data-pipeline/src/fetch_stats.py with argument parsing and logging setup
- [x] T006 Create PlayerStats dataclass model in data-pipeline/src/models/player_stats.py with validation methods
- [x] T007 [P] Create CSVPlayer dataclass model in data-pipeline/src/models/player_stats.py with validation rules
- [x] T008 [P] Create PlayerMatch dataclass model in data-pipeline/src/models/player_stats.py for matching results
- [x] T009 [P] Create ValidationReport dataclass model in data-pipeline/src/models/validation_report.py with metrics fields
- [x] T010 Create FileHandler utility class in data-pipeline/src/utils/file_handler.py for CSV and JSON I/O operations
- [x] T011 [P] Create custom exception classes in data-pipeline/src/utils/exceptions.py (APIUnavailableError, ValidationError, CSVParsingError)
- [x] T012 Setup main script entry point in data-pipeline/src/fetch_stats.py with argument parsing and logging setup
 - [x] T006 Create PlayerStats dataclass model in data-pipeline/src/models/player_stats.py with validation methods
 - [x] T007 [P] Create CSVPlayer dataclass model in data-pipeline/src/models/player_stats.py with validation rules
 - [x] T008 [P] Create PlayerMatch dataclass model in data-pipeline/src/models/player_stats.py for matching results
 - [x] T009 [P] Create ValidationReport dataclass model in data-pipeline/src/models/validation_report.py with metrics fields
 - [x] T010 Create FileHandler utility class in data-pipeline/src/utils/file_handler.py for CSV and JSON I/O operations
 - [x] T011 [P] Create custom exception classes in data-pipeline/src/utils/exceptions.py (APIUnavailableError, ValidationError, CSVParsingError)
 - [x] T012 Setup main script entry point in data-pipeline/src/fetch_stats.py with argument parsing and logging setup

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Generate Historical Stats Data (Priority: P1) 🎯 MVP

**Goal**: Create Python pipeline that fetches NBA stats from 2024-25 season and outputs JSON file for web app bundling

**Independent Test**: Run `python fetch_stats.py` and verify last_year_stats.json contains complete statistical data for NBA players

### Implementation for User Story 1

- [x] T013 [P] [US1] Create NBAClient class in data-pipeline/src/api/nba_client.py with rate limiting (0.6 seconds between requests)
- [x] T014 [P] [US1] Create endpoint configuration in data-pipeline/src/api/endpoints.py for leaguedashplayerstats with 2024-25 season
- [x] T015 [US1] Implement fetch_player_stats method in NBAClient with error handling for API unavailability (retry up to 3 times with exponential backoff, then fail; do not publish partial datasets per FR-009)
- [x] T016 [US1] Implement CSV loading functionality in FileHandler.load_csv_players() with pandas for fantrax.csv parsing
- [x] T017 [US1] Create StatCalculator class in data-pipeline/src/processors/stat_calculator.py for NBA API data processing
- [x] T018 [US1] Implement process_player_stats method to convert raw NBA API data to PlayerStats entities
- [x] T019 [US1] Implement JSON output functionality in FileHandler.write_stats_json() with optimized structure (player name keys)
- [x] T020 [US1] Integrate all components in main script to complete basic data fetching pipeline
- [ ] T021 [US1] Add combined season totals handling for multi-team players (per FR-006 clarification)
- [x] T022 [US1] Verify JSON file size stays under 1MB target and optimize decimal precision if needed
 - [x] T013 [P] [US1] Create NBAClient class in data-pipeline/src/api/nba_client.py with rate limiting (0.6 seconds between requests)
 - [x] T014 [P] [US1] Create endpoint configuration in data-pipeline/src/api/endpoints.py for leaguedashplayerstats with 2024-25 season
 - [x] T015 [US1] Implement fetch_player_stats method in NBAClient with error handling for API unavailability (retry up to 3 times with exponential backoff, then fail; do not publish partial datasets per FR-009)
 - [x] T016 [US1] Implement CSV loading functionality in FileHandler.load_csv_players() with pandas for fantrax.csv parsing
 - [x] T017 [US1] Create StatCalculator class in data-pipeline/src/processors/stat_calculator.py for NBA API data processing
 - [x] T018 [US1] Implement process_player_stats method to convert raw NBA API data to PlayerStats entities
 - [x] T019 [US1] Implement JSON output functionality in FileHandler.write_stats_json() with optimized structure (player name keys)
 - [x] T020 [US1] Integrate all components in main script to complete basic data fetching pipeline
 - [ ] T021 [US1] Add combined season totals handling for multi-team players (per FR-006 clarification)
 - [x] T022 [US1] Verify JSON file size stays under 1MB target and optimize decimal precision if needed

**Checkpoint**: At this point, User Story 1 should be fully functional and generate basic NBA stats JSON file

- [ ] T022a [US1] Add early performance benchmark to measure processing time against 5-minute target (SC-003 validation)
- [ ] T022a [US1] Add early performance benchmark to measure processing time against 5-minute target (SC-003 validation)

---

## Phase 4: User Story 2 - Data Quality Validation (Priority: P2)

**Goal**: Add comprehensive validation and reporting to ensure data accuracy and completeness

**Independent Test**: Run validation and verify validation_report.json shows 90%+ player match rate and complete data metrics

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create NameMatcher class in data-pipeline/src/processors/name_matcher.py with fuzzywuzzy integration
- [ ] T024 [US2] Implement fuzzy name matching with 85% similarity threshold (token_set_ratio from research.md)
- [ ] T025 [US2] Implement normalize_name method for consistent name formatting (handle Jr., Sr., spacing)
- [ ] T026 [US2] Implement match_players method to create PlayerMatch entities with confidence scores
- [ ] T027 [P] [US2] Create DataValidator class in data-pipeline/src/processors/data_validator.py for quality metrics
- [ ] T028 [US2] Implement generate_validation_report method with player match rates and data completeness
- [ ] T029 [US2] Implement percentage threshold filtering in StatCalculator (5 FGA for FG%, 2 FTA for FT% per FR-004)
- [ ] T030 [US2] Add validation report JSON output in FileHandler.write_validation_report()
- [ ] T031 [US2] Integrate name matching and validation into main pipeline workflow
- [ ] T032 [US2] Add detailed error logging for unmatched players and data quality issues
- [ ] T032a [US2] Add games played (GP) validation to ensure players meet minimum game thresholds for statistical relevance
- [x] T023 [P] [US2] Create NameMatcher class in data-pipeline/src/processors/name_matcher.py with fuzzywuzzy integration
- [x] T024 [US2] Implement fuzzy name matching with 85% similarity threshold (token_set_ratio from research.md)
- [x] T025 [US2] Implement normalize_name method for consistent name formatting (handle Jr., Sr., spacing)
- [x] T026 [US2] Implement match_players method to create PlayerMatch entities with confidence scores
- [x] T027 [P] [US2] Create DataValidator class in data-pipeline/src/processors/data_validator.py for quality metrics
- [x] T028 [US2] Implement generate_validation_report method with player match rates and data completeness
- [x] T029 [US2] Implement percentage threshold filtering in StatCalculator (5 FGA for FG%, 2 FTA for FT% per FR-004)
- [x] T030 [US2] Add validation report JSON output in FileHandler.write_validation_report()
- [x] T031 [US2] Integrate name matching and validation into main pipeline workflow
- [x] T032 [US2] Add detailed error logging for unmatched players and data quality issues
- [ ] T032a [US2] Add games played (GP) validation to ensure players meet minimum game thresholds for statistical relevance
 - [x] T023 [P] [US2] Create NameMatcher class in data-pipeline/src/processors/name_matcher.py with fuzzywuzzy integration
 - [x] T024 [US2] Implement fuzzy name matching with 85% similarity threshold (token_set_ratio from research.md)
 - [x] T025 [US2] Implement normalize_name method for consistent name formatting (handle Jr., Sr., spacing)
 - [x] T026 [US2] Implement match_players method to create PlayerMatch entities with confidence scores
 - [x] T027 [P] [US2] Create DataValidator class in data-pipeline/src/processors/data_validator.py for quality metrics
 - [x] T028 [US2] Implement generate_validation_report method with player match rates and data completeness
 - [x] T029 [US2] Implement percentage threshold filtering in StatCalculator (5 FGA for FG%, 2 FTA for FT% per FR-004)
 - [x] T030 [US2] Add validation report JSON output in FileHandler.write_validation_report()
 - [x] T031 [US2] Integrate name matching and validation into main pipeline workflow
 - [x] T032 [US2] Add detailed error logging for unmatched players and data quality issues
 - [ ] T032a [US2] Add games played (GP) validation to ensure players meet minimum game thresholds for statistical relevance

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently with comprehensive validation

---

## Phase 5: User Story 3 - Data File Optimization (Priority: P3)

**Goal**: Optimize JSON file structure and size for fast web application loading

**Independent Test**: Verify optimized JSON loads in under 500ms in web browsers and maintains data integrity

### Implementation for User Story 3

- [ ] T033 [P] [US3] Implement JSON structure optimization in StatCalculator.optimize_for_web() method
- [ ] T034 [P] [US3] Add decimal rounding to 1 place for statistical precision vs file size balance
- [ ] T035 [US3] Remove unnecessary fields from final JSON output (keep only required fantasy categories + GP)
- [ ] T036 [US3] Implement file size monitoring and warnings if approaching 1MB limit
- [ ] T037 [US3] Add player lookup performance optimization in JSON structure design
- [ ] T038 [US3] Create web app integration by copying optimized JSON to src/data/last_year_stats.json
- [ ] T039 [US3] Add processing time tracking and performance metrics to validation report
- [ ] T040 [US3] Implement data compression techniques while maintaining JSON readability
- [ ] T033 [P] [US3] Implement JSON structure optimization in StatCalculator.optimize_for_web() method
- [x] T034 [P] [US3] Add decimal rounding to 1 place for statistical precision vs file size balance
- [ ] T035 [US3] Remove unnecessary fields from final JSON output (keep only required fantasy categories + GP)
- [ ] T036 [US3] Implement file size monitoring and warnings if approaching 1MB limit
- [ ] T037 [US3] Add player lookup performance optimization in JSON structure design
- [ ] T038 [US3] Create web app integration by copying optimized JSON to src/data/last_year_stats.json
- [x] T039 [US3] Add processing time tracking and performance metrics to validation report
- [x] T040 [US3] Implement data compression techniques while maintaining JSON readability
 - [ ] T033 [P] [US3] Implement JSON structure optimization in StatCalculator.optimize_for_web() method
 - [x] T034 [P] [US3] Add decimal rounding to 1 place for statistical precision vs file size balance
 - [ ] T035 [US3] Remove unnecessary fields from final JSON output (keep only required fantasy categories + GP)
 - [ ] T036 [US3] Implement file size monitoring and warnings if approaching 1MB limit
 - [ ] T037 [US3] Add player lookup performance optimization in JSON structure design
 - [ ] T038 [US3] Create web app integration by copying optimized JSON to src/data/last_year_stats.json
 - [x] T039 [US3] Add processing time tracking and performance metrics to validation report
 - [x] T040 [US3] Implement data compression techniques while maintaining JSON readability

**Checkpoint**: All user stories should now be independently functional with optimized output

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Add comprehensive CLI argument support (--input, --output, --season, --log-level, --validate-only, --dry-run)
- [ ] T042 [P] Create quickstart validation script to verify setup instructions in quickstart.md work correctly
- [ ] T043 [P] Add retry logic for transient NBA API failures: use 0.6s inter-request delay, retry up to 3 times with exponential backoff, and fail if retries exhausted (do not publish partial datasets)
- [ ] T044 [P] Implement data caching to avoid unnecessary API calls during development
- [ ] T045 Add performance benchmarking to ensure 5-minute processing time compliance
- [ ] T046 [P] Create detailed error messages with retry suggestions for all failure modes
- [ ] T047 [P] Add data integrity checks to prevent corrupted JSON output
- [ ] T048 Final integration test: end-to-end pipeline execution with fantrax.csv input
- [x] T041 [P] Add comprehensive CLI argument support (--input, --output, --season, --log-level, --validate-only, --dry-run)
- [ ] T042 [P] Create quickstart validation script to verify setup instructions in quickstart.md work correctly
- [x] T043 [P] Add retry logic for transient NBA API failures: use 0.6s inter-request delay, retry up to 3 times with exponential backoff, and fail if retries exhausted (do not publish partial datasets)
- [ ] T044 [P] Implement data caching to avoid unnecessary API calls during development
- [ ] T045 Add performance benchmarking to ensure 5-minute processing time compliance
- [x] T046 [P] Create detailed error messages with retry suggestions for all failure modes
- [x] T047 [P] Add data integrity checks to prevent corrupted JSON output
- [x] T048 Final integration test: end-to-end pipeline execution with fantrax.csv input
 - [x] T041 [P] Add comprehensive CLI argument support (--input, --output, --season, --log-level, --validate-only, --dry-run)
 - [ ] T042 [P] Create quickstart validation script to verify setup instructions in quickstart.md work correctly
 - [x] T043 [P] Add retry logic for transient NBA API failures: use 0.6s inter-request delay, retry up to 3 times with exponential backoff, and fail if retries exhausted (do not publish partial datasets)
 - [ ] T044 [P] Implement data caching to avoid unnecessary API calls during development
 - [ ] T045 Add performance benchmarking to ensure 5-minute processing time compliance
 - [x] T046 [P] Create detailed error messages with retry suggestions for all failure modes
 - [x] T047 [P] Add data integrity checks to prevent corrupted JSON output
 - [x] T048 Final integration test: end-to-end pipeline execution with fantrax.csv input

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 pipeline but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 output but independently testable

### Within Each User Story

- Models before services (T006-T009 before T013+)
- Core API functionality before data processing (T013-T015 before T017-T018)
- Basic functionality before optimization (US1 before US3)
- Core implementation before integration (individual modules before main script integration)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational models together:
Task: "Create PlayerStats dataclass model in data-pipeline/src/models/player_stats.py"
Task: "Create ValidationReport dataclass model in data-pipeline/src/models/validation_report.py"

# Launch core API components together:
Task: "Create NBAClient class in data-pipeline/src/api/nba_client.py"
Task: "Create endpoint configuration in data-pipeline/src/api/endpoints.py"
```

---

## Parallel Example: User Story 2

```bash
# Launch validation components together:
Task: "Create NameMatcher class in data-pipeline/src/processors/name_matcher.py"
Task: "Create DataValidator class in data-pipeline/src/processors/data_validator.py"
```

---

## Implementation Strategy

### Incremental Development (Constitution VI Compliance)

**Daily Deliverable Rule**: Each task MUST provide demonstrable user value within 1-2 days
**Progressive Enhancement**: Start with minimal working version, enhance iteratively
**Early Validation**: Test basic functionality before adding complexity

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - should generate basic NBA stats JSON
5. Validate against success criteria SC-001, SC-002, SC-003

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Basic NBA data pipeline working (MVP!)
3. Add User Story 2 → Test independently → Add data quality validation and reporting
4. Add User Story 3 → Test independently → Add performance optimization
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (NBA API integration)
   - Developer B: User Story 2 (validation components)
   - Developer C: User Story 3 (optimization features)
3. Stories complete and integrate independently

---

## Success Validation

### User Story 1 Success Criteria
- JSON file generated with NBA stats for 2024-25 season
- File contains all 9 fantasy categories + GP data
- Processing completes in under 5 minutes
- File size under 1MB

### User Story 2 Success Criteria  
- Player name matching achieves 90% accuracy rate
- Validation report shows data completeness metrics
- Percentage thresholds properly applied (5 FGA, 2 FTA)
- Unmatched players clearly identified

### User Story 3 Success Criteria
- JSON structure optimized for O(1) player lookup
- File loads in under 500ms in web browsers
- Data integrity maintained through optimization
- Processing performance meets all targets

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests explicitly requested in spec, so test tasks omitted
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Focus on Constitutional compliance: modular, minimal dependencies, pure functions, performance-first