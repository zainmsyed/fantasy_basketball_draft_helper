"""Entry point for data-pipeline (stub)."""
import argparse
import time
from pathlib import Path
from .utils.logger import setup_logging
from argparse import Namespace
from .utils.file_handler import FileHandler
from .api.nba_client import NBAClient
from .processors.stat_calculator import StatCalculator
from .processors.name_matcher import NameMatcher
from .processors.data_validator import DataValidator


def parse_arguments() -> Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--input", default="data/input/fantrax.csv")
    p.add_argument("--output", default="data/output/last_year_stats.json")
    p.add_argument("--season", default="2024-25")
    p.add_argument("--log-level", default="INFO")
    p.add_argument("--validate-only", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--force-refresh-cache", action="store_true", dest="force_refresh_cache", help="Bypass cached NBA API responses and force a live fetch")
    p.add_argument("--cache-ttl", type=int, default=86400, help="Cache TTL in seconds for NBA API responses (default 86400 = 1 day)")
    p.add_argument("--prime-cache", action="store_true", dest="prime_cache", help="Prime the NBA API cache for the given season and exit")
    # copy to webapp by default; provide --no-copy-to-webapp to disable
    p.add_argument("--no-copy-to-webapp", action="store_false", dest="copy_to_webapp", help="Do not copy generated JSON to web app src/data/last_year_stats.json")
    p.add_argument("--report-unmatched", action="store_true", help="Print unmatched CSV players and exit non-zero if any")
    return p.parse_args()


def main() -> int:
    args = parse_arguments()
    setup_logging(args.log_level)
    fh = FileHandler()
    start = time.time()
    t0 = start
    try:
        csv_players = fh.load_csv_players(args.input)
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        return 3
    t_csv_loaded = time.time()

    # Prepare components
    nba = NBAClient(cache_ttl_seconds=args.cache_ttl)
    sc = StatCalculator()
    nm = NameMatcher()
    dv = DataValidator()

    # If requested, prime the cache (force live fetch, write cache) and exit
    if args.prime_cache:
        try:
            print("INFO: Priming NBA API cache (force refresh)...")
            _ = nba.fetch_player_stats(args.season, force_refresh=True)
            print("INFO: Cache primed successfully")
            return 0
        except Exception as e:
            print(f"ERROR: failed to prime cache: {e}")
            return 1

    # Fetch NBA data or dry-run
    nba_players = []
    if args.dry_run:
        print("INFO: Dry run mode - not calling NBA API")
        nba_players = []
    else:
        try:
            nba_players = nba.fetch_player_stats(args.season, force_refresh=args.force_refresh_cache)
        except Exception as e:
            print(f"ERROR: {e}")
            return 1
    t_api_fetched = time.time()

    # Process NBA rows into PlayerStats mapping by name
    processed = {}
    for row in nba_players:
        ps = sc.process_player_stats(row)
        processed[ps.name] = ps.to_dict()
    t_processed = time.time()

    # Match CSV players
    matches = nm.match_players(csv_players, nba_players)
    t_matched = time.time()

    processing_time = time.time() - start

    # Build outputs
    stats_out = {name: v for name, v in processed.items()}

    # For CSV players that did not match, add placeholder entries (rookies/no NBA stats)
    def placeholder_for_unmatched(csv_name):
        # use 'rookie' for team and None for numeric fields (will become JSON null)
        return {
            "team": "rookie",
            "gp": None,
            "pts": None,
            "ast": None,
            "reb": None,
            "fg3m": None,
            "fga": None,
            "fta": None,
            "stl": None,
            "blk": None,
            "tov": None,
            # percentages omitted when not available
        }

    # Add placeholders for unmatched CSV players so downstream consumers see them
    for match in matches:
        if not match.matched:
            # keep existing processed entries if any; otherwise set placeholder
            if match.csv_name not in stats_out:
                stats_out[match.csv_name] = placeholder_for_unmatched(match.csv_name)

    # Optimize for web (prune fields, rounding, size check). Do this AFTER placeholders are added
    stats_out_optimized = sc.optimize_for_web(stats_out, keep_team=True, round_decimals=1)
    os_output_path = args.output
    fh.write_stats_json(stats_out_optimized, os_output_path, copy_to_webapp=args.copy_to_webapp)
    size = 0
    try:
        size = Path(os_output_path).stat().st_size
    except Exception:
        size = 0

    total_nba_players = len(nba_players)
    report = dv.generate_validation_report(csv_players, matches, processing_time, total_nba_players=total_nba_players)
    # include phase-level performance metrics
    report["performance_metrics"] = {
        "csv_load_seconds": t_csv_loaded - t0,
        "api_fetch_seconds": t_api_fetched - t_csv_loaded,
        "processing_seconds": t_processed - t_api_fetched,
        "matching_seconds": t_matched - t_processed,
        "total_seconds": processing_time,
    }
    report["output_file_size_bytes"] = size
    out_dir = Path(os_output_path).parent
    report_path = out_dir / "validation_report.json"
    fh.write_validation_report(report, str(report_path))
    # Write unmatched CSV for manual review
    unmatched = [m.csv_name for m in matches if not m.matched]
    if unmatched:
        um_path = out_dir / "unmatched_players.csv"
        um_path.parent.mkdir(parents=True, exist_ok=True)
        with um_path.open("w", encoding="utf-8") as fh_um:
            fh_um.write("Player\n")
            for u in unmatched:
                fh_um.write(f"{u}\n")
    # If requested, report unmatched players and exit non-zero
    if args.report_unmatched and unmatched:
        print("UNMATCHED PLAYERS:")
        for u in unmatched:
            print(u)
        return 2
    print("INFO: Pipeline completed (dry-run if no NBA data)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
