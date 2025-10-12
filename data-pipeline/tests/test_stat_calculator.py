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


def test_process_combined_tot_row_preferred():
    sc = StatCalculator()
    # Two rows: one for team A, one TOT combined. We should prefer TOT
    rows = [
        {
            "PLAYER_NAME": "Multi Player",
            "TEAM_ABBREVIATION": "NYK",
            "GP": 20,
            "PTS": 10.0,
            "AST": 2.0,
            "REB": 3.0,
            "FG3M": 0.5,
            "FG_PCT": 0.45,
            "FT_PCT": 0.8,
            "FGA": 8.0,
            "FTA": 2.0,
            "STL": 0.5,
            "BLK": 0.1,
            "TOV": 1.0,
        },
        {
            "PLAYER_NAME": "Multi Player",
            "TEAM_ABBREVIATION": "TOT",
            "GP": 40,
            "PTS": 12.0,
            "AST": 3.0,
            "REB": 4.0,
            "FG3M": 0.8,
            "FG_PCT": 0.48,
            "FT_PCT": 0.82,
            "FGA": 10.0,
            "FTA": 3.0,
            "STL": 0.6,
            "BLK": 0.2,
            "TOV": 1.5,
        },
    ]
    ps = sc.process_player_stats(rows)
    assert ps.gp == 40
    assert abs(ps.pts - 12.0) < 0.001


def test_process_gp_weighted_aggregation():
    sc = StatCalculator()
    # Two team rows, no TOT row — should compute GP-weighted averages
    rows = [
        {
            "PLAYER_NAME": "Split Player",
            "TEAM_ABBREVIATION": "ATL",
            "GP": 10,
            "PTS": 10.0,
            "AST": 2.0,
            "REB": 3.0,
            "FG3M": 0.5,
            "FG_PCT": 0.40,
            "FT_PCT": 0.80,
            "FGA": 8.0,
            "FTA": 2.0,
            "STL": 0.5,
            "BLK": 0.1,
            "TOV": 1.0,
        },
        {
            "PLAYER_NAME": "Split Player",
            "TEAM_ABBREVIATION": "BOS",
            "GP": 30,
            "PTS": 14.0,
            "AST": 4.0,
            "REB": 5.0,
            "FG3M": 1.0,
            "FG_PCT": 0.50,
            "FT_PCT": 0.85,
            "FGA": 12.0,
            "FTA": 3.0,
            "STL": 0.7,
            "BLK": 0.2,
            "TOV": 1.8,
        },
    ]
    ps = sc.process_player_stats(rows)
    # weighted pts = (10*10 + 30*14)/40 = (100 + 420)/40 = 13.0
    assert abs(ps.pts - 13.0) < 0.001
    assert ps.gp == 40


def test_percentage_weighting_by_attempts():
    sc = StatCalculator()
    # Two rows with different FGA and FG_PCT
    rows = [
        {
            "PLAYER_NAME": "Shooter",
            "TEAM_ABBREVIATION": "CHI",
            "GP": 10,
            "PTS": 10.0,
            "AST": 2.0,
            "REB": 3.0,
            "FG3M": 0.5,
            "FG_PCT": 0.400,
            "FT_PCT": 0.800,
            "FGA": 5.0,
            "FTA": 1.0,
            "STL": 0.5,
            "BLK": 0.1,
            "TOV": 1.0,
        },
        {
            "PLAYER_NAME": "Shooter",
            "TEAM_ABBREVIATION": "LAL",
            "GP": 30,
            "PTS": 14.0,
            "AST": 4.0,
            "REB": 5.0,
            "FG3M": 1.0,
            "FG_PCT": 0.500,
            "FT_PCT": 0.900,
            "FGA": 10.0,
            "FTA": 2.0,
            "STL": 0.7,
            "BLK": 0.2,
            "TOV": 1.8,
        },
    ]
    ps = sc.process_player_stats(rows)
    # expected FG total made = (0.4*5*10) + (0.5*10*30) = (20) + (150) = 170
    # expected FGA total attempts = (5*10) + (10*30) = 50 + 300 = 350
    expected_fg_pct = 170.0 / 350.0
    assert ps.fg_pct is not None
    assert abs(ps.fg_pct - expected_fg_pct) < 1e-6
    # expected FT made = (0.8*1*10) + (0.9*2*30) = 8 + 54 = 62
    # expected FTA attempts = (1*10) + (2*30) = 10 + 60 = 70
    expected_ft_pct = 62.0 / 70.0
    assert ps.ft_pct is not None
    assert abs(ps.ft_pct - expected_ft_pct) < 1e-6


def test_optimize_for_web_prune_and_round(tmp_path, capsys):
    sc = StatCalculator()
    # sample mapping with extra fields
    mapping = {
        "Player A": {
            "team": "LAL",
            "gp": 82,
            "pts": 25.456,
            "ast": 6.789,
            "reb": 8.123,
            "fg3m": 2.345,
            "fg_pct": 0.49321,
            "ft_pct": 0.91523,
            "stl": 1.234,
            "blk": 0.456,
            "tov": 3.333,
            "extra": "should be removed",
        }
    }
    optimized = sc.optimize_for_web(mapping, keep_team=True, round_decimals=1, size_warning_bytes=10)
    # extra field removed
    assert "extra" not in optimized["Player A"]
    # rounding applied
    assert optimized["Player A"]["pts"] == round(25.456, 1)
    # percentages kept with 3 decimals
    assert optimized["Player A"]["fg_pct"] == round(0.49321, 3)
    # size warning should have printed because size_warning_bytes is tiny
    captured = capsys.readouterr()
    assert "WARNING: Optimized stats JSON size" in captured.out
