from pathlib import Path
import shutil
import json

from src.fetch_stats import main as fetch_main


def test_fetch_stats_writes_performance_metrics(tmp_path):
    # run fetch_stats in dry-run mode and point output to a temp dir
    out_dir = tmp_path / "data" / "output"
    out_dir.mkdir(parents=True)
    output_path = out_dir / "last_year_stats.json"

    # Ensure webapp dest path is removed before run
    repo_root = Path(__file__).resolve().parents[2]
    web_dest = repo_root / "src" / "data" / "last_year_stats.json"
    if web_dest.exists():
        # move it aside to restore later
        backup = tmp_path / "backup_last_year_stats.json"
        shutil.move(str(web_dest), str(backup))
    else:
        backup = None

    # copy sample fantrax.csv into temp input location
    repo_fantrax = repo_root / "documents" / "fantrax.csv"
    temp_input_dir = tmp_path / "data" / "input"
    temp_input_dir.mkdir(parents=True)
    temp_fantrax = temp_input_dir / "fantrax.csv"
    shutil.copy(str(repo_fantrax), str(temp_fantrax))

    import sys
    argv = ["fetch_stats.py", "--dry-run", "--input", str(temp_fantrax), "--output", str(output_path)]
    sys_argv_orig = sys.argv
    try:
        sys.argv = argv
        rc = fetch_main()
        assert rc == 0
        # validation report should exist and include performance_metrics
        report_path = out_dir / "validation_report.json"
        assert report_path.exists()
        with report_path.open("r", encoding="utf-8") as fh:
            report = json.load(fh)
        assert "performance_metrics" in report
        # basic structure checks
        pm = report["performance_metrics"]
        assert "total_seconds" in pm
        assert report.get("output_file_size_bytes") is not None
    finally:
        sys.argv = sys_argv_orig
        # restore backup
        if backup is not None and backup.exists():
            shutil.move(str(backup), str(web_dest))
        else:
            # remove created web_dest
            try:
                if web_dest.exists():
                    web_dest.unlink()
            except Exception:
                pass
