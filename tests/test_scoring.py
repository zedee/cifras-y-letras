import pytest
from Apiservice.engine.scoring import ScoreManager

def test_scoring_progression():
    sm = ScoreManager()
    
    # Number Round: Exact
    sm.add_number_round_score(is_exact=True, is_best_approx=False)
    assert sm.score == 10
    
    # Letter Round: 8 letters
    sm.add_letter_round_score(word_length=8)
    assert sm.score == 18
    
    # Duel: Correct
    sm.add_duel_score(is_correct=True)
    assert sm.score == 28
    
    # Endgame: Correct
    sm.reset_for_endgame()
    sm.add_endgame_score(is_correct=True)
    assert sm.power_points == 100