"""Entry point for data-pipeline (stub)."""
import argparse
import time
from pathlib import Path
from .utils.logger import setup_logging
from .utils.file_handler import FileHandler
from .api.nba_client import NBAClient
from .processors.stat_calculator import StatCalculator
from .processors.name_matcher import NameMatcher
from .processors.data_validator import DataValidator
from .models.validation_report import ValidationReport


def parse_arguments():
    p = argparse.ArgumentParser()
    p.add_argument("--input", default="data/input/fantrax.csv")
    p.add_argument("--output", default="data/output/last_year_stats.json")
    p.add_argument("--season", default="2024-25")
    p.add_argument("--log-level", default="INFO")
    p.add_argument("--validate-only", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--report-unmatched", action="store_true", help="Print unmatched CSV players and exit non-zero if any")
    return p.parse_args()


def main():
    args = parse_arguments()
    setup_logging(args.log_level)
    fh = FileHandler()
    start = time.time()
    try:
        csv_players = fh.load_csv_players(args.input)
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        return 3

    # Prepare components
    nba = NBAClient()
    sc = StatCalculator()
    nm = NameMatcher()
    dv = DataValidator()

    # Fetch NBA data or dry-run
    nba_players = []
    if args.dry_run:
        print("INFO: Dry run mode - not calling NBA API")
        nba_players = []
    else:
        try:
            nba_players = nba.fetch_player_stats(args.season)
        except Exception as e:
            print(f"ERROR: {e}")
            return 1

    # Process NBA rows into PlayerStats mapping by name
    processed = {}
    for row in nba_players:
        ps = sc.process_player_stats(row)
        processed[ps.name] = ps.to_dict()

    # Match CSV players
    matches = nm.match_players(csv_players, nba_players)

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
    os_output_path = args.output
    fh.write_stats_json(stats_out, os_output_path)
    size = 0
    try:
        size = Path(os_output_path).stat().st_size
    except Exception:
        size = 0

    total_nba_players = len(nba_players)
    report = dv.generate_validation_report(csv_players, matches, processing_time, total_nba_players=total_nba_players)
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
