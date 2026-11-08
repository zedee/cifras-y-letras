import pytest
from unittest.mock import MagicMock, patch
from Apiservice.engine.endgame import EndgameEngine

@pytest.fixture
def engine():
    return EndgameEngine()

def test_validate_endgame_word_success(engine):
    with patch("sqlite3.connect") as mock_connect:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_connect.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = ("planetas",)
        
        is_valid = engine.validate_endgame_word("planetasxyzab", "planetas")
        assert is_valid is True

def test_validate_endgame_word_too_short(engine):
    # Word must be 7-10 letters
    is_valid = engine.validate_endgame_word("planetasxyzab", "plan")
    assert is_valid is False

def test_generate_endgame_round(engine):
    topic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"]
    rounds = engine.generate_endgame_round(topic)
    assert len(rounds) == 8
    for r in rounds:
        assert len(r["selection"]) == 12