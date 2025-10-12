from typing import Dict
from ..models.player_stats import PlayerStats


class StatCalculator:
    def process_player_stats(self, raw_stats: Dict) -> PlayerStats:
        """Map a raw NBA API row (dict) to PlayerStats dataclass.

        Expects raw_stats keys similar to nba_api's LeagueDashPlayerStats DataFrame,
        e.g., 'PLAYER_NAME', 'TEAM_ABBREVIATION', 'GP', 'PTS', 'AST', 'REB', 'FG3M',
        'FG_PCT', 'FT_PCT', 'FGA', 'FTA', 'STL', 'BLK', 'TOV'
        """
        try:
            ps = PlayerStats(
                name=raw_stats.get("PLAYER_NAME") or raw_stats.get("PLAYER") or "",
                team=raw_stats.get("TEAM_ABBREVIATION") or raw_stats.get("TEAM") or "",
                gp=int(raw_stats.get("GP") or 0),
                pts=float(raw_stats.get("PTS") or 0.0),
                ast=float(raw_stats.get("AST") or 0.0),
                reb=float(raw_stats.get("REB") or 0.0),
                fg3m=float(raw_stats.get("FG3M") or 0.0),
                fg_pct=float(raw_stats.get("FG_PCT") or 0.0),
                ft_pct=float(raw_stats.get("FT_PCT") or 0.0),
                fga=float(raw_stats.get("FGA") or 0.0),
                fta=float(raw_stats.get("FTA") or 0.0),
                stl=float(raw_stats.get("STL") or 0.0),
                blk=float(raw_stats.get("BLK") or 0.0),
                tov=float(raw_stats.get("TOV") or raw_stats.get("TO") or 0.0),
            )
        except Exception:
            raise
        return ps

    def apply_percentage_thresholds(self, stats: PlayerStats) -> PlayerStats:
        # Per data-model: require fga >=5 for fg_pct, fta >=2 for ft_pct
        if stats.fga < 5.0:
            stats.fg_pct = None
        if stats.fta < 2.0:
            stats.ft_pct = None
        return stats

    def validate_statistical_data(self, stats: PlayerStats) -> bool:
        return stats.validate()

