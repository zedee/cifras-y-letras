import pytest
from unittest.mock import MagicMock, patch
from backend.engine.letters import LetterEngine

@pytest.fixture
def engine():
    return LetterEngine()

def test_generate_letters(engine):
    letters = engine.generate_letters(5)
    assert len(letters) == 10
    # Check that some are uppercase (as per the logic)
    assert all(c.isupper() for c in letters)

@patch("sqlite3.connect")
def test_find_longest_word_success(mock_connect, engine):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Correctly mock fetchall to return a list of tuples
    mock_cursor.fetchall.return_value = [("casa",)]

    word, length = engine.find_longest_word(list("CASA"))
    assert word == "casa"
    assert length == 4