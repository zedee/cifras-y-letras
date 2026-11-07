import pytest
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

def test_one_within_the_other_success(duel_engine):
    # Ensure 'testamento' and 'amen' are in your DB for this to pass
    # If they aren't, you can mock the DB or add them to your data
    assert duel_engine.check_one_within_the_other("testamento", "amen") is True

def test_one_within_the_other_failure(duel_engine):
    assert duel_engine.check_one_within_the_other("testamento", "xyz") is False