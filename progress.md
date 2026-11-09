# Project: Cifras y Letras Engine

## Phase 1: Foundation & Data
- [x] **Milestone 1: Project Infrastructure**
    - [x] Set up project structure.
    - [x] Initialize virtual environment (venv).
    - [x] Configure Dockerfile and docker-compose.yml.
    - [x] Establish basic API structure (FastAPI/Flask).
- [x] **Milestone 2: The Dictionary Engine**
    - [x] Parse `data/diccionario_es.txt`.
    - [x] Implement SQLite database for word storage.
    - [x] Handle "comma" logic (e.g., "cinemático, ca").
    - [x] Implement search logic (checking validity based on letters).

## Phase 2: Sub-Engines (Game Logic)
- [x] **Milestone 3: Number Round Engine**
    - [x] Logic to generate weighted random numbers.
    - [x] Implement solver for valid arithmetic expressions (integer-only rule).
    - [x] Implement "Best Approximation" scoring.
- [x] **Milestone 4: Letter Round Engine**
    - [x] Vowel/consonant selection logic.
    - [x] Word-finding algorithm (longest word from letters).
    - [] "Show possibilities" feature.
    - [x] Refined vowel weighting based on Spanish frequency.
    - [x] Plural validation logic (Stem normalization: stripping 's' and 'es').
    - [] Irregular plural validation logic.
    - [] Check word is verb & verb conjugation check.
- [x] **Milestone 4.1: Practice Mode**
    - [x] Practice mode toggle (disables timers and round limits).
    - [x] Round type selection (Numbers only, Letters only, Mixed).

## Phase 3: Advanced Rounds & Scoring
- [] **Milestone 5: Duel & Endgame Engines**
    - [] Duel types (Classic, One within the other, Spelling, Mental Arithmetic)
    - [] Endgame logic (8 selections, topic filtering, difficulty)
- [] **Milestone 6: Scoring System**
    - [] Unified scoring module (Numbers, Letters, Duels, Power Points)

## Phase 4: Frontend & Integration
- [x] **Milestone 7: Solo Mode Frontend**
    - [x] Build HTML/CSS/JS interface.
    - [x] Establish API connection.
    - [x] Connect frontend to Python Apiservice.
    - [x] Implement timers (though disabled by now).
    - [x] Implement auto-fill and anti-cheat for numbers round.
    - [x] Implement feedback system and transition delay.
    - [x] Hide/Show controls for the start screen.
- [ ] **Milestone 8: Polishing & Documentation**
    - [ ] Style and layout refinements (spacing, element arrangement).
    - [ ] Fine-tune feedback messages for specific round outcomes.
    - [ ] Final testing and Docker deployment.