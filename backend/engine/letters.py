import sqlite3
import random
from typing import List, Tuple, Optional

class LetterEngine:
    def __init__(self, db_path: str = 'data/game_dictionary.db'):
        self.db_path = db_path

    def _get_db_connection(self):
        return sqlite3.connect(self.db_path)

    def generate_letters(self, vowel_count: int) -> List[str]:
        """
        Generates a set of letters based on the number of vowels requested 
        using weighted distribution for Spanish frequency.
        """
        # Vowel weights based on specific percentages provided:
        # A(12.53), E(13.68), I(6.25), O(8.68), U(3.93)
        vowel_options = ['A', 'E', 'I', 'O', 'U']
        vowel_weights = [12.53, 13.68, 6.25, 8.68, 3.93]

        # Selection of vowels based on weights
        selected_vowels = random.choices(vowel_options, weights=vowel_weights, k=vowel_count)
        
        # Define consonant weights (high, medium, low frequency)
        consonant_data = [
            ('S', 10), ('R', 10), ('N', 10), ('D', 10), ('L', 10), ('C', 10), # High
            ('T', 5), ('M', 5), ('P', 5), ('G', 5), ('B', 5), ('F', 5), ('V', 5), ('H', 5), # Med
            ('J', 1), ('Q', 1), ('X', 1), ('Z', 1), ('K', 1), ('W', 1), ('Ñ', 1) # Low
        ]
        
        # Calculate a balanced number of consonants. 
        # A common ratio for Spanish is roughly 1.6 consonants for every vowel.
        consonant_count = int(vowel_count * 1.6)
        # Ensure at least some consonants are provided
        consonant_count = max(consonant_count, 4)

        population_consonants = []
        for char, weight in consonant_data:
            population_consonants.extend([char] * weight)

        selected_consonants = random.sample(population_consonants, consonant_count)

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
        2. Exists in the dictionary OR its singular stem exists.
        3. Can be formed using the available letters.
        """
        word = word.lower().strip()
        
        if len(word) < 5:
            return False
            
        conn = self._get_db_connection()
        cursor = conn.cursor()
        
        # Check 1: Is the word exactly in the dictionary?
        cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{word}%",))
        rows = cursor.fetchall()
        
        is_valid_entry = False
        for (row_word,) in rows:
            row_word_lower = row_word.lower()
            # Check exact match
            if row_word_lower == word:
                is_valid_entry = True
                break
            # Check comma logic (e.g. "cinemático, ca")
            if "," in row_word and row_word_lower.split(",")[0] == word:
                is_valid_entry = True
                break
        
        conn.close()

        # Check 2: If not found, is it a plural of a word in the dictionary?
        if not is_valid_entry:
            # Try stripping 's'
            if word.endswith('s'):
                base_s = word[:-1]
                cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_s}%",))
                if cursor.fetchone():
                    is_valid_entry = True
                else:
                    cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_s}%",))
                    # Double check if it was a comma-separated entry
                    for (r_word,) in cursor.fetchall():
                        if r_word.lower().split(",")[0] == base_s:
                            is_valid_entry = True
                            break
            
            # If still not found, try stripping 'es'
            if not is_valid_entry and word.endswith('es'):
                base_es = word[:-2]
                cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_es}%",))
                if cursor.fetchone():
                    is_valid_entry = True
                else:
                    cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_es}%",))
                    for (r_word,) in cursor.fetchall():
                        if r_word.lower().split(",")[0] == base_es:
                            is_valid_entry = True
                            break
            conn.close()

        if not is_valid_entry:
            return False
            
        # Check 3: Letter Pool verification
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