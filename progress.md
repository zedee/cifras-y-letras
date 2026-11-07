# Project: Cifras y Letras Engine

## Phase 1: Foundation & Data
- [ ] **Milestone 1: Project Infrastructure**
    - [x] Set up project structure.
    - [x] Initialize virtual environment (venv).
    - [x] Configure Dockerfile and docker-compose.yml.
    - [x] Establish basic API structure (FastAPI/Flask).
- [ ] **Milestone 2: The Dictionary Engine**
    - [x] Parse `data/diccionario_es.txt`.
    - [x] Implement SQLite database for word storage.
    - [x] Handle "comma" logic (e.g., "cinemático, ca").
    - [x] Implement search logic (checking validity based on letters).

## Phase 2: Sub-Engines (Game Logic)
- [ ] **Milestone 3: Number Round Engine**
    - [ ] Logic to generate weighted random numbers.
    - [ ] Implement solver for valid arithmetic expressions (integer-only rule).
    - [ ] Implement "Best Approximation" scoring.
- [ ] **Milestone 4: Letter Round Engine**
    - [ ] Vowel/consonant selection logic.
    - [ ] Word-finding algorithm (longest word from letters).
    - [ ] "Show possibilities" feature.

## Phase 3: Advanced Rounds & Scoring
- [ ] **Milestone 5: Duel & Endgame Engines**
    - [ ] Duel types (Classic, One within the other, Spelling, Mental Arithmetic).
    - [ ] Endgame logic (8 selections, topic filtering, difficulty).
- [ ] **Milestone 6: Scoring System**
    - [ ] Unified scoring module (Numbers, Letters, Duels, Power Points).

## Phase 4: Frontend & Integration
- [ ] **Milestone 7: Solo Mode Frontend**
    - [ ] Build HTML/CSS/JS interface.
    - [ ] Connect frontend to Python backend.
    - [ ] Implement timers.
- [ ] **Milestone 8: Polishing & Documentation**
    - [ ] Final testing and Docker deployment.