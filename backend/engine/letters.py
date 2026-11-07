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
        # Count available letters: e.g., {'A': 2, 'B': 1...}
        letter_pool = {}
        for char in available_letters:
            letter_pool[char] = letter_pool.get(char, 0) + 1

        longest_word = None
        max_length = 0

        conn = self._get_db_connection()
        cursor = conn.cursor()

        # We fetch words from the DB. 
        # Note: In a real production environment with a huge DB, 
        # we'd want to optimize this query or use a Trie structure.
        cursor.execute("SELECT word FROM words")
        rows = cursor.fetchall()
        conn.close()

        for (word,) in rows:
            # Normalize word for comparison (remove accents/lowercase)
            # For now, we'll do a simple check.
            word_clean = word.lower()
            
            # Check if word can be formed
            word_letter_count = {}
            possible = True
            
            for char in word_clean:
                if char in letter_pool:
                    word_letter_count[char] = word_letter_count.get(char, 0) + 1
                    if word_letter_count[char] > letter_pool.get(char.upper(), 0):
                        possible = False
                        break
                else:
                    # Handle cases where the word has letters not in our 10-letter set
                    possible = False
                    break
            
            if possible:
                if len(word_clean) > max_length:
                    max_length = len(word_clean)
                    longest_word = word
        
        return longest_word, max_length

# Example Usage for testing:
if __name__ == "__main__":
    engine = LetterEngine()
    
    # Test 1: Generate letters
    v_count = 3
    letters = engine.generate_letters(v_count)
    print(f"Generated Letters: {letters}")
    
    # Test 2: Find longest word
    # Let's mock some letters that should form "CASA"
    mock_letters = list("CASAR") 
    word, length = engine.find_longest_word(mock_letters)
    print(f"Longest word for {mock_letters}: {word} (Length: {length})")