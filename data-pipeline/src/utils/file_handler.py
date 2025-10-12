import csv
import json
from typing import List
from pathlib import Path
from ..models.player_stats import PlayerStats, CSVPlayer
from .exceptions import CSVParsingError
import json
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

    def write_stats_json(self, player_stats: dict, output_path: str) -> int:
        p = Path(output_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        # atomic write
        with tempfile.NamedTemporaryFile("w", delete=False, dir=str(p.parent), encoding="utf-8") as tf:
            json.dump(player_stats, tf, ensure_ascii=False, indent=2)
            tmpname = tf.name
        Path(tmpname).replace(p)
        return p.stat().st_size

    def write_validation_report(self, report: dict, output_path: str) -> None:
        p = Path(output_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", delete=False, dir=str(p.parent), encoding="utf-8") as tf:
            json.dump(report, tf, ensure_ascii=False, indent=2)
            tmpname = tf.name
        Path(tmpname).replace(p)
