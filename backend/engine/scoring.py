from typing import Dict, Any

class ScoreManager:
    def __init__(self):
        self.score = 0
        self.power_points = 0  # Specifically for the endgame

    def add_number_round_score(self, is_exact: bool, is_best_approx: bool) -> int:
        """
        Scores for the Number Round.
        - Exact: 10 points
        - Best Approx (if no exact): 7 points
        """
        if is_exact:
            self.score += 10
        elif is_best_approx:
            self.score += 7
        return self.score

    def add_letter_round_score(self, word_length: int) -> int:
        """
        Scores for the Letter Round.
        - 1 point per letter of the longest word.
        """
        self.score += word_length
        return self.score

    def add_duel_score(self, is_correct: bool) -> int:
        """
        Scores for the Duel Round.
        - Correct: 10 points
        - Incorrect: 0 points (opponent gets 3, but there is no opponent in solo)
        """
        if is_correct:
            self.score += 10
        return self.score

    def add_endgame_score(self, is_correct: bool) -> int:
        """
        Scores for the Endgame.
        - Correct: 100 Power Points
        - This is a separate score from the previous rounds.
        """
        if is_correct:
            self.power_points += 100
        return self.power_points

    def reset_for_endgame(self):
        """Resets the power points for a new game session."""
        self.power_points = 0

        return self.power_points

    def reset_score(self):
        """Resets the all points for a new game session."""
        self.score = 0
        self.power_points = 0

        return {
            "main_score": self.score,
            "power_points": self.power_points
        }

    def get_current_scores(self) -> Dict[str, int]:
        return {
            "main_score": self.score,
            "power_points": self.power_points
        }