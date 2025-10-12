from src.processors.stat_calculator import StatCalculator


def test_process_and_thresholds():
    sc = StatCalculator()
    raw = {
        "PLAYER_NAME": "Test Player",
        "TEAM_ABBREVIATION": "TST",
        "GP": 10,
        "PTS": 12.3,
        "AST": 3.4,
        "REB": 5.6,
        "FG3M": 1.2,
        "FG_PCT": 0.5,
        "FT_PCT": 0.8,
        "FGA": 6.0,
        "FTA": 1.0,
        "STL": 0.7,
        "BLK": 0.3,
        "TOV": 1.9,
    }
    ps = sc.process_player_stats(raw)
    assert ps.name == "Test Player"
    assert ps.team == "TST"
    # Apply thresholds: FGA >=5 so fg_pct stays; FTA <2 so ft_pct becomes None
    ps2 = sc.apply_percentage_thresholds(ps)
    assert ps2.fg_pct is not None
    assert ps2.ft_pct is None
