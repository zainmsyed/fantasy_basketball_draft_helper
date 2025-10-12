# Data Pipeline Contracts

## Python Module Interfaces

### fetch_stats.py (Main Script)
```python
def main() -> int:
    """
    Main entry point for NBA stats data pipeline.
    
    Returns:
        int: Exit code (0 for success, 1 for failure)
    
    Raises:
        SystemExit: On critical failures (API unavailable, file I/O errors)
    """

def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments for pipeline configuration."""

def setup_logging(log_level: str = "INFO") -> None:
    """Configure logging for pipeline execution."""
```

### api/nba_client.py
```python
class NBAClient:
    """Handles NBA API interactions with rate limiting and error handling."""
    
    def __init__(self, rate_limit_seconds: float = 2.0):
        """Initialize client with rate limiting configuration."""
    
    def fetch_player_stats(self, season: str = "2024-25") -> List[Dict[str, Any]]:
        """
        Fetch player statistics for specified season.
        
        Args:
            season: NBA season format (e.g., "2024-25")
            
        Returns:
            List of player stat dictionaries from NBA API
            
        Raises:
            APIUnavailableError: When NBA API returns error responses
            RateLimitError: When rate limiting is exceeded
        """
    
    def validate_response(self, response_data: Dict) -> bool:
        """Validate NBA API response structure and content."""
```

### processors/name_matcher.py
```python
class NameMatcher:
    """Handles fuzzy matching between CSV player names and NBA API names."""
    
    def __init__(self, similarity_threshold: float = 0.85):
        """Initialize matcher with similarity threshold."""
    
    def match_players(
        self, 
        csv_players: List[CSVPlayer], 
        nba_players: List[Dict]
    ) -> List[PlayerMatch]:
        """
        Match CSV players to NBA API players using fuzzy string matching.
        
        Args:
            csv_players: Players from fantrax.csv
            nba_players: Raw player data from NBA API
            
        Returns:
            List of PlayerMatch objects with match results
        """
    
    def normalize_name(self, name: str) -> str:
        """Normalize player name for consistent matching."""
    
    def calculate_similarity(self, name1: str, name2: str) -> float:
        """Calculate fuzzy match similarity score between two names."""
```

### processors/stat_calculator.py
```python
class StatCalculator:
    """Processes and validates player statistics."""
    
    def process_player_stats(self, raw_stats: Dict) -> PlayerStats:
        """
        Convert raw NBA API stats to PlayerStats entity.
        
        Args:
            raw_stats: Raw statistical data from NBA API
            
        Returns:
            Validated PlayerStats object
            
        Raises:
            ValidationError: When required stats are missing or invalid
        """
    
    def apply_percentage_thresholds(self, stats: PlayerStats) -> PlayerStats:
        """Apply minimum attempt thresholds for percentage statistics."""
    
    def validate_statistical_data(self, stats: PlayerStats) -> bool:
        """Validate statistical values are within expected ranges."""
```

### processors/data_validator.py
```python
class DataValidator:
    """Generates validation reports and data quality metrics."""
    
    def generate_validation_report(
        self,
        csv_players: List[CSVPlayer],
        matches: List[PlayerMatch],
        processing_time: float
    ) -> ValidationReport:
        """
        Create comprehensive validation report.
        
        Args:
            csv_players: Original CSV player list
            matches: Player matching results
            processing_time: Total pipeline execution time
            
        Returns:
            ValidationReport with quality metrics
        """
    
    def calculate_match_rate(self, matches: List[PlayerMatch]) -> float:
        """Calculate percentage of successful player matches."""
    
    def identify_unmatched_players(self, matches: List[PlayerMatch]) -> List[str]:
        """Return list of CSV players that couldn't be matched."""
```

### models/player_stats.py
```python
@dataclass
class PlayerStats:
    """NBA player statistical data for fantasy basketball."""
    name: str
    team: str
    gp: int
    pts: float
    ast: float
    reb: float
    fg3m: float
    fg_pct: float
    ft_pct: float
    fga: float
    fta: float
    stl: float
    blk: float
    to: float
    
    def validate(self) -> bool:
        """Validate all statistical values are within expected ranges."""
    
    def to_dict(self) -> Dict[str, Union[str, int, float]]:
        """Convert to dictionary for JSON serialization."""

@dataclass
class CSVPlayer:
    """Player data from fantrax.csv input file."""
    rank: int
    tier: str
    name: str
    team: str
    position: str

@dataclass
class PlayerMatch:
    """Result of matching CSV player to NBA API data."""
    csv_name: str
    nba_name: Optional[str]
    match_score: float
    matched: bool
    stats: Optional[PlayerStats]
```

### utils/file_handler.py
```python
class FileHandler:
    """Handles file I/O operations for CSV input and JSON output."""
    
    def load_csv_players(self, csv_path: str) -> List[CSVPlayer]:
        """
        Load player list from fantrax.csv file.
        
        Args:
            csv_path: Path to CSV input file
            
        Returns:
            List of CSVPlayer objects
            
        Raises:
            FileNotFoundError: When CSV file doesn't exist
            CSVParsingError: When CSV format is invalid
        """
    
    def write_stats_json(
        self, 
        player_stats: List[PlayerStats], 
        output_path: str
    ) -> int:
        """
        Write player statistics to optimized JSON file.
        
        Args:
            player_stats: Processed player statistical data
            output_path: Target JSON file path
            
        Returns:
            File size in bytes
            
        Raises:
            IOError: When file cannot be written
        """
    
    def write_validation_report(
        self, 
        report: ValidationReport, 
        output_path: str
    ) -> None:
        """Write validation report to JSON file."""
```

## Command Line Interface

### Script Execution
```bash
python fetch_stats.py [options]
```

### Arguments
```
Options:
  --input CSV_PATH      Path to fantrax.csv file (default: data/input/fantrax.csv)
  --output JSON_PATH    Path for output JSON (default: data/output/last_year_stats.json)
  --season SEASON       NBA season (default: 2024-25)
  --log-level LEVEL     Logging level (default: INFO)
  --validate-only       Only run validation, don't fetch new data
  --dry-run            Show what would be processed without making API calls
```

### Exit Codes
- `0`: Success - all processing completed successfully
- `1`: API Error - NBA API unavailable or rate limited
- `2`: Data Error - validation failures or missing required data
- `3`: File Error - input/output file problems

## Error Handling Contracts

### Exception Types
```python
class APIUnavailableError(Exception):
    """Raised when NBA API is not accessible."""
    
class RateLimitError(Exception):
    """Raised when API rate limits are exceeded."""
    
class ValidationError(Exception):
    """Raised when data validation fails."""
    
class CSVParsingError(Exception):
    """Raised when CSV input cannot be parsed."""
```

### Error Response Format
```json
{
  "error_type": "APIUnavailableError",
  "message": "NBA API returned 503 Service Unavailable",
  "timestamp": "2025-10-12T15:30:00Z",
  "retry_suggestion": "Wait 5 minutes and retry. Check NBA API status at...",
  "partial_data_available": false
}
```

## Integration Points

### Web Application Integration
- Output JSON file copied to `src/data/last_year_stats.json` for bundling
- Validation report available for build-time quality checks
- File size monitoring to ensure <1MB bundle impact

### CI/CD Integration
- Exit codes enable automated pipeline success/failure detection
- Validation report JSON enables automated quality gate checks
- Dry-run mode enables testing without API calls

### Development Workflow
- Local development uses cached JSON file to avoid API calls
- Fresh data generation triggered manually before production builds
- Validation report helps troubleshoot data quality issues