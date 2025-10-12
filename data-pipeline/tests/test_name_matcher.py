from src.processors.name_matcher import NameMatcher


def test_similarity_exact():
    nm = NameMatcher()
    s = nm.calculate_similarity("LeBron James", "LeBron James")
    assert s == 1.0

def test_similarity_partial():
    nm = NameMatcher()
    s = nm.calculate_similarity("LeBron James", "James LeBron")
    assert s >= 0.8


def test_normalize_suffix_and_punct():
    nm = NameMatcher()
    assert nm.normalize_name("LeBron James Jr.") == "lebron james"
    assert nm.normalize_name("J. Doe") == "j doe"
    assert nm.normalize_name("O'Neal, Shaq") == "o'neal shaq"


def test_match_exact_and_reversed():
    nm = NameMatcher()
    csv_player = type("P", (), {"name": "LeBron James"})
    nba_players = [{"PLAYER_NAME": "LeBron James"}, {"PLAYER_NAME": "James LeBron"}]
    matches = nm.match_players([csv_player], nba_players)
    assert matches[0].matched

    csv_player2 = type("P", (), {"name": "James LeBron"})
    matches2 = nm.match_players([csv_player2], nba_players)
    assert matches2[0].matched
