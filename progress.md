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
    - [x] "Show possibilities" feature.

## Phase 3: Advanced Rounds & Scoring
- [x] **Milestone 5: Duel & Endgame Engines**
    - [x] Duel types (Classic, One within the other, Spelling, Mental Arithmetic)
    - [x] Endgame logic (8 selections, topic filtering, difficulty)
- [x] **Milestone 6: Scoring System**
    - [x] Unified scoring module (Numbers, Letters, Duels, Power Points)

## Phase 4: Frontend & Integration
- [ ] **Milestone 7: Solo Mode Frontend**
    - [ ] Build HTML/CSS/JS interface.
    - [x] Establish API connection (FastAPI structure).
    - [ ] Connect frontend to Python Apiservice.
    - [ ] Implement timers.
- [ ] **Milestone 8: Polishing & Documentation**
    - [ ] Final testing and Docker deployment.