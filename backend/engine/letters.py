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
        Generates 10 letters based on the number of vowels requested 
        using weighted distribution for Spanish frequency.
        """
        # Weights based on Spanish frequency
        # High freq consonants
        high_freq = [('S', 10), ('R', 10), ('N', 10), ('D', 10), ('L', 10), ('C', 10)]
        # Medium freq consonants
        med_freq = [('T', 5), ('M', 5), ('P', 5), ('G', 5), ('B', 5), ('F', 5), ('V', 5), ('H', 5)]
        # Low freq consonants
        low_freq = [('J', 1), ('Q', 1), ('X', 1), ('Z', 1), ('K', 1), ('W', 1), ('Ñ', 1)]
        # Vowels
        vowels_pool = [('A', 8), ('E', 8), ('I', 8), ('O', 8), ('U', 8)]

        population_vowels = []
        for char, weight in vowels_pool:
            population_vowels.extend([char] * weight)
        
        population_consonants = []
        for char, weight in high_freq + med_freq + low_freq:
            population_consonants.extend([char] * weight)

        # Pick the counts
        selected_vowels = random.sample(population_vowels, vowel_count)
        selected_consonants = random.sample(population_consonants, 10 - vowel_count)

        # Combine and shuffle to ensure interleaving
        letters = selected_vowels + selected_consonants
        random.shuffle(letters)
        
        return letters

    def find_longest_word(self, available_letters: List[str]) -> Tuple[Optional[str], int]:
        """
        Finds the longest valid word from the dictionary that can be 
        formed using the available letters.
        """
        letter_pool = {}
        for char in available_letters:
            upper_char = char.upper()
            letter_pool[upper_char] = letter_pool.get(upper_char, 0) + 1

        longest_word = None
        max_length = 0

        conn = self._get_db_connection()
        cursor = conn.cursor()
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
        1. Minimum length of 5.
        2. Exists in the dictionary (or is a prefix before a comma).
        3. Can be formed using the available letters.
        """
        word = word.lower()
        
        if len(word) < 5:
            return False
            
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