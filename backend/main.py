from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

# Import our engines
from backend.engine.numbers import NumberEngine
from backend.engine.letters import LetterEngine
from backend.engine.scoring import ScoreManager

app = FastAPI(title="Cifras y Letras API")

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

# Data models for requests
class LetterRequest(BaseModel):
    vowel_count: int

@app.get("/")
def read_root():
    return {"message": "Cifras y Letras API is running"}

@app.get("/score")
def get_score():
    return game_state["score_manager"].get_current_scores()

@app.get("/start-numbers")
def start_numbers():
    # Generate 6 numbers and a random target
    numbers = num_engine.generate_numbers()
    target = random.randint(101, 999)
    
    # For now, we store the result of the solver in the response
    # This helps the frontend know the "best" result immediately
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
    # Logic to check if user's number matches best_val
    # and update the ScoreManager
    is_exact = data.get("user_value") == data.get("best_val")
    # Note: In solo mode, we'll simplify the 'best approximation' 
    # check for now and just reward exact matches.
    game_state["score_manager"].add_number_round_score(is_exact, False)
    return game_state["score_manager"].get_current_scores()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)