# Research: Data Preparation - Last Season Stats

**Date**: October 12, 2025  
**Feature**: Data Preparation - Last Season Stats  

## NBA API Integration Research

### Decision: NBA API Endpoint Selection
**Chosen**: `leaguedashplayerstats` endpoint from nba_api library  
**Rationale**: This endpoint provides per-game averages for all players with filtering capabilities by season. It includes all required fantasy basketball categories and allows season-specific queries for 2024-25 data.  
**Alternatives considered**: 
- `playercareerstats` - Too comprehensive, includes multiple seasons
- `playerprofilev2` - Individual player focus, would require 194+ API calls
- `leagueleaders` - Limited to statistical leaders only

### Decision: Season Parameter Configuration
**Chosen**: Season='2024-25', SeasonType='Regular Season', PerMode='PerGame'  
**Rationale**: Matches fantasy basketball requirements for current season per-game averages. Regular season excludes playoffs which can skew fantasy projections.  
**Alternatives considered**: 
- Total stats (PerMode='Totals') - Less useful for fantasy comparison
- Per 36 minutes - Not standard for fantasy basketball

### Decision: Rate Limiting Strategy
**Chosen**: 1 request per 2 seconds with exponential backoff on failures  
**Rationale**: NBA API has unofficial rate limits. Conservative approach ensures reliable data fetching without triggering blocks.  
**Alternatives considered**: 
- No rate limiting - Risk of API blocks
- Multiple concurrent requests - May trigger rate limiting faster

## Data Processing Research

### Decision: Name Matching Algorithm
**Chosen**: FuzzyWuzzy library with token_set_ratio at 85% threshold  
**Rationale**: token_set_ratio handles partial matches and word order differences common between NBA official names and fantasy CSV formats (e.g., "LeBron James" vs "James, LeBron").  
**Alternatives considered**: 
- Exact string matching - Too rigid for real-world name variations
- Levenshtein distance - Less effective for word order differences
- Multiple fuzzy algorithms - Unnecessary complexity for this use case

### Decision: Statistical Category Mapping
**Chosen**: Direct field mapping with validation for missing categories  
**Fantasy Categories**: PTS, AST, REB, 3PM (FG3M), FG%, FT%, STL, BLK, TO  
**Additional Fields**: GP (Games Played), Team, FGA, FTA for threshold calculations  
**Rationale**: Maps directly to nba_api response fields with clear naming conventions.

### Decision: Percentage Threshold Filtering
**Chosen**: Filter players with <5 FGA/game for FG% and <2 FTA/game for FT%  
**Rationale**: Ensures statistical relevance by excluding players with insufficient attempts. Prevents skewed percentages from players with minimal minutes.  
**Alternatives considered**: 
- Minutes played threshold - Not directly available in per-game endpoint
- Games played threshold - Already included as separate validation

## Data Validation Research

### Decision: Validation Report Structure
**Chosen**: JSON format with structured metrics  
```json
{
  "timestamp": "2025-10-12T10:30:00Z",
  "total_players_fetched": 450,
  "matched_players": 187,
  "unmatched_csv_players": ["Player Name 1", "Player Name 2"],
  "percentage_stat_exclusions": {
    "fg_pct": 23,
    "ft_pct": 31
  },
  "data_completeness": {
    "complete_records": 187,
    "partial_records": 0
  }
}
```
**Rationale**: Structured format enables programmatic analysis and integration into automated workflows.

### Decision: Data Quality Metrics
**Chosen**: Track completion rate, match accuracy, threshold exclusions  
**Key Metrics**: 
- Player match rate (target: 90%+)
- Complete statistical records (target: 95%+)
- Percentage threshold exclusions (tracking only)
**Rationale**: Provides quantitative measures for data quality assessment and troubleshooting.

## File Optimization Research

### Decision: JSON Structure Optimization
**Chosen**: Flat player object structure with string keys  
```json
```json
{
  "LeBron James": {
    "pts": 25.7,
    "ast": 7.3,
    "reb": 7.3,
    "fg3m": 2.1,
    "fg_pct": 0.540,
    "ft_pct": 0.731,
    "stl": 1.3,
    "blk": 0.5,
    "tov": 3.5,
    "gp": 71
  }
}
```
**Rationale**: Simple key-value lookup enables O(1) player retrieval in web application. Flat structure minimizes parsing overhead.  
**Alternatives considered**: 
- Array of player objects - Requires linear search for lookups
- Nested structure by team - Complicates player lookups
- Separate files by position - Unnecessary complexity

### Decision: File Size Optimization
**Chosen**: Remove unnecessary fields, round decimals to 1 place, compress JSON  
**Target**: <1MB file size for ~200 players  
**Rationale**: Faster web application loading while maintaining statistical precision adequate for fantasy basketball.

## Error Handling Research

### Decision: API Failure Strategy
**Chosen**: Fail fast with detailed error messages and retry instructions  
**Error Types**: Network timeout, API rate limiting, invalid response format  
**Response**: Log detailed error, output clear user message, exit with non-zero code  
**Rationale**: Enables quick debugging and prevents generation of incomplete data that could corrupt the web application.

### Decision: Data Quality Fallbacks
**Chosen**: No fallbacks - require complete, valid data for all matched players  
**Rationale**: Fantasy basketball requires accurate data. Partial or estimated data could lead to poor draft decisions.  
**Alternatives considered**: 
- Use previous season data for missing players - Risk of outdated information
- Interpolate missing statistics - Risk of inaccurate projections

## Performance Optimization Research

### Decision: Data Processing Pipeline
**Chosen**: Sequential processing with progress logging  
**Steps**: 
1. Load and validate fantrax.csv
2. Fetch NBA API data (single request)
3. Process and match player names
4. Apply statistical filters
5. Generate validation report
6. Write optimized JSON output
**Rationale**: Simple, debuggable pipeline with clear progress indicators.

### Decision: Memory Management
**Chosen**: Stream processing for large datasets, immediate cleanup of temporary data  
**Rationale**: Prevents memory issues when processing full NBA player dataset before filtering to fantrax list.

## Dependencies Research

### Decision: Python Package Selection
**Chosen**: 
- nba_api: 1.1.14+ (official NBA stats API wrapper)
- pandas: 2.0+ (data processing and CSV handling)
- fuzzywuzzy: 0.18+ (fuzzy string matching)
- python-Levenshtein: 0.20+ (fast string comparison backend)

**Rationale**: Minimal, well-maintained packages with clear upgrade paths. nba_api is the standard library for NBA data access.

**Alternatives considered**: 
- requests + manual API handling - Unnecessary complexity given nba_api availability
- difflib (stdlib) - Slower than fuzzywuzzy for large datasets
- numpy for calculations - Pandas includes necessary functionality