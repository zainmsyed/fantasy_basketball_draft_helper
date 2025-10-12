from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime


@dataclass
class ValidationReport:
    timestamp: str
    total_csv_players: int
    total_nba_players: int
    matched_players: int
    unmatched_csv_players: List[str]
    percentage_exclusions: Dict[str, int]
    data_completeness: Dict[str, int]
    processing_time_seconds: float
    output_file_size_bytes: int

    @classmethod
    def create_empty(cls) -> "ValidationReport":
        return cls(
            timestamp=datetime.utcnow().isoformat() + "Z",
            total_csv_players=0,
            total_nba_players=0,
            matched_players=0,
            unmatched_csv_players=[],
            percentage_exclusions={"fg_pct_excluded": 0, "ft_pct_excluded": 0},
            data_completeness={"complete_records": 0, "partial_records": 0},
            processing_time_seconds=0.0,
            output_file_size_bytes=0,
        )
