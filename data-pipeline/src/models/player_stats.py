from dataclasses import dataclass
from typing import Dict, Union, Optional


@dataclass
class PlayerStats:
    name: str
    team: str
    gp: int
    pts: float
    ast: float
    reb: float
    fg3m: float
    fg_pct: float
    ft_pct: float
    fga: float
    fta: float
    stl: float
    blk: float
    tov: float

    def validate(self) -> bool:
        """Validate statistical ranges according to data-model.md rules."""
        if self.gp <= 0:
            return False
        if any(getattr(self, f) < 0 for f in [
            "pts",
            "ast",
            "reb",
            "fg3m",
            "fga",
            "fta",
            "stl",
            "blk",
            "tov",
        ]):
            return False
        if not (0.0 <= self.fg_pct <= 1.0):
            return False
        if not (0.0 <= self.ft_pct <= 1.0):
            return False
        return True

    def to_dict(self) -> Dict[str, Union[str, int, float]]:
        out: Dict[str, Union[str, int, float]] = {
            "team": self.team,
            "gp": self.gp,
            "pts": round(self.pts, 1),
            "ast": round(self.ast, 1),
            "reb": round(self.reb, 1),
            "fg3m": round(self.fg3m, 1),
            "fga": round(self.fga, 1),
            "fta": round(self.fta, 1),
            "stl": round(self.stl, 1),
            "blk": round(self.blk, 1),
            "tov": round(self.tov, 1),
        }

        # Include percentage fields only when present (not excluded by thresholds)
        if self.fg_pct is not None:
            out["fg_pct"] = round(self.fg_pct, 3)
        if self.ft_pct is not None:
            out["ft_pct"] = round(self.ft_pct, 3)
        return out


@dataclass
class CSVPlayer:
    rank: Optional[int]
    tier: Optional[str]
    name: str
    team: Optional[str]
    position: Optional[str]


@dataclass
class PlayerMatch:
    csv_name: str
    nba_name: Optional[str]
    match_score: float
    matched: bool
    stats: Optional[PlayerStats]
