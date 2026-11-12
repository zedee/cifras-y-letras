from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import random

# Import our engines
from backend.engine.numbers import NumberEngine
from backend.engine.letters import LetterEngine
from backend.engine.scoring import ScoreManager

app = FastAPI(title="Cifras y Letras API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
num_engine = NumberEngine()
let_engine = LetterEngine()
game_state = {
    "score_manager": ScoreManager(),
    "current_round": 0,
    "active_data": {}
}

# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    # This serves the index.html file
    return FileResponse("frontend/index.html")

@app.get("/score")
def get_score():
    return game_state["score_manager"].get_current_scores()

@app.get("/start-numbers")
def start_numbers():
    numbers = num_engine.generate_numbers()
    target = random.randint(101, 999)
    # Re-enabled solve with the optimized engine
    best_val, best_path = num_engine.solve(numbers, target)
    return {
        "numbers": numbers,
        "target": target,
        "best_val": best_val,
        "best_path": best_path
    }

@app.get("/start-letters")
def start_letters(vowel_count: int = 3):
    letters = let_engine.generate_letters(vowel_count)
    return {
        "letters": letters
    }

@app.post("/submit-numbers")
def submit_numbers(data: dict):
    user_value = data.get("user_value")
    target = data.get("target")
    best_val = data.get("best_val")
    
    is_exact = (user_value == target)
    # Best approximation is when they don't hit the target but hit the engine's best possible value
    is_best_approx = (user_value == best_val and user_value != target)
    
    game_state["score_manager"].add_number_round_score(is_exact, is_best_approx)
    return game_state["score_manager"].get_current_scores()

@app.post("/submit-letters")
def submit_letters(data: dict):
    word = data.get("word", "").lower()
    letters = data.get("letters", [])
    
    is_valid = let_engine.validate_word(word, letters)
    
    # Always get suggestions regardless of whether the word is valid
    suggestions = let_engine.get_suggested_words(letters)
    
    # Add score (1 point per letter if valid, otherwise 0)
    score_to_add = len(word) if is_valid else 0
    game_state["score_manager"].add_letter_round_score(score_to_add)
    
    scores = game_state["score_manager"].get_current_scores()
    return {
        **scores,
        "suggestions": suggestions
    }

@app.get("/reset-score")
def reset_score():
    return game_state["score_manager"].reset_score()

# --- STATIC FILES ---
# We mount the frontend folder to the root path.
app.mount("/", StaticFiles(directory="frontend"), name="frontend")