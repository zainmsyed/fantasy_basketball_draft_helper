from src.utils.file_handler import FileHandler


def test_load_csv_players(tmp_path):
    csv_content = 'Rank,Tier,Player,Team,Position\n1,I,Nikola Jokic,DEN,C\n'
    p = tmp_path / "fantrax.csv"
    p.write_text(csv_content)
    fh = FileHandler()
    players = fh.load_csv_players(str(p))
    assert len(players) == 1
    assert players[0].name == "Nikola Jokic"
