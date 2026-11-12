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
        The total number of letters (vowels + consonants) will always be 10.
        """
        # Vowel weights based on provided Spanish frequency percentages:
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
        
        # Calculate the number of consonants needed to reach exactly 10 letters
        consonant_count = 10 - vowel_count

        population_consonants = []
        for char, weight in consonant_data:
            population_consonants.extend([char] * weight)

        # Select the required number of consonants
        selected_consonants = random.sample(population_consonants, consonant_count)

        # Combine and shuffle to ensure interleaving
        letters = selected_vowels + selected_consonants
        random.shuffle(letters)
        
        return letters

    def find_longest_word(self, available_letters: List[str]) -> Tuple[Optional[str], int]:
        """
        Finds the longest valid word from the dictionary (between 5 and 10 letters)
        that can be formed using the available letters.
        """
        letter_pool = {}
        for char in available_letters:
            upper_char = char.upper()
            letter_pool[upper_char] = letter_pool.get(upper_char, 0) + 1

        longest_word = None
        max_length = 0

        conn = self._get_db_connection()
        cursor = conn.cursor()
        # Optimization: Only fetch words within the valid game range
        cursor.execute("SELECT word FROM words WHERE length(word) BETWEEN 5 AND 10")
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

    def get_suggested_words(self, available_letters: List[str]) -> List[str]:
        """
        Returns a list of words of different lengths (10, 9, 8, 7, 6) 
        that can be formed with the available letters.
        Returns the first match found for each length.
        """
        conn = self._get_db_connection()
        cursor = conn.cursor()
        # Fetch all words in the relevant range
        cursor.execute("SELECT word FROM words WHERE length(word) BETWEEN 6 AND 10")
        rows = cursor.fetchall()
        conn.close()

        suggested_words = []
        target_lengths = [10, 9, 8, 7, 6]
        found_lengths = set()

        for (word,) in rows:
            word_clean = word.lower()
            length = len(word_clean)
            
            if length in target_lengths and length not in found_lengths:
                if self._check_letter_pool(word_clean, available_letters):
                    suggested_words.append(word)
                    found_lengths.add(length)
                    # Stop if we found one for every requested length
                    if len(suggested_words) == len(target_lengths):
                        break
        
        return suggested_words

    def validate_word(self, word: str, available_letters: List[str]) -> bool:
        """
        Checks if a word is valid:
        1. Minimum length of 5.
        2. Exists in the dictionary OR its singular stem exists.
        3. Can be formed using the available letters.
        Includes robust handling for Spanish plurals (s, es, y->i transition) 
        and specific linguistic exceptions.
        """
        word = word.lower().strip()
        
        if len(word) < 5:
            return False
            
        conn = self._get_db_connection()
        cursor = conn.cursor()
        
        # 1. Exact match (Dictionary check)
        is_valid_entry = False
        cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{word}%",))
        for (row_word,) in cursor.fetchall():
            row_word_lower = row_word.lower()
            if row_word_lower == word or ("," in row_word and row_word_lower.split(",")[0] == word):
                is_valid_entry = True
                break
        
        if is_valid_entry:
            conn.close()
            # Skip to letter pool check
            return self._check_letter_pool(word, available_letters)

        # 2. Irregular Plurals & Exceptions (from RAE analysis)
        irregular_plurals = {
            "pies": "pie",
            "doses": "dos",
            "treses": "tres",
            "seises": "seis",
            "dieces": "diez",
            "noes": "no",
            "síes": "sí",
            "yoes": "yo",
            "cus": "q",
            "kas": "k",
            "mambises": "mambí",
            "faralaes": "faralá",
            "albalaes": "albalá",
            "gurises": "gurí",
            "lápices": "lápiz",
            "luces": "luz",
            "especímenes": "espécimen",
            "regímenes": "régimen"
        }
        
        base_irreg = irregular_plurals.get(word)
        if base_irreg:
            cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_irreg}%",))
            for (r_word,) in cursor.fetchall():
                r_word_lower = r_word.lower()
                if r_word_lower == base_irreg or ("," in r_word and r_word_lower.split(",")[0] == base_irreg):
                    is_valid_entry = True
                    break

        # 3. "y -> i" Transition (e.g., "gais" -> "gay", "espráis" -> "espray")
        if not is_valid_entry and word.endswith('is'):
            # Check if removing 'is' and adding 'y' makes a valid word
            base_is = word[:-2]
            if base_is.endswith('y'):
                candidate = base_is + 'y'
                cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{candidate}%",))
                if cursor.fetchone():
                    is_valid_entry = True

        # 4. General Plural Stripping (-es and -s)
        if not is_valid_entry:
            # Check -es first
            if word.endswith('es'):
                base_es = word[:-2]
                cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_es}%",))
                for (r_word,) in cursor.fetchall():
                    r_word_lower = r_word.lower()
                    if r_word_lower == base_es or ("," in r_word and r_word_lower.split(",")[0] == base_es):
                        is_valid_entry = True
                        break
            
            # Check -s
            if not is_valid_entry and word.endswith('s'):
                base_s = word[:-1]
                cursor.execute("SELECT word FROM words WHERE word LIKE ?", (f"{base_s}%",))
                for (r_word,) in cursor.fetchall():
                    r_word_lower = r_word.lower()
                    if r_word_lower == base_s or ("," in r_word and r_word_lower.split(",")[0] == base_s):
                        is_valid_entry = True
                        break
        
        conn.close()

        if not is_valid_entry:
            return False
            
        # 5. Final Letter Pool Verification
        return self._check_letter_pool(word, available_letters)

    def _check_letter_pool(self, word: str, available_letters: List[str]) -> bool:
        """Helper method to verify if word can be formed with available letters."""
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