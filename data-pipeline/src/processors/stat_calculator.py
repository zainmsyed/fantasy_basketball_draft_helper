from typing import Dict, List, Union
from ..models.player_stats import PlayerStats


class StatCalculator:
    def process_player_stats(self, raw_stats: Union[Dict, List[Dict]]) -> PlayerStats:
        """Map raw NBA API row(s) to PlayerStats dataclass.

        Accepts either a single dict (one row) or a list of dicts for players
        who have multiple rows (multi-team). Behavior:
        - If a row with TEAM_ABBREVIATION == 'TOT' exists, prefer that row.
        - Otherwise compute GP-weighted averages for per-game stats using GP as weight.

        Expects keys similar to nba_api's LeagueDashPlayerStats DataFrame,
        e.g., 'PLAYER_NAME', 'TEAM_ABBREVIATION', 'GP', 'PTS', 'AST', 'REB', 'FG3M',
        'FG_PCT', 'FT_PCT', 'FGA', 'FTA', 'STL', 'BLK', 'TOV'
        """
        rows: List[Dict]
        if isinstance(raw_stats, dict):
            rows = [raw_stats]
        else:
            rows = list(raw_stats)

        # Prefer 'TOT' row if present (combined totals provided by nba_api)
        tot_row = next((r for r in rows if (r.get("TEAM_ABBREVIATION") or r.get("TEAM")) == "TOT"), None)
        row = tot_row or None

        if row is None:
            # Compute GP-weighted averages for per-game stats
            total_gp = 0
            weighted_sum = {
                "PTS": 0.0,
                "AST": 0.0,
                "REB": 0.0,
                "FG3M": 0.0,
                "FGA": 0.0,
                "FTA": 0.0,
                "STL": 0.0,
                "BLK": 0.0,
                "TOV": 0.0,
            }
            # For correct percentage aggregation, compute total attempts and total made
            total_attempts_fga = 0.0
            total_made_fg = 0.0
            total_attempts_fta = 0.0
            total_made_ft = 0.0
            name = ""
            team = ""
            for r in rows:
                gp = int(r.get("GP") or 0)
                total_gp += gp
                if not name:
                    name = r.get("PLAYER_NAME") or r.get("PLAYER") or ""
                # keep team empty when multiple teams; prefer first non-empty
                if not team:
                    team = r.get("TEAM_ABBREVIATION") or r.get("TEAM") or ""
                for k in weighted_sum.keys():
                    val = r.get(k)
                    if val is None:
                        continue
                    try:
                        weighted_sum[k] += float(val) * gp
                    except Exception:
                        continue
                # handle percentages via attempts where possible
                fga = float(r.get("FGA") or 0.0)
                fg_pct = r.get("FG_PCT")
                if fg_pct is not None:
                    try:
                        fg_pct = float(fg_pct)
                        total_attempts_fga += fga * gp
                        total_made_fg += fg_pct * fga * gp
                    except Exception:
                        pass
                fta = float(r.get("FTA") or 0.0)
                ft_pct = r.get("FT_PCT")
                if ft_pct is not None:
                    try:
                        ft_pct = float(ft_pct)
                        total_attempts_fta += fta * gp
                        total_made_ft += ft_pct * fta * gp
                    except Exception:
                        pass

            # after aggregating rows, compute combined per-game statistics
            if total_gp > 0:
                # compute per-game averages
                combined_pts = weighted_sum["PTS"] / total_gp
                combined_ast = weighted_sum["AST"] / total_gp
                combined_reb = weighted_sum["REB"] / total_gp
                combined_fg3m = weighted_sum.get("FG3M", 0.0) / total_gp
                combined_fga = weighted_sum["FGA"] / total_gp
                combined_fta = weighted_sum["FTA"] / total_gp
                combined_stl = weighted_sum["STL"] / total_gp
                combined_blk = weighted_sum["BLK"] / total_gp
                combined_tov = weighted_sum["TOV"] / total_gp

                # percentages weighted by attempts when available
                if total_attempts_fga > 0:
                    combined_fg_pct = total_made_fg / total_attempts_fga
                else:
                    combined_fg_pct = None
                if total_attempts_fta > 0:
                    combined_ft_pct = total_made_ft / total_attempts_fta
                else:
                    combined_ft_pct = None

                row = {
                    "PLAYER_NAME": name,
                    "TEAM_ABBREVIATION": team or "",
                    "GP": total_gp,
                    "PTS": combined_pts,
                    "AST": combined_ast,
                    "REB": combined_reb,
                    "FG3M": combined_fg3m,
                    "FG_PCT": combined_fg_pct,
                    "FT_PCT": combined_ft_pct,
                    "FGA": combined_fga,
                    "FTA": combined_fta,
                    "STL": combined_stl,
                    "BLK": combined_blk,
                    "TOV": combined_tov,
                }
            else:
                # fallback: use first row
                row = rows[0]

        try:
            ps = PlayerStats(
                name=row.get("PLAYER_NAME") or row.get("PLAYER") or "",
                team=row.get("TEAM_ABBREVIATION") or row.get("TEAM") or "",
                gp=int(row.get("GP") or 0),
                pts=float(row.get("PTS") or 0.0),
                ast=float(row.get("AST") or 0.0),
                reb=float(row.get("REB") or 0.0),
                fg3m=float(row.get("FG3M") or 0.0),
                fg_pct=(None if row.get("FG_PCT") is None else float(row.get("FG_PCT"))),
                ft_pct=(None if row.get("FT_PCT") is None else float(row.get("FT_PCT"))),
                fga=float(row.get("FGA") or 0.0),
                fta=float(row.get("FTA") or 0.0),
                stl=float(row.get("STL") or 0.0),
                blk=float(row.get("BLK") or 0.0),
                tov=float(row.get("TOV") or row.get("TO") or 0.0),
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

    def optimize_for_web(self, stats_mapping: Dict[str, Dict], keep_team: bool = True, round_decimals: int = 1, size_warning_bytes: int = 1_000_000) -> Dict[str, Dict]:
        """Return an optimized JSON-friendly mapping for web consumption.

        - Keeps only required fantasy categories + gp (and team if keep_team).
        - Rounds counting stats to `round_decimals` (pts, ast, reb, fg3m, stl, blk, tov)
        - Keeps percentages (fg_pct, ft_pct) with 3 decimal places if present.
        - Monitors total serialized size and logs a warning via print when approaching limit.
        """
        import json

        required_fields = ["pts", "ast", "reb", "fg3m", "fg_pct", "ft_pct", "stl", "blk", "tov", "gp"]
        out = {}
        for name, data in stats_mapping.items():
            optimized = {}
            if keep_team and data.get("team") is not None:
                optimized["team"] = data.get("team")
            # gp as-is (may be None)
            if "gp" in data:
                optimized["gp"] = data.get("gp")
            # counting stats rounded
            for f in ["pts", "ast", "reb", "fg3m", "stl", "blk", "tov"]:
                v = data.get(f)
                if v is None:
                    optimized[f] = None
                else:
                    try:
                        optimized[f] = round(float(v), round_decimals)
                    except Exception:
                        optimized[f] = v
            # percentages: keep to 3 decimals if present
            for pf in ["fg_pct", "ft_pct"]:
                v = data.get(pf)
                if v is None:
                    # omit percentage entirely when None to save bytes
                    pass
                else:
                    try:
                        optimized[pf] = round(float(v), 3)
                    except Exception:
                        optimized[pf] = v

            out[name] = optimized

        # size monitoring
        try:
            serialized = json.dumps(out, ensure_ascii=False)
            size = len(serialized.encode("utf-8"))
            # warn when approaching 90% of size_warning_bytes
            if size >= int(size_warning_bytes * 0.9):
                print(f"WARNING: Optimized stats JSON size {size} bytes approaching limit {size_warning_bytes} bytes")
        except Exception:
            pass

        return out

