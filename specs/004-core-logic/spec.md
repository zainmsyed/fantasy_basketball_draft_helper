# Feature Specification: Core Logic Implementation

**Feature Branch**: `004-core-logic`  
**Created**: 2025-10-14  
**Status**: Ready for Planning  
**Input**: User description: "phase 3 core logic from the prd"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Implement Z-Score Ranking Algorithm (Priority: P1)

As a fantasy basketball player preparing for draft, I want the system to calculate algorithmic rankings using Z-scores so that I can see how players stack up statistically across all 9 categories.

**Why this priority**: This is the core value proposition - providing data-driven rankings that complement expert opinions.

**Independent Test**: Can be fully tested by uploading sample data and verifying that algo ranks are calculated and displayed correctly, delivering statistical ranking insights.

**Acceptance Scenarios**:

1. **Given** player data with projected stats is loaded, **When** system calculates rankings, **Then** each player receives an algorithmic rank based on Z-score calculations across 9 categories
2. **Given** a player with elite stats in multiple categories, **When** Z-scores are calculated, **Then** that player ranks highly in the algorithmic ranking
3. **Given** a player with poor stats in key categories, **When** Z-scores are calculated, **Then** that player ranks lower despite high expert ranking

---

### User Story 2 - Category Selection and Dynamic Reranking (Priority: P1)

As a fantasy basketball player with a punt strategy, I want to exclude certain categories from ranking calculations so that players who excel in my remaining categories rank higher.

**Why this priority**: Punt strategies are a key competitive advantage in 9-category leagues - this enables users to optimize their draft strategy.

**Independent Test**: Can be fully tested by selecting categories to punt and verifying rankings update immediately, delivering customized ranking insights.

**Acceptance Scenarios**:

1. **Given** all 9 categories are included, **When** I deselect FT% and TO categories, **Then** rankings recalculate excluding those categories and players with strong remaining stats move up
2. **Given** a punt strategy is active, **When** I add back a category, **Then** rankings update immediately to include the newly selected category
3. **Given** players are marked as drafted, **When** categories are changed, **Then** remaining players rerank among themselves automatically

---

### User Story 3 - Last Year vs Projected Stats Toggle (Priority: P2)

As a fantasy basketball player analyzing players, I want to switch between viewing last year's actual performance and projected stats so that I can compare historical trends with expert projections.

**Why this priority**: Understanding both historical performance and projections helps users make informed draft decisions.

**Independent Test**: Can be fully tested by toggling the view and verifying correct stats display, delivering comparative analysis capability.

**Acceptance Scenarios**:

1. **Given** both last year and projected stats are available, **When** I toggle to "Last Year" view, **Then** table shows actual historical performance stats
2. **Given** "Projected" view is active, **When** I toggle to "Last Year" view, **Then** all statistical columns update to show historical data
3. **Given** rankings are calculated, **When** I switch stat views, **Then** rankings remain based on the selected stat type (last year or projected)

---

### User Story 4 - Visual Player Indicators (Priority: P2)

As a fantasy basketball player scanning the player list, I want to see each player's best and worst statistical categories highlighted so that I can quickly identify strengths and weaknesses.

**Why this priority**: Visual indicators enable rapid player evaluation during time-sensitive draft situations.

**Independent Test**: Can be fully tested by loading player data and verifying green/red highlighting appears correctly for each player's stats.

**Acceptance Scenarios**:

1. **Given** player stats are displayed, **When** viewing any player row, **Then** the player's best fantasy category is highlighted in green
2. **Given** player stats are displayed, **When** viewing any player row, **Then** the player's worst fantasy category is highlighted in red
3. **Given** visual indicators are shown, **When** punt strategy changes, **Then** highlighting updates to reflect only included categories

---

### Edge Cases

- What happens when a player has missing stats for certain categories?
- How does system handle players with very low statistical volume (below qualification thresholds for FG%/FT%)?
- What happens when all categories are excluded from ranking calculations?
- How does system behave when switching stat views during an active punt strategy?
- What happens when Z-score calculations result in ties?
- How do visual indicators behave when a player has identical best/worst stats?
- What happens to rankings when all remaining players are drafted?
- How does the system handle players with zero or negative stats in categories?
- What happens when switching stat views for players with incomplete data sets?
- How do visual indicators update when categories are excluded from punt strategy?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement Z-score ranking algorithm using 9 fantasy basketball categories (PTS, AST, REB, 3PM, FG%, FT%, STL, BLK, TO)
- **FR-002**: System MUST treat TO (turnovers) as a negative category in Z-score calculations (inverted scoring)
- **FR-003**: System MUST weight all 9 categories equally by default in Z-score calculations
- **FR-004**: System MUST provide checkboxes or toggles for users to exclude categories from ranking calculations
- **FR-005**: System MUST recalculate rankings in real-time (<100ms) when categories are added/removed from punt strategy
- **FR-006**: System MUST automatically rerank remaining players when any player is marked as drafted
- **FR-007**: System MUST maintain separate Z-score calculations for last year stats and projected stats
- **FR-008**: System MUST provide a toggle to switch between displaying last year stats and projected stats in the data table
- **FR-009**: System MUST preserve current punt strategy when switching between stat views
- **FR-010**: System MUST handle percentage stats (FG%, FT%) with qualification thresholds (minimum 5 FGA/game for FG%, minimum 2 FTA/game for FT%)
- **FR-011**: System MUST display both expert ranks and algorithmic ranks side-by-side for comparison
- **FR-012**: System MUST highlight each player's best statistical category in green (among included categories only)
- **FR-013**: System MUST highlight each player's worst statistical category in red (among included categories only)
- **FR-014**: System MUST exclude GP, Team, Position, Expert Rank, and Algo Rank from visual highlighting
- **FR-015**: System MUST update visual indicators when punt strategy changes to reflect only included categories

### Key Entities *(include if feature involves data)*

- **Player Stats**: Historical and projected statistics for each player across 9 fantasy categories
- **Punt Strategy**: Configuration specifying which categories to exclude from ranking calculations
- **Z-Score Calculation**: Statistical normalization that converts raw stats to standardized scores for ranking

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Z-score ranking calculations complete in under 100ms for 200 players
- **SC-002**: Users can switch between last year and projected stat views instantly (<50ms)
- **SC-003**: Category selection updates rankings in under 100ms
- **SC-004**: Auto-reranking after marking players as drafted completes in under 100ms
- **SC-005**: Visual indicators (green/red highlighting) update immediately when punt strategy changes
- **SC-006**: Algorithm produces consistent rankings that match industry-standard Z-score methodology
- **SC-007**: Equal weighting of categories produces mathematically accurate Z-score distributions
- **SC-008**: Users can test multiple punt strategy combinations efficiently during draft preparation
- **SC-009**: System maintains accurate rankings when switching between stat views and punt strategies
- **SC-010**: Percentage stat qualification thresholds correctly exclude low-volume players from calculations
