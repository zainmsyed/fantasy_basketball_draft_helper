from typing import List, Dict
from pathlib import Path
from ..models.player_stats import CSVPlayer, PlayerMatch

try:
    from fuzzywuzzy import fuzz
except Exception:
    fuzz = None

def token_set_ratio(a: str, b: str) -> int:
    """Simple fallback token_set_ratio implementation returning 0-100"""
    ta = set(a.lower().split())
    tb = set(b.lower().split())
    if not ta and not tb:
        return 100
    inter = ta & tb
    union = ta | tb
    if not union:
        return 0
    return int(100 * (2 * len(inter) / (len(ta) + len(tb))))


class NameMatcher:
    def __init__(self, similarity_threshold: float = 0.85):
        self.threshold = similarity_threshold

    def normalize_name(self, name: str) -> str:
        s = name or ""
        # Lowercase and trim
        s = s.strip().lower()
        # Remove common suffixes
        for suf in [", jr", " jr.", " jr", " jr", " sr", " sr.", " ii", " iii", " iv"]:
            if s.endswith(suf):
                s = s[: -len(suf)]
                s = s.strip()
        # Handle initials like 'J.' -> 'j'
        s = s.replace(".", "")
        # Remove characters except letters, numbers, hyphen and apostrophe and spaces
        import re

        s = re.sub(r"[^a-z0-9\-\' ]+", "", s)
        # collapse whitespace
        s = " ".join(s.split())
        return s

    def calculate_similarity(self, name1: str, name2: str) -> float:
        if fuzz is not None:
            return fuzz.token_set_ratio(name1, name2) / 100.0
        return token_set_ratio(name1, name2) / 100.0

    def match_players(self, csv_players: List[CSVPlayer], nba_players: List[Dict]) -> List[PlayerMatch]:
        matches: List[PlayerMatch] = []
        # Load alias map if present
        alias_map = {}
        try:
            import json
            alias_path = Path(__file__).resolve().parents[2] / "config" / "name_aliases.json"
            if alias_path.exists():
                with alias_path.open() as fh:
                    alias_map = json.load(fh)
        except Exception:
            alias_map = {}
        # Precompute normalized names and build an index: (last_name, first_initial) -> list of nba dicts
        nba_index = {}
        nba_norm = {}
        for nba in nba_players:
            nba_name_raw = nba.get("PLAYER_NAME") or nba.get("PLAYER") or nba.get("name") or ""
            nn = self.normalize_name(nba_name_raw)
            nba_norm[id(nba)] = nn
            parts = nn.split()
            if parts:
                last = parts[-1]
                first_initial = parts[0][0] if parts[0] else ""
                key = (last, first_initial)
            else:
                key = ("", "")
            nba_index.setdefault(key, []).append(nba)

        for csv in csv_players:
            best = (None, 0.0)
            nname = self.normalize_name(csv.name)
            # First pass: deterministic matches
            # determine candidate set using index; fallback to all players
            parts = nname.split()
            if parts:
                last = parts[-1]
                first_initial = parts[0][0] if parts[0] else ""
                candidates = nba_index.get((last, first_initial), [])
            else:
                candidates = []
            # always include a small fallback to all players if candidate list is empty
            if not candidates:
                candidates = nba_players

            for nba in candidates:
                nba_name_raw = nba.get("PLAYER_NAME") or nba.get("PLAYER") or nba.get("name") or ""
                nba_name = self.normalize_name(nba_name_raw)
                # alias override
                if csv.name in alias_map and alias_map[csv.name] == nba_name_raw:
                    best = (nba, 1.0)
                    break
                if nname == nba_name:
                    best = (nba, 1.0)
                    break
                # reversed name match (last, first)
                if " " in nname:
                    parts = nname.split()
                    rev = " ".join(parts[::-1])
                    if rev == nba_name:
                        best = (nba, 0.98)
                        break
            else:
                # fallback: fuzzy matching over candidate set (or all players if candidates were filled earlier)
                for nba in candidates:
                    nba_name = nba.get("PLAYER_NAME") or nba.get("PLAYER") or nba.get("name") or ""
                    # reuse precomputed normalization if available
                    nn = nba_norm.get(id(nba)) or self.normalize_name(nba_name)
                    score = self.calculate_similarity(nname, nn)
                    if score > best[1]:
                        best = (nba, score)
            matched = best[1] >= self.threshold
            nba_name = best[0].get("PLAYER_NAME") if best[0] else None
            matches.append(PlayerMatch(
                csv_name=csv.name,
                nba_name=nba_name,
                match_score=best[1],
                matched=matched,
                stats=None,
            ))
        return matches
