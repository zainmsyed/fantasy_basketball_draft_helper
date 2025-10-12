from typing import List, Dict
from ..models.player_stats import PlayerMatch
from datetime import datetime, timezone


class DataValidator:
    def generate_validation_report(self, csv_players: List[Dict], matches: List[PlayerMatch], processing_time: float, total_nba_players: int = 0) -> Dict:
        total_csv = len(csv_players)
        matched = sum(1 for m in matches if getattr(m, "matched", False))
        unmatched = [getattr(m, "csv_name", None) for m in matches if not getattr(m, "matched", False)]
        report = {
            # use timezone-aware UTC timestamp
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_csv_players": total_csv,
            "total_nba_players": total_nba_players,
            "matched_players": matched,
            "unmatched_csv_players": unmatched,
            "percentage_exclusions": {"fg_pct_excluded": 0, "ft_pct_excluded": 0},
            "data_completeness": {"complete_records": matched, "partial_records": 0},
            "processing_time_seconds": processing_time,
            "output_file_size_bytes": 0,
        }
        return report
