# Feature Specification: Data Preparation - Last Season Stats

**Feature Branch**: `001-data-preparation-last`  
**Created**: October 12, 2025  
**Status**: Draft  
**Input**: User description: "Data Preparation last season stats"

**Operational note**: All usage of external data APIs (for example `nba_api`) is strictly offline and performed during a pre-season data pipeline run. The runtime web application uses only the generated `last_year_stats.json` and makes no external API calls during user drafts.

## Clarifications

### Session 2025-10-12

- Q: When NBA API is temporarily unavailable, what should the data generation strategy be? → A: Fail fast with clear error message and manual retry instructions
- Q: What strategy should be used for matching player names between NBA API data and user CSV files? → A: Fuzzy matching with similarity threshold (e.g., 85% match)
- Q: What format should the data validation reporting use? → A: JSON report with structured metrics and validation results

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Historical Stats Data (Priority: P1)

As a developer setting up the fantasy basketball draft tool, I need to generate a comprehensive dataset of last season's NBA player statistics that can be bundled with the web application, so that users have access to historical performance data for making informed draft decisions.

**Why this priority**: This is the foundational data layer that enables all ranking and comparison features. Without historical stats, users cannot make informed decisions about player performance trends.

**Independent Test**: Can be fully tested by running the Python script and verifying the generated JSON file contains complete statistical data for NBA players from the previous season.

**Acceptance Scenarios**:

1. **Given** the NBA API is accessible and the Python script is configured, **When** the data generation script is executed, **Then** a complete JSON file with last season stats is created
2. **Given** the JSON file is generated, **When** the file is inspected, **Then** it contains all 9 fantasy basketball categories for each player
3. **Given** players with insufficient games played exist, **When** data is processed, **Then** percentage stats are properly filtered based on minimum thresholds

---

### User Story 2 - Data Quality Validation (Priority: P2)

As a developer, I need to validate that the generated statistical data is accurate and complete, so that the fantasy basketball tool provides reliable information to users.

**Why this priority**: Data accuracy is critical for user trust and decision-making quality. Invalid or incomplete data could lead to poor draft decisions.

**Independent Test**: Can be tested by comparing sample data points against official NBA statistics and verifying data completeness metrics.

**Acceptance Scenarios**:

1. **Given** the JSON file is generated, **When** data validation is performed, **Then** all required statistical categories are present for active players
2. **Given** percentage statistics exist, **When** validation runs, **Then** minimum attempt thresholds are enforced (5 FGA for FG%, 2 FTA for FT%)
3. **Given** player names in the dataset, **When** cross-referenced with common fantasy sources, **Then** name formatting is consistent for matching

---

### User Story 3 - Data File Optimization (Priority: P3)

As a developer, I need to optimize the statistical data file for web delivery, so that the application loads quickly for end users.

**Why this priority**: File size impacts user experience through loading times, but this optimization can be done after core functionality is established.

**Independent Test**: Can be tested by measuring file size before and after optimization and verifying load times in web browsers.

**Acceptance Scenarios**:

1. **Given** the raw statistical data is generated, **When** optimization is applied, **Then** file size is reduced while maintaining data integrity
2. **Given** the optimized file is bundled, **When** loaded in a web browser, **Then** loading completes in under 1 second
3. **Given** the optimized data structure, **When** accessed by the application, **Then** player lookup operations perform efficiently

---

### Edge Cases

- What happens when NBA API is temporarily unavailable during data generation?
- How does the system handle players who were traded mid-season (multiple team affiliations)?
- What occurs when players have insufficient games played for percentage stat qualification?
- How are rookies or players with no previous season data handled?
- What happens when player names contain special characters or formatting inconsistencies?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch complete NBA player statistics from the previous season using the nba_api library
- **FR-002**: System MUST generate a JSON file containing all 9 fantasy basketball statistical categories (PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO)
- **FR-003**: System MUST include Games Played (GP) data for injury history context without including it in ranking calculations
- **FR-004**: System MUST apply minimum threshold filters for percentage statistics (5 FGA for FG%, 2 FTA for FT%)
- **FR-005**: System MUST format player names consistently and implement fuzzy matching with 85% similarity threshold for matching with user-uploaded CSV data
- **FR-006**: System MUST handle players with multiple team affiliations by using combined season totals across all teams
- **FR-007**: System MUST optimize the JSON file structure for efficient web application loading and player lookup operations
- **FR-008**: System MUST provide data validation reporting as structured JSON with metrics identifying missing or invalid statistical entries
- **FR-009**: System MUST fail immediately with clear error message when NBA API is unavailable, providing manual retry instructions rather than generating incomplete data

- **FR-009**: System MUST retry transient NBA API failures up to 3 times with exponential backoff, then fail with a clear error message and manual retry instructions if retries are exhausted. The pipeline must not produce or publish partial datasets after exhausted retries.

### Key Entities *(include if feature involves data)*

- **Player Stats**: Individual player's complete statistical profile including all fantasy categories, games played, team affiliation, and calculated per-game averages
- **Season Data**: Complete dataset representing all qualifying NBA players from the previous season with validated statistics
- **Data Pipeline**: Python-based process that fetches, processes, validates, and outputs the statistical dataset for web application consumption

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Data generation script successfully fetches and processes statistics for 95% of active NBA players from previous season

- **SC-001**: Data generation script successfully fetches and processes statistics for >=95% of the players listed in the provided input CSV (e.g., `fantrax.csv`)
- **SC-002**: Generated JSON file size remains under 1MB while containing complete statistical data
- **SC-003**: Data generation process completes in under 5 minutes with standard internet connection
- **SC-004**: Player name matching achieves 90% accuracy rate when tested against common fantasy basketball CSV formats
- **SC-005**: Percentage stat filtering correctly excludes players below minimum thresholds (verified through spot checks)
- **SC-006**: JSON file loads and parses in web browsers in under 500ms on standard hardware

## Assumptions

- NBA API (nba_api Python library) provides accurate and complete statistical data
- Previous season data is available and accessible through the API
- Standard fantasy basketball leagues use the 9 categories specified in requirements
- File size under 1MB is acceptable for web application bundling
- Users will have CSV data with player names that can be reasonably matched to NBA official names
- Data generation is performed once per fantasy season, not during user sessions
