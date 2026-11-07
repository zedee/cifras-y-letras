import random
import sqlite3
from typing import List, Tuple, Optional

class EndgameEngine:
    def __init__(self, db_path: str = 'data/game_dictionary.db'):
        self.db_path = db_path

    def _get_db_connection(self):
        return sqlite3.connect(self.db_path)

    def validate_endgame_word(self, selection: str, user_word: str) -> bool:
        """
        Validates if the user's word is valid for the given selection.
        1. Word must be in the dictionary.
        2. Word must be 7-10 letters long.
        3. Word must be formable using letters from the 12-letter selection.
        """
        if len(user_word) < 7 or len(user_word) > 10:
            return False

        # Check dictionary
        conn = self._get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT word FROM words WHERE word = ?", (user_word,))
        exists = cursor.fetchone()
        conn.close()
        
        if not exists:
            return False

        # Check letter pool
        selection_pool = {}
        for char in selection.lower():
            selection_pool[char] = selection_pool.get(char, 0) + 1

        user_word_lower = user_word.lower()
        user_counts = {}
        for char in user_word_lower:
            user_counts[char] = user_counts.get(char, 0) + 1
            if user_counts[char] > selection_pool.get(char, 0):
                return False

        return True

    def generate_endgame_round(self, topic_words: List[str]) -> List[dict]:
        """
        Generates 8 selections for the endgame based on a list of topic words.
        Each selection contains one word from the topic_words list.
        """
        # Sort words by length to help with difficulty distribution
        # For now, we'll just pick 8 unique words from the topic list
        if len(topic_words) < 8:
            raise ValueError("Topic must have at least 8 words.")
        
        selected_words = random.sample(topic_words, 8)
        selections = []

        for word in selected_words:
            # Create a 12-letter selection
            # Start with the letters of the target word
            base_letters = list(word.lower())
            
            # Fill the remaining (12 - len(word)) slots with random letters
            # To ensure it's solvable, we'd usually pick from the dictionary,
            # but the prompt says "random letters that are not part of the word".
            import string
            while len(base_letters) < 12:
                base_letters.append(random.choice(string.ascii_lowercase))
            
            # Scramble the 12 letters
            random.shuffle(base_letters)
            
            selections.append({
                "selection": "".join(base_letters),
                "target_word": word,
                "is_correct": False
            })

        return selections