# Quickstart: Data Preparation - Last Season Stats

**Target Audience**: Developers setting up the NBA stats data pipeline  
**Prerequisites**: Python 3.9+, pip, access to fantrax.csv player list  
**Estimated Time**: 15 minutes setup + 5 minutes execution  

## Quick Setup

### 1. Environment Setup (5 minutes)
```bash
# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r data-pipeline/requirements.txt
```

### 2. Input Data Preparation (2 minutes)
```bash
# Copy fantrax.csv to input directory
cp documents/fantrax.csv data-pipeline/data/input/

# Verify CSV format
head -5 data-pipeline/data/input/fantrax.csv
```

### 3. Run Data Pipeline (5 minutes)
```bash
# Navigate to pipeline directory
cd data-pipeline

# Execute stats fetching (takes ~3-5 minutes)
python src/fetch_stats.py

# Verify output
ls -la data/output/
cat data/output/validation_report.json
```

### 4. Copy to Web App (1 minute)
```bash
# Copy generated stats to web application
cp data/output/last_year_stats.json ../src/data/

# Verify file size is under 1MB
du -h ../src/data/last_year_stats.json
```

## Expected Output

### Success Indicators
- ✅ **Exit code 0**: Pipeline completed successfully
- ✅ **File generated**: `last_year_stats.json` created in output directory
- ✅ **Validation report**: 90%+ player match rate, file size <1MB
- ✅ **Log output**: No error messages, processing time <5 minutes

### Sample Success Output
```
INFO: Loading CSV players from data/input/fantrax.csv
INFO: Found 194 players in fantrax.csv
INFO: Fetching NBA stats for 2024-25 season...
INFO: Retrieved 450 players from NBA API
INFO: Matching player names...
INFO: Successfully matched 187/194 players (96.4%)
INFO: Applying percentage stat thresholds...
INFO: Writing optimized JSON output...
INFO: Generated last_year_stats.json (892KB)
INFO: Pipeline completed in 243.7 seconds
```

### Expected Output Structure
```json
{
  "Stephen Curry": {
    "pts": 29.5, "ast": 6.2, "reb": 5.2, "fg3m": 4.8,
    "fg_pct": 0.493, "ft_pct": 0.915, "stl": 0.9, "blk": 0.4, "tov": 3.2, "gp": 74
  }
}
```

**Note**: All percentage values (fg_pct, ft_pct) are stored as decimals (0.0-1.0) for consistent processing.

### Validation Report Sample
```json
{
  "timestamp": "2025-10-12T15:30:00Z",
  "total_csv_players": 194,
  "matched_players": 187,
  "unmatched_csv_players": [
    "Cooper Flagg",
    "Ace Bailey", 
    "Kon Knueppel"
  ],
  "data_completeness": {
    "complete_records": 187,
    "partial_records": 0
  },
  "output_file_size_bytes": 914832
}
```

## Common Issues & Solutions

### Issue: NBA API Unavailable
**Symptoms**: HTTP 503 errors, connection timeouts
```
ERROR: NBA API unavailable - received 503 Service Unavailable
```
**Solution**: Wait 5-10 minutes and retry. NBA API occasionally has maintenance windows.

### Issue: Low Match Rate (<80%)
**Symptoms**: Many unmatched players in validation report
**Solution**: Check fantrax.csv for name formatting issues. Common problems:
- Extra spaces or special characters
- Different name ordering (Last, First vs First Last)
- Nicknames vs full names

### Issue: File Size Too Large (>1MB)
**Symptoms**: Generated JSON exceeds size limit
**Solution**: 
1. Reduce decimal precision in stat_calculator.py
2. Remove unnecessary fields from PlayerStats model
3. Verify player count matches fantrax.csv (should be ~190-200)

### Issue: Missing Players
**Symptoms**: Key fantasy players not found in NBA data
**Solution**: 
1. Verify player names in fantrax.csv match current NBA rosters
2. Check for rookies or traded players with name changes
3. Manually update CSV with correct NBA names if needed

## Development Workflow

### Local Development (Daily)
```bash
# Use existing JSON file to avoid API calls
cp data/output/last_year_stats.json ../src/data/
```

### Season Update (Annual)
```bash
# Update season parameter
python src/fetch_stats.py --season 2025-26

# Run full pipeline with fresh data
python src/fetch_stats.py --input data/input/fantrax.csv
```

### Troubleshooting Mode
```bash
# Dry run without API calls
python src/fetch_stats.py --dry-run

# Verbose logging
python src/fetch_stats.py --log-level DEBUG

# Validation only (using existing data)
python src/fetch_stats.py --validate-only
```

## Integration with Web App

### Build Process Integration
```bash
# Add to build script before web app compilation
cd data-pipeline && python src/fetch_stats.py
cp data/output/last_year_stats.json ../src/data/
cd .. && npm run build
```

### File Monitoring
```bash
# Check file size impact on bundle
du -h src/data/last_year_stats.json
# Should be < 1MB

# Verify JSON format
node -e "console.log(Object.keys(require('./src/data/last_year_stats.json')).length)"
# Should show player count (~190)
```

## Next Steps

After successful data generation:

1. **Web App Development**: Use generated JSON in fantasy basketball ranking algorithms
2. **Testing**: Validate player data accuracy against known sources
3. **Automation**: Consider CI/CD integration for seasonal updates
4. **Monitoring**: Set up alerts for data quality degradation

## Support Information

- **Logs Location**: `data-pipeline/logs/fetch_stats.log`
- **Configuration**: Edit constants in `src/fetch_stats.py`
- **NBA API Documentation**: https://github.com/swar/nba_api
- **Issue Reporting**: Include validation report and log excerpts