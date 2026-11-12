import pytest
from unittest.mock import MagicMock, patch
from backend.engine.letters import LetterEngine

@pytest.fixture
def engine():
    # We provide a dummy path because we will mock the connection
    return LetterEngine(db_path='dummy_path.db')

def test_generate_letters_count(engine):
    """Verify that generate_letters always returns exactly 10 letters."""
    for count in [3, 4, 5, 6]:
        letters = engine.generate_letters(count)
        assert len(letters) == 10
        assert count <= len([l for l in letters if l in 'AEIOU']) <= count + 1 # Small variance due to random choices

def test_check_letter_pool(engine):
    """Test the internal helper for checking if a word can be formed."""
    # Success case
    assert engine._check_letter_pool("casa", ["c", "a", "s", "a", "x"]) is True
    # Fail case: missing letter
    assert engine._check_letter_pool("casa", ["c", "a", "s"]) is False
    # Fail case: not enough of a specific letter
    assert engine._check_letter_pool("ananas", ["a", "n", "a", "m", "a", "s"]) is False
    assert engine._check_letter_pool("ananas", ["a", "n", "a", "n", "s"]) is False 
    # Success case with uppercase
    assert engine._check_letter_pool("PERRO", ["p", "e", "r", "r", "o"]) is True

@patch('sqlite3.connect')
def test_find_longest_word(mock_connect, engine):
    """Test finding the longest word with mocked database results."""
    # Setup mock
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_connect.return_value = mock_conn
    
    # Mock DB returning words of different lengths
    # We want to see if it picks the longest one that fits the letters
    mock_cursor.fetchall.return_value = [
        ("casa",),         # Length 4 (should be ignored by query but let's see)
        ("perro",),        # Length 5
        ("camino",),       # Length 6
        ("estrellas",),    # Length 9
        ("computadora",),  # Length 11 (should be ignored by query)
        ("biblioteca",)    # Length 10
    ]
    
    # Case 1: Pool allows "biblioteca" (10)
    letters = ["b", "i", "b", "l", "i", "o", "t", "e", "c", "a"]
    word, length = engine.find_longest_word(letters)
    assert word == "biblioteca"
    assert length == 10

    # Case 2: Pool only allows "camino" (6)
    letters = ["c", "a", "m", "i", "n", "o"]
    word, length = engine.find_longest_word(letters)
    assert word == "camino"
    assert length == 6

@patch('sqlite3.connect')
def test_get_suggested_words(mock_connect, engine):
    """Test retrieving suggested words of lengths 10, 9, 8, 7, 6."""
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_connect.return_value = mock_conn
    
    # Mock DB returning a mix of words
    # We provide a word for every requested length
    mock_cursor.fetchall.return_value = [
        ("sacagrapas",),   # length 10
        ("tachadura",),    # length 9
        ("abalorio",),    # length 8
        ("rabillo",),    # length 7
        ("macaco",),    # length 6
        ("padre",),    # length 5 (should be ignored)
    ]
    
    # Provide letters that allow all these words
    # (In a real test we'd make them valid words, but we are testing the selection logic)
    letters = list("sacagrapastachadurabaloriorabillomacacopadre")
    
    suggestions = engine.get_suggested_words(letters)
    
    # Check that we got 5 suggestions
    assert len(suggestions) == 5
    # Check that they have the correct lengths
    lengths = [len(s) for s in suggestions]
    assert sorted(lengths) == [6, 7, 8, 9, 10]