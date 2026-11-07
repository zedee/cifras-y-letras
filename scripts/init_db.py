import sqlite3
import os

def init_db():
    db_path = 'data/game_dictionary.db'
    dict_path = 'data/diccionario_es.txt'

    if not os.path.exists(dict_path):
        print(f"Error: {dict_path} not found. Please place the file in the data/ folder.")
        return

    # Ensure data directory exists for the DB
    if not os.path.exists('data'):
        os.makedirs('data')

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table
    # We store the 'base' word and a flag for the comma logic
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT UNIQUE,
            gender_variant TEXT
        )
    ''')

    print("Processing dictionary... this may take a moment.")
    
    with open(dict_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            # Handle the "cinemático, ca" case
            if ',' in line:
                parts = line.split(',')
                main_word = parts[0].strip()
                variant_info = parts[1].strip()
                
                # Insert both versions (e.g., "cinemático" and "cinemática")
                # We'll simplify by inserting the main word and the variant
                # A more complex logic can be added if needed later
                cursor.execute('INSERT OR IGNORE INTO words (word, gender_variant) VALUES (?, ?)', 
                               (main_word, variant_info))
                
                # Logic for variant: if "ca", we append 'a' to the main word
                if variant_info.lower() == 'ca':
                    variant_word = main_word[:-1] + 'a'
                    cursor.execute('INSERT OR IGNORE INTO words (word, gender_variant) VALUES (?, ?)', 
                                   (variant_word, "variant"))
            else:
                cursor.execute('INSERT OR IGNORE INTO words (word, gender_variant) VALUES (?, ?)', 
                               (line, None))

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {db_path}")

if __name__ == "__main__":
    init_db()