
import time
from typing import List, Dict
from ..utils.exceptions import APIUnavailableError, RateLimitError

try:
    from nba_api.stats.endpoints import leaguedashplayerstats
except Exception:
    leaguedashplayerstats = None
    _NBA_API_IMPORT_ERROR = (
        "nba_api not installed. To run live fetches, install requirements: `pip install -r data-pipeline/requirements.txt`."
    )


class NBAClient:
    def __init__(self, rate_limit_seconds: float = 0.6, max_retries: int = 3):
        self.rate_limit_seconds = rate_limit_seconds
        self.max_retries = max_retries

    def fetch_player_stats(self, season: str = "2024-25") -> List[Dict]:
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
                return rows
            except Exception as exc:
                attempt += 1
                if attempt >= self.max_retries:
                    raise APIUnavailableError(f"NBA API fetch failed after {attempt} attempts: {exc}")
                time.sleep(backoff)
                backoff *= 2

    def validate_response(self, response_data: Dict) -> bool:
        return isinstance(response_data, dict)
