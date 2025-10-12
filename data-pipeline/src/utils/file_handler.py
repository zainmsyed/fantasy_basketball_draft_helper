import csv
import json
from typing import List
from pathlib import Path
from ..models.player_stats import CSVPlayer
from .exceptions import CSVParsingError
import tempfile


class FileHandler:
    def load_csv_players(self, csv_path: str) -> List[CSVPlayer]:
        p = Path(csv_path)
        if not p.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
        players = []
        with p.open(newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                try:
                    rank = int(row.get("Rank")) if row.get("Rank") else None
                except ValueError:
                    raise CSVParsingError(f"Invalid Rank value: {row.get('Rank')}")
                players.append(CSVPlayer(
                    rank=rank,
                    tier=row.get("Tier") or None,
                    name=row.get("Player") or row.get("name") or "",
                    team=row.get("Team") or None,
                    position=row.get("Position") or None,
                ))
        return players

    def write_stats_json(self, player_stats: dict, output_path: str, copy_to_webapp: bool = False) -> int:
        """Write player stats JSON atomically. Optionally copy to web app data directory.

        Args:
            player_stats: Mapping of player name -> stat dict
            output_path: Destination path for primary output (data-pipeline output)
            copy_to_webapp: If True, also copy the written file to repo `src/data/last_year_stats.json`

        Returns:
            File size in bytes of the primary output file
        """
        p = Path(output_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        # atomic write
        with tempfile.NamedTemporaryFile("w", delete=False, dir=str(p.parent), encoding="utf-8") as tf:
            json.dump(player_stats, tf, ensure_ascii=False, indent=2)
            tmpname = tf.name
        Path(tmpname).replace(p)
        size = p.stat().st_size

        if copy_to_webapp:
            try:
                # Copy to repo's web app data directory: src/data/last_year_stats.json
                web_dest = Path(__file__).resolve().parents[3] / "src" / "data" / "last_year_stats.json"
                web_dest.parent.mkdir(parents=True, exist_ok=True)
                # atomic copy
                with tempfile.NamedTemporaryFile("w", delete=False, dir=str(web_dest.parent), encoding="utf-8") as tfw:
                    json.dump(player_stats, tfw, ensure_ascii=False, indent=2)
                    tmpw = tfw.name
                Path(tmpw).replace(web_dest)
            except Exception:
                # Do not fail the pipeline if web-copy fails; log or re-raise higher up if desired
                pass

        return size

    def write_validation_report(self, report: dict, output_path: str) -> None:
        p = Path(output_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", delete=False, dir=str(p.parent), encoding="utf-8") as tf:
            json.dump(report, tf, ensure_ascii=False, indent=2)
            tmpname = tf.name
        Path(tmpname).replace(p)
