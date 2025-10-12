from src.models.player_stats import PlayerStats
from src.processors.data_validator import DataValidator


def test_playerstats_to_dict_omit_percentages():
    ps = PlayerStats(
        name="X",
        team="T",
        gp=10,
        pts=10.0,
        ast=2.0,
        reb=3.0,
        fg3m=0.5,
        fg_pct=None,
        ft_pct=None,
        fga=3.0,
        fta=1.0,
        stl=0.5,
        blk=0.2,
        tov=1.0,
    )
    d = ps.to_dict()
    assert "fg_pct" not in d
    assert "ft_pct" not in d


def test_data_validator_report_fields():
    dv = DataValidator()
    # simple fake
    report = dv.generate_validation_report([], [], 1.23, total_nba_players=450)
    assert "timestamp" in report
    assert report["total_nba_players"] == 450
