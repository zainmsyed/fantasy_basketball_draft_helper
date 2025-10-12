# Data Model: Data Preparation - Last Season Stats

**Date**: October 12, 2025  
**Feature**: Data Preparation - Last Season Stats  

## Canonical Field Naming Convention

**Statistical Fields** (snake_case):
- `pts` - Points per game
- `ast` - Assists per game
- `reb` - Total rebounds per game
- `fg3m` - Three-pointers made per game
- `fg_pct` - Field goal percentage
- `ft_pct` - Free throw percentage
- `stl` - Steals per game
- `blk` - Blocks per game
- `tov` - Turnovers per game (canonical: `tov` not `to`)
- `gp` - Games played
- `fga` - Field goal attempts per game
- `fta` - Free throw attempts per game

**Percentage Format Convention**: All percentage values stored as decimals (0.0-1.0 range). Example: 45.2% → 0.452

## Name Normalization Rules

**Player Name Processing**:
1. Convert to lowercase for matching
2. Remove trailing suffixes: Jr., Sr., II, III, IV
3. Normalize spacing: collapse multiple spaces to single space
4. Remove special characters except hyphens and apostrophes
5. Handle common abbreviations: "J." → "Ja", "D." → "Da"
6. Fuzzy matching threshold: 85% using token_set_ratio

## Core Entities

### PlayerStats
Represents an individual NBA player's statistical profile for the 2024-25 season.

**Fields**:
- `name` (string): Player's full name as used in NBA official records
- `team` (string): Current team abbreviation (e.g., "LAL", "GSW")
- `gp` (integer): Games played in the season
- `pts` (float): Points per game average
- `ast` (float): Assists per game average
- `reb` (float): Total rebounds per game average
- `fg3m` (float): Three-pointers made per game average
- `fg_pct` (float): Field goal percentage (0.0-1.0 format)
- `ft_pct` (float): Free throw percentage (0.0-1.0 format)
- `fga` (float): Field goal attempts per game (for threshold validation)
- `fta` (float): Free throw attempts per game (for threshold validation)
- `stl` (float): Steals per game average
- `blk` (float): Blocks per game average
- `tov` (float): Turnovers per game average

**Validation Rules**:
- All numeric fields must be >= 0
- Percentages must be between 0.0 and 1.0
- `gp` must be > 0 for active players
- `team` must be valid NBA team abbreviation
- FG% requires `fga` >= 5.0 for inclusion in ranking calculations
- FT% requires `fta` >= 2.0 for inclusion in ranking calculations

**State Transitions**:
- Raw API data → Validated PlayerStats → Filtered PlayerStats (threshold applied) → Final JSON output

### CSVPlayer
Represents a player entry from the input fantrax.csv file.

**Fields**:
- `rank` (integer): Fantasy ranking position
- `tier` (string): Fantasy tier designation (optional)
- `name` (string): Player name as listed in fantasy source
- `team` (string): Team abbreviation from fantasy source
- `position` (string): Eligible positions (e.g., "PG, SG")

**Validation Rules**:
- `rank` must be unique positive integer
- `name` must be non-empty string
- `position` must contain valid basketball positions

### PlayerMatch
Represents the result of matching a CSV player to NBA API data.

**Fields**:
- `csv_name` (string): Original name from fantrax.csv
- `nba_name` (string): Matched name from NBA API (null if no match)
- `match_score` (float): Fuzzy matching confidence score (0.0-1.0)
- `matched` (boolean): Whether match met 85% threshold
- `stats` (PlayerStats): Associated statistical data (null if no match)

**Validation Rules**:
- `match_score` must be between 0.0 and 1.0
- `matched` is true only if `match_score` >= 0.85
- `stats` is null when `matched` is false

### ValidationReport
Comprehensive data quality and processing metrics.

**Fields**:
- `timestamp` (ISO 8601 string): Processing completion time
- `total_csv_players` (integer): Players in input fantrax.csv
- `total_nba_players` (integer): Players returned from NBA API
- `matched_players` (integer): Successful name matches above threshold
- `unmatched_csv_players` (array of strings): CSV players without NBA matches
- `percentage_exclusions` (object): Count of players excluded from percentage stats
  - `fg_pct_excluded` (integer): Players below FGA threshold
  - `ft_pct_excluded` (integer): Players below FTA threshold
- `data_completeness` (object): Statistical completeness metrics
  - `complete_records` (integer): Players with all required stats
  - `partial_records` (integer): Players missing some categories
- `processing_time_seconds` (float): Total pipeline execution time
- `output_file_size_bytes` (integer): Final JSON file size

**Validation Rules**:
- All count fields must be >= 0
- `matched_players` <= `total_csv_players`
- `processing_time_seconds` must be > 0
- Timestamp must be valid ISO 8601 format

## Data Relationships

### Input Flow
```
fantrax.csv → CSVPlayer[] → PlayerMatch[] → PlayerStats[] → JSON Output
```

### Processing Pipeline
1. **CSV Loading**: fantrax.csv → CSVPlayer entities
2. **API Fetching**: NBA API → Raw player data
3. **Name Matching**: CSVPlayer + Raw data → PlayerMatch entities
4. **Statistical Processing**: PlayerMatch → PlayerStats with validation
5. **Threshold Filtering**: PlayerStats → Filtered PlayerStats
6. **Output Generation**: Filtered PlayerStats → JSON file + ValidationReport

### Data Transformations

#### Name Normalization
- Remove extra whitespace and special characters
- Handle common name variations (Jr., Sr., III)
- Convert to consistent casing

#### Statistical Calculations
- Convert totals to per-game averages where needed
- Round floating point values to 1 decimal place
- Convert percentage formats (100-based to decimal)

#### Filtering Logic
```python
def should_include_fg_pct(player_stats: PlayerStats) -> bool:
    return player_stats.fga >= 5.0

def should_include_ft_pct(player_stats: PlayerStats) -> bool:
    return player_stats.fta >= 2.0
```

## File Formats

### Input: fantrax.csv
```csv
Rank,Tier,Player,Team,Position
1,I,Nikola Jokic,DEN,C
2,,Shai Gilgeous-Alexander,OKC,PG
```

### Output: last_year_stats.json
```json
{
  "Nikola Jokic": {
    "team": "DEN",
    "gp": 79,
    "pts": 26.4,
    "ast": 9.0,
    "reb": 12.4,
    "fg3m": 0.9,
    "fg_pct": 0.583,
    "ft_pct": 0.816,
    "fga": 17.2,
    "fta": 4.8,
    "stl": 1.4,
    "blk": 0.9,
    "tov": 3.0
  }
}
```

### Output: validation_report.json
```json
{
  "timestamp": "2025-10-12T15:30:00Z",
  "total_csv_players": 194,
  "total_nba_players": 450,
  "matched_players": 187,
  "unmatched_csv_players": ["Player A", "Player B"],
  "percentage_exclusions": {
    "fg_pct_excluded": 23,
    "ft_pct_excluded": 31
  },
  "data_completeness": {
    "complete_records": 187,
    "partial_records": 0
  },
  "processing_time_seconds": 145.2,
  "output_file_size_bytes": 892400
}
```

## Data Integrity Constraints

### Referential Integrity
- Each PlayerMatch must reference a valid CSVPlayer
- PlayerStats entities must have valid team codes
- All statistical values must be non-negative

### Business Rules
- Fantasy rankings (from CSV) must be unique positive integers
- NBA team abbreviations must match current league teams
- Statistical thresholds enforce fantasy basketball relevance
- Output file size must remain under 1MB target

### Error Conditions
- API unavailable: Fail immediately with clear error message
- Invalid CSV format: Report parsing errors with line numbers
- No matching players: Warn if match rate < 50%
- Missing required stats: Exclude player with logging
- File write errors: Fail with filesystem error details