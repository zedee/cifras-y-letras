from fastapi import FastAPI
from backend.engine.scoring import ScoreManager
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Cifras y Letras API")

# Enable CORS so our frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, we'll restrict this
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global score manager for solo mode (simulated session)
# In a real multiplayer app, this would be a database or a session cache
game_state = {
    "score_manager": ScoreManager(),
    "current_round": 1,
    "numbers": [],
    "letters": []
}

@app.get("/")
def read_root():
    return {"message": "Cifras y Letras API is running"}

@app.get("/score")
def get_score():
    return game_state["score_manager"].get_current_scores()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)