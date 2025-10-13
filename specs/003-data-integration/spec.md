# Feature Specification: Data Integration

**Feature Branch**: `003-data-integration`  
**Created**: 2025-10-13  
**Status**: Draft  
**Input**: User description: "Phase 2 - Data Integration: CSV upload and parsing with PapaParse, Player name matching algorithm (CSV ↔ JSON), Data merging and validation"

## Clarifications

### Session 2025-10-13

- Q: Column Mapping Persistence Strategy → A: Store last-used mapping and auto-apply if columns match exactly
- Q: Manual Match Override Interface → A: Allow manual override only for flagged low-confidence matches (<90%)
- Q: Data Validation Severity Levels → A: Three levels: Errors (block), Warnings (allow with confirmation), Info (show only)
- Q: Local Storage Quota Handling → A: Warn user when approaching 80% quota, fail gracefully with clear message at limit
- Q: CSV Re-upload Warning Scope → A: Warn if any draft tracking data exists (drafted players or team selections)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload CSV with Player Rankings (Priority: P1)

A fantasy basketball user needs to upload their pre-draft player rankings CSV file. The system accepts the CSV, parses it, and displays a preview of the data for column mapping verification.

**Why this priority**: This is the foundational data entry point. Without CSV upload capability, no other features can function. This provides immediate value by proving the data pipeline works.

**Independent Test**: Can be fully tested by selecting a CSV file, uploading it, and seeing a data preview with correctly parsed rows. Delivers value by confirming the file format is compatible.

**Acceptance Scenarios**:

1. **Given** a user has a valid CSV file with player rankings, **When** they click the upload button and select their file, **Then** the system parses the CSV and displays a preview of the first 10 rows
2. **Given** a user uploads a CSV file, **When** the parsing completes, **Then** the system displays detected column headers for mapping
3. **Given** a user uploads an invalid file format (not CSV), **When** the system attempts to parse it, **Then** an error message displays explaining only CSV files are accepted
4. **Given** a user uploads a CSV with malformed data, **When** the parser detects errors, **Then** the system highlights problematic rows and allows the user to proceed or cancel

---

### User Story 2 - Map CSV Columns to Required Fields (Priority: P1)

A user needs to map their CSV columns to the system's required fields (Player Name, Team, Position, Rank, and all projected stat categories) because different sources use different column naming conventions.

**Why this priority**: Different fantasy platforms export CSV files with varying column names. Without flexible mapping, users would need to manually edit their files, creating friction. This is required for P1 story to be complete.

**Independent Test**: Can be tested by uploading a CSV with non-standard column names, using dropdown selectors to map each column, and confirming the system correctly interprets the data.

**Acceptance Scenarios**:

1. **Given** a CSV file has been parsed, **When** the column mapping interface displays, **Then** the user sees dropdown selectors for each required field (Player Name, Team, Position, Expert Rank, and 9 stat categories)
2. **Given** a user is mapping columns, **When** they select a CSV column for each required field, **Then** the preview updates to show data under the correct field names
3. **Given** a user has not mapped all required columns, **When** they attempt to confirm the upload, **Then** the system displays validation errors listing missing mappings
4. **Given** a user has successfully mapped all required columns, **When** they click confirm, **Then** the system processes the full dataset and displays it in the main player table

---

### User Story 3 - Match Player Names with Historical Stats (Priority: P1)

The system automatically matches uploaded player names with pre-loaded historical statistics from the bundled JSON file, enriching each player's data with last year's performance.

**Why this priority**: Historical stats are essential for users to evaluate players alongside projections. Name matching must work reliably as it directly impacts data accuracy and user trust.

**Independent Test**: Can be tested by uploading a CSV, observing the matching process, and verifying that matched players show historical stats while unmatched players display appropriate indicators.

**Acceptance Scenarios**:

1. **Given** a CSV has been uploaded with player names, **When** the system processes the data, **Then** it automatically matches player names against the pre-loaded JSON file
2. **Given** a player name matches exactly, **When** the matching completes, **Then** the player's historical stats populate in the data table
3. **Given** a player name has slight variations (e.g., "LeBron James" vs "Lebron James"), **When** the fuzzy matching algorithm runs, **Then** it successfully matches names with minor case or spacing differences
4. **Given** a player does not exist in the historical data, **When** the matching completes, **Then** the player's historical stat fields remain empty and a visual indicator shows "No historical data"
5. **Given** all players have been processed, **When** matching completes, **Then** a summary displays showing match rate (e.g., "178/200 players matched")

---

### User Story 4 - Validate Data Completeness (Priority: P2)

After data integration, the system validates that each player has the minimum required data for ranking calculations and highlights any data quality issues.

**Why this priority**: Data quality directly impacts ranking accuracy. Users need to know if critical data is missing before proceeding to use rankings in a live draft. This is P2 because basic functionality works without it, but quality validation prevents user errors.

**Independent Test**: Can be tested by uploading a CSV with intentionally incomplete data, and verifying the system identifies and reports specific issues.

**Acceptance Scenarios**:

1. **Given** data integration is complete, **When** the validation process runs, **Then** the system checks each player for required fields (name, position, at least 6 of 9 stat categories)
2. **Given** a player is missing critical data, **When** validation completes, **Then** the player row displays a warning icon with tooltip explaining missing fields
3. **Given** multiple players have data issues, **When** validation completes, **Then** a summary report shows total warnings and allows filtering to view only problematic players
4. **Given** a player has insufficient FG% data (less than 5 FGA), **When** validation runs, **Then** the system flags that the player will be excluded from FG% ranking calculations

---

### User Story 5 - Handle Data Merging Edge Cases (Priority: P2)

The system gracefully handles edge cases during data merging, such as duplicate player names, position mismatches between CSV and JSON, and special characters in names.

**Why this priority**: Edge cases can break the user experience if not handled properly. This is P2 because most uploads will work fine, but handling edge cases improves robustness and user confidence.

**Independent Test**: Can be tested by creating CSV files with edge case scenarios and verifying appropriate handling for each.

**Acceptance Scenarios**:

1. **Given** the CSV contains two players with the same name (e.g., two "Kevin Porter Jr." in different seasons), **When** matching occurs, **Then** the system uses team information as a secondary matching criterion
2. **Given** a player's position differs between CSV and historical data, **When** merging occurs, **Then** the system uses the CSV position (more current) and flags the discrepancy with an info icon
3. **Given** a player name contains special characters or accents (e.g., "Nikola Jokić"), **When** matching occurs, **Then** the system normalizes characters and successfully matches
4. **Given** a CSV contains a rookie player with no historical data, **When** matching completes, **Then** the system includes the player with only projected stats and clearly marks them as "Rookie - No historical data"

---

### Edge Cases

- What happens when a CSV file is extremely large (>500 players)? System should warn about performance impact and recommend trimming to top 200-250 players.
- What happens when the CSV has no header row? System should detect this and display an error asking user to add headers.
- What happens when a player's name is blank in the CSV? System should skip that row and report it in the validation summary.
- What happens when the pre-loaded JSON file fails to load? System should display a critical error and prevent CSV upload until the issue is resolved.
- What happens when a user uploads a CSV encoded in a non-UTF-8 format? System should attempt to detect encoding and convert, or display an error with encoding recommendations.
- What happens when stat values contain non-numeric characters (e.g., "N/A", "-")? System should treat these as null values and flag in validation.
- What happens when percentage stats are provided as whole numbers (54 instead of 0.540)? System should detect the format and normalize to decimal format.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept CSV files up to 5MB in size for player ranking uploads
- **FR-002**: System MUST parse CSV files using PapaParse library with support for various delimiters and formats
- **FR-003**: System MUST provide a column mapping interface with dropdown selectors for each required field: Player Name, Team, Position, Expert Rank, PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO
- **FR-003a**: System MUST store the last-used column mapping in browser local storage and automatically apply it when uploaded CSV has exact matching column names
- **FR-004**: System MUST validate that all required columns are mapped before proceeding with data processing
- **FR-005**: System MUST display a preview of parsed CSV data showing the first 10 rows during column mapping
- **FR-006**: System MUST load pre-generated historical statistics from bundled `last_year_stats.json` file on application initialization
- **FR-007**: System MUST implement a player name matching algorithm that handles exact matches, case insensitivity, and minor spacing variations
- **FR-008**: System MUST perform fuzzy name matching with a similarity threshold of at least 85% (Fuse.js threshold 0.15, where 0=perfect match, 1=no match) to catch common name variations
- **FR-008a**: System MUST flag matches with confidence below 90% and provide manual override controls for users to confirm or correct the match
- **FR-009**: System MUST use team information as a secondary matching criterion when multiple players share the same name
- **FR-010**: System MUST normalize special characters and accents in player names for matching (e.g., "é" matches "e")
- **FR-011**: System MUST merge projected stats from CSV with historical stats from JSON into a unified player data structure
- **FR-012**: System MUST preserve CSV data as the source of truth for: player name, team, position, and expert rank
- **FR-013**: System MUST display historical stats in a separate column set that can be toggled independently from projected stats
- **FR-014**: System MUST validate data completeness, checking that each player has minimum required fields populated
- **FR-014a**: System MUST implement three validation severity levels with distinct UI behaviors: Error (disables Confirm Upload button, shows blocking message - missing name/position), Warning (shows confirmation modal with "Proceed Anyway" option - missing >3 stat categories, low confidence matches), Info (displays inline badges only, non-blocking - FG%/FT% threshold issues, position mismatches)
- **FR-015**: System MUST flag players missing more than 3 of 9 stat categories as having insufficient data
- **FR-016**: System MUST identify and flag percentage stat thresholds (FG% needs 5+ FGA, FT% needs 2+ FTA from historical data)
- **FR-017**: System MUST display a match rate summary showing "X/Y players matched with historical data"
- **FR-018**: System MUST provide visual indicators for players without historical data (e.g., rookie badge, "No data" label)
- **FR-019**: System MUST handle CSV parsing errors gracefully with user-friendly error messages
- **FR-020**: System MUST detect and report malformed CSV rows with specific row numbers and issues
- **FR-021**: System MUST complete CSV parsing for 200 players within 3 seconds
- **FR-022**: System MUST complete player name matching for 200 players within 1 second
- **FR-023**: System MUST store integrated player data in browser local storage after successful upload
- **FR-023a**: System MUST monitor browser local storage usage (via navigator.storage.estimate()) and warn users when approaching 80% of available quota bytes
- **FR-023b**: System MUST handle storage quota exceeded errors gracefully with a clear message guiding users to clear browser data or old drafts
- **FR-024**: System MUST allow users to re-upload a new CSV, replacing previously uploaded data
- **FR-025**: System MUST display a warning dialog when user attempts to upload a new CSV if draft tracking data exists (defined as: any players with drafted=true OR userTeam field populated OR pickNumber assigned)
- **FR-026**: System MUST normalize percentage stats to decimal format if provided as whole numbers (detection heuristic: any value >1.0 in FG% or FT% fields triggers division by 100; e.g., 54 → 0.540)
- **FR-027**: System MUST treat non-numeric stat values ("N/A", "-", empty) as null and exclude from calculations
- **FR-028**: System MUST allow upload of CSV files containing >500 players but display a performance warning modal recommending users trim to top 200-250 players for optimal performance; user can proceed or cancel

### Key Entities

- **UploadedPlayer**: Represents raw player data from CSV with fields: name (string), team (string), position (string), expertRank (number), projectedStats (object with 9 stat categories)
- **HistoricalStats**: Represents last year's performance from JSON with fields: gp (number), pts (number), ast (number), reb (number), threes (number), fg_pct (number), ft_pct (number), fga (number), fta (number), stl (number), blk (number), to (number)
- **IntegratedPlayer**: Merged data structure combining UploadedPlayer and HistoricalStats with additional fields: matchConfidence (number 0-100), hasHistoricalData (boolean), dataQualityFlags (array), validationIssues (array)
- **ColumnMapping**: Configuration object mapping CSV column names to system field names, with fields: playerNameColumn (string), teamColumn (string), positionColumn (string), rankColumn (string), statColumns (object with mappings for 9 categories)
- **ValidationReport**: Summary of data quality with fields: totalPlayers (number), matchedPlayers (number), unmatchedPlayers (array), dataQualityIssues (array), fgThresholdFailures (array), ftThresholdFailures (array)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully upload and parse CSV files containing 200 players in under 3 seconds with a 99% success rate for well-formed CSV files
- **SC-002**: Name matching algorithm achieves a match rate of at least 90% for standard player rosters from major fantasy platforms (excluding rookies and first-year NBA players who have no historical data available)
- **SC-003**: Fuzzy name matching reduces manual corrections by identifying 95% of common name variations (case, spacing, accents)
- **SC-004**: Column mapping interface allows users to complete field mapping in under 60 seconds for first-time uploads
- **SC-005**: Data validation identifies and reports all critical data quality issues before users proceed to rankings
- **SC-006**: System handles all documented edge cases without crashes or data corruption
- **SC-007**: Integrated player data structure loads in under 500ms after upload for immediate table display
- **SC-008**: Users can complete the entire upload-to-display workflow (CSV upload → column mapping → data integration → table view) in under 2 minutes
- **SC-009**: System provides clear, actionable error messages for 100% of parsing and validation failures
- **SC-010**: Match rate summary and validation reports display immediately after processing completes (under 100ms)
