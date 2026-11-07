import sqlite3
import random
import string
from typing import List, Tuple, Optional

class LetterEngine:
    def __init__(self, db_path: str = 'data/game_dictionary.db'):
        self.db_path = db_path

    def _get_db_connection(self):
        return sqlite3.connect(self.db_path)

    def generate_letters(self, vowel_count: int) -> List[str]:
        """
        Generates 10 letters based on the number of vowels requested.
        """
        vowels = "AEIOUaeiou"
        consonants = "".join([c for c in string.ascii_letters if c not in vowels])
        
        letters = []
        for _ in range(vowel_count):
            letters.append(random.choice(vowels).upper())
        for _ in range(10 - vowel_count):
            letters.append(random.choice(consonants).upper())
        
        return letters

    def find_longest_word(self, available_letters: List[str]) -> Tuple[Optional[str], int]:
        """
        Finds the longest valid word from the dictionary that can be 
        formed using the available letters.
        """
        # Count available letters (ensure keys are uppercase for consistency)
        letter_pool = {}
        for char in available_letters:
            upper_char = char.upper()
            letter_pool[upper_char] = letter_pool.get(upper_char, 0) + 1

        longest_word = None
        max_length = 0

        conn = self._get_db_connection()
        cursor = conn.cursor()

        # We fetch words from the DB. 
        cursor.execute("SELECT word FROM words")
        rows = cursor.fetchall()
        conn.close()

        for (word,) in rows:
            word_clean = word.lower()
            possible = True
            current_word_counts = {}
            
            for char in word_clean:
                upper_char = char.upper()
                current_word_counts[upper_char] = current_word_counts.get(upper_char, 0) + 1
                
                # Check if we've exceeded the available count for this letter
                if current_word_counts[upper_char] > letter_pool.get(upper_char, 0):
                    possible = False
                    break
            
            if possible:
                if len(word_clean) > max_length:
                    max_length = len(word_clean)
                    longest_word = word
        
        return longest_word, max_length

    def validate_word(self, word: str, available_letters: List[str]) -> bool:
        """
        Checks if a word is valid:
        1. Exists in the dictionary (or is a prefix before a comma).
        2. Can be formed using the available letters.
        """
        word = word.lower()
        
        # Check if in dictionary or if it's a prefix before a comma
        conn = self._get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{word}%",))
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return False

        is_valid_entry = False
        for (row_word,) in rows:
            row_word_lower = row_word.lower()
            if row_word_lower == word:
                is_valid_entry = True
                break
            if "," in row_word and row_word_lower.split(",")[0] == word:
                is_valid_entry = True
                break
        
        if not is_valid_entry:
            return False
            
        letter_pool = {}
        for char in available_letters:
            upper_char = char.upper()
            letter_pool[upper_char] = letter_pool.get(upper_char, 0) + 1

        current_word_counts = {}
        for char in word:
            upper_char = char.upper()
            current_word_counts[upper_char] = current_word_counts.get(upper_char, 0) + 1
            if current_word_counts[upper_char] > letter_pool.get(upper_char, 0):
                return False
        
        return True