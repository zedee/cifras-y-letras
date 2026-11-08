import pytest
from unittest.mock import MagicMock, patch
from backend.engine.duels import DuelEngine

@pytest.fixture
def duel_engine():
    return DuelEngine()

def test_correct_spelling_success(duel_engine):
    assert duel_engine.check_correct_spelling("casa", "casa") is True

def test_correct_spelling_failure(duel_engine):
    assert duel_engine.check_correct_spelling("casa", "casas") is False

def test_mental_arithmetic_success(duel_engine):
    seq = "((((889 - 662) + 697) / 7) * 6) / 4"
    assert duel_engine.check_mental_arithmetic(seq, 198) is True

def test_mental_arithmetic_failure(duel_engine):
    seq = "((((889 - 662) + 697) / 7) * 6) / 4"
    assert duel_engine.check_mental_arithmetic(seq, 200) is False

@patch("sqlite3.connect")
def test_one_within_the_other_success(mock_connect, duel_engine):
    # Mock the database behavior
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    
    # Simulate finding the word in the DB
    mock_cursor.fetchone.return_value = ("amen",)
    
    # 'testamento' is 10 letters, 'amen' is inside it
    assert duel_engine.check_one_within_the_other("testamento", "amen") is True

@patch("sqlite3.connect")
def test_one_within_the_other_failure(mock_connect, duel_engine):
    # Mock the database behavior
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    
    # Simulate word NOT found in DB
    mock_cursor.fetchone.return_value = None
    
    assert duel_engine.check_one_within_the_other("testamento", "xyz") is False