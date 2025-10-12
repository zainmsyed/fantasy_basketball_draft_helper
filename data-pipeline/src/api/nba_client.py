
import time
import json
from typing import List, Dict, Optional, Union
from pathlib import Path
from ..utils.exceptions import APIUnavailableError

try:
    from nba_api.stats.endpoints import leaguedashplayerstats
except Exception:
    leaguedashplayerstats = None
    _NBA_API_IMPORT_ERROR = (
        "nba_api not installed. To run live fetches, install requirements: `pip install -r data-pipeline/requirements.txt`."
    )


class NBAClient:
    def __init__(
        self,
        rate_limit_seconds: float = 0.6,
        max_retries: int = 3,
        cache_dir: Optional[Union[str, Path]] = None,
        cache_ttl_seconds: int = 60 * 60 * 24,
        cache_enabled: bool = True,
    ):
        self.rate_limit_seconds = rate_limit_seconds
        self.max_retries = max_retries
        self.cache_enabled = cache_enabled
        self.cache_ttl_seconds = cache_ttl_seconds
        # compute default cache dir under data-pipeline/data/cache
        if cache_dir is None:
            # file is at data-pipeline/src/api/nba_client.py -> parents[2] == data-pipeline
            default_cache = Path(__file__).resolve().parents[2] / "data" / "cache"
            self.cache_dir = default_cache
        else:
            self.cache_dir = Path(cache_dir)

    def fetch_player_stats(self, season: str = "2024-25", force_refresh: bool = False) -> List[Dict]:
        # If caching is enabled, check cache first (allows cached reads even when nba_api missing)
        if self.cache_enabled and not force_refresh:
            try:
                self.cache_dir.mkdir(parents=True, exist_ok=True)
                cache_file = self.cache_dir / f"leaguedashplayerstats_{season}.json"
                if cache_file.exists():
                    mtime = cache_file.stat().st_mtime
                    age = time.time() - mtime
                    if age <= self.cache_ttl_seconds:
                        with cache_file.open("r", encoding="utf-8") as fh:
                            data = json.load(fh)
                        # Expect a JSON list of rows
                        if isinstance(data, list):
                            return data
            except Exception:
                # cache read errors should not block live fetch; fall through to live fetch
                pass

        if leaguedashplayerstats is None:
            # nba_api not installed; raise APIUnavailableError with actionable message
            raise APIUnavailableError(_NBA_API_IMPORT_ERROR)

        params = {"season": season, "season_type_all_star": "Regular Season", "per_mode_detailed": "PerGame"}
        attempt = 0
        backoff = 1.0
        while attempt < self.max_retries:
            try:
                time.sleep(self.rate_limit_seconds)
                resp = leaguedashplayerstats.LeagueDashPlayerStats(season=season, season_type_all_star="Regular Season", per_mode_detailed="PerGame")
                data = resp.get_data_frames()
                if not data:
                    raise APIUnavailableError("Empty response from NBA API")
                # data[0] is a pandas DataFrame
                rows = data[0].to_dict(orient="records")
                # write to cache if enabled
                if self.cache_enabled:
                    try:
                        self.cache_dir.mkdir(parents=True, exist_ok=True)
                        cache_file = self.cache_dir / f"leaguedashplayerstats_{season}.json"
                        tmp_file = cache_file.with_suffix(".tmp")
                        with tmp_file.open("w", encoding="utf-8") as fh:
                            json.dump(rows, fh)
                        tmp_file.replace(cache_file)
                    except Exception:
                        # ignore cache write errors
                        pass
                return rows
            except Exception as exc:
                attempt += 1
                if attempt >= self.max_retries:
                    raise APIUnavailableError(f"NBA API fetch failed after {attempt} attempts: {exc}")
                time.sleep(backoff)
                backoff *= 2

    def validate_response(self, response_data: Dict) -> bool:
        return isinstance(response_data, dict)
