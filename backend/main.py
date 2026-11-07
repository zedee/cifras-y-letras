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
    is_exact = data.get("user_value") == data.get("best_val")
    game_state["score_manager"].add_number_round_score(is_exact, False)
    return game_state["score_manager"].get_current_scores()

@app.post("/submit-letters")
def submit_letters(data: dict):
    word = data.get("word", "").lower()
    # For the first iteration, we'll assume any word > 4 letters is correct.
    # We can add the complex validation logic from LetterEngine here later.
    is_correct = len(word) >= 4
    
    # Add score (1 point per letter if correct)
    game_state["score_manager"].add_letter_round_score(len(word) if is_correct else 0)
    return game_state["score_manager"].get_current_scores()

# --- STATIC FILES ---
# We mount the frontend folder to the root path.
app.mount("/", StaticFiles(directory="frontend"), name="frontend")