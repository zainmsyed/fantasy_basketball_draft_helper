# Data Pipeline - Last Season Stats

This folder contains a small Python pipeline to fetch NBA player stats (2024-25), validate and optimize them for web bundling.

Quickstart (dry-run)

```bash
python -m venv venv
source venv/bin/activate
pip install -r data-pipeline/requirements.txt
# dry-run (uses existing input CSV and does not require nba_api)
PYTHONPATH=./data-pipeline python3 -m src.fetch_stats --dry-run --input data-pipeline/data/input/fantrax.csv --output data-pipeline/data/output/last_year_stats.json
```

Run live (requires `nba_api` and network access)

```bash
pip install -r data-pipeline/requirements.txt
PYTHONPATH=./data-pipeline python3 -m src.fetch_stats --input data-pipeline/data/input/fantrax.csv --output data-pipeline/data/output/last_year_stats.json
```

Reporting unmatched players

```bash
PYTHONPATH=./data-pipeline python3 -m src.fetch_stats --dry-run --report-unmatched
```

Notes
- Outputs are written atomically to avoid partial files.
- Use `--dry-run` for development.
- If you plan to run live API fetches, ensure `nba_api` is installed in your environment.

Canonical CSV for app
---------------------

This pipeline writes a canonical CSV at `data-pipeline/data/output/last_year_stats.csv` (rookies use `team = "rookie"` and missing stats are `null` in the JSON export). For convenience the pipeline output is copied to the app at `src/data/last_year_stats.csv`. A compressed copy is also available at `data-pipeline/data/output/last_year_stats.csv.gz`.

If your app expects a different path, update the copy step or change the app to read from `src/data/last_year_stats.csv`.
