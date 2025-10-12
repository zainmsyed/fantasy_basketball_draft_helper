import json
from pathlib import Path

from src.api.nba_client import NBAClient


def test_fetch_uses_cache_when_available(tmp_path, monkeypatch):
    # prepare fake cached data
    cache_dir = tmp_path / "cache"
    cache_dir.mkdir()
    season = "2024-25"
    cache_file = cache_dir / f"leaguedashplayerstats_{season}.json"
    sample = [{"PLAYER_NAME": "Test Player", "GP": 10}]
    with cache_file.open("w", encoding="utf-8") as fh:
        json.dump(sample, fh)

    # Simulate nba_api missing
    monkeypatch.setattr("src.api.nba_client.leaguedashplayerstats", None)

    client = NBAClient(cache_dir=str(cache_dir), cache_enabled=True)
    rows = client.fetch_player_stats(season=season)
    assert isinstance(rows, list)
    assert rows[0]["PLAYER_NAME"] == "Test Player"


def test_cache_write_on_live_fetch(tmp_path, monkeypatch):
    # Simulate nba_api response object and endpoint
    class DummyResp:
        def get_data_frames(self):
            import pandas as pd

            df = pd.DataFrame([{"PLAYER_NAME": "Live Player", "GP": 5}])
            return [df]

    class DummyEndpoint:
        def __init__(self, *args, **kwargs):
            pass

        def get_data_frames(self):
            import pandas as pd

            df = pd.DataFrame([{"PLAYER_NAME": "Live Player", "GP": 5}])
            return [df]

    # monkeypatch the nba_api endpoint constructor
    dummy_module = type("M", (), {})
    dummy_module.LeagueDashPlayerStats = lambda *a, **k: DummyEndpoint()
    monkeypatch.setattr("src.api.nba_client.leaguedashplayerstats", dummy_module)

    cache_dir = tmp_path / "cache2"
    client = NBAClient(cache_dir=str(cache_dir), cache_enabled=True)
    rows = client.fetch_player_stats(season="2024-25")
    # cache file should now exist
    cache_file = Path(cache_dir) / "leaguedashplayerstats_2024-25.json"
    assert cache_file.exists()
    with cache_file.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    assert data[0]["PLAYER_NAME"] == "Live Player"
