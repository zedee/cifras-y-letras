const API_BASE = "http://localhost:8000";

// Game State
const state = {
    score: 0,
    powerPoints: 0,
    currentRound: 0,
    timer: 0,
    timerInterval: null,
    isLoading: false,
    currentData: null // Added to store the current round's data
};

// DOM Elements
const scoreEl = document.getElementById('score');
const powerPointsEl = document.getElementById('power-points');
const timerEl = document.getElementById('timer');
const roundTitleEl = document.getElementById('round-title');
const roundDescriptionEl = document.getElementById('round-description');
const contentAreaEl = document.getElementById('content-area');
const userInputEl = document.getElementById('user-input');
const inputHintEl = document.getElementById('input-hint');
const actionBtn = document.getElementById('action-btn');
const startBtn = document.getElementById('start-game-btn');

function updateUI() {
    scoreEl.innerText = state.score;
    powerPointsEl.innerText = state.powerPoints;
    timerEl.innerText = `00:${state.timer.toString().padStart(2, '0')}`;
}

async function fetchScore() {
    try {
        const response = await fetch(`${API_BASE}/score`);
        const data = await response.json();
        state.score = data.main_score;
        state.powerPoints = data.power_points;
        updateUI();
    } catch (e) { console.error("Error fetching score"); }
}

async function startGame() {
    // Reset State
    roundDescriptionEl.innerText = "Presiona 'Empezar' para comenzar.";
    state.currentRound = 1;
    state.timer = 40;
    state.isLoading = true;
    state.currentData = null; // Clear previous data
    
    actionBtn.disabled = true;
    contentAreaEl.innerHTML = `<div class="loading-spinner">Calculando primera ronda...</div>`;
    
    // Start Timer
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.timer--;
        updateUI();
        if (state.timer <= 0) {
            clearInterval(state.timerInterval);
            alert("¡Tiempo agotado!");
            actionBtn.disabled = false;
        }
    }, 1000);

    try {
        if (state.currentRound % 2 !== 0) {
            // Number Round
            const response = await fetch(`${API_BASE}/start-numbers`);
            const data = await response.json();
            
            // FIX: Save data so submitAnswer can use it
            state.currentData = data;
            
            roundTitleEl.innerText = "Round " + state.currentRound + ": Números";
            roundDescriptionEl.innerText = "Logra el número objetivo con las cifras dadas.";
            inputHintEl.innerText = "Introduce el resultado final (ej: 150)";
            
            contentAreaEl.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 1rem;">${data.numbers.join(' | ')}</div>
                <div style="color: #007bff;">Objetivo: ${data.target}</div>
                <div style="font-size: 0.8rem; margin-top: 1rem; color: #666;">
                    Mejor posible: ${data.best_val} (${data.best_path.join(' ')})
                </div>
            `;
        } else {
            // Letter Round
            const response = await fetch(`${API_BASE}/start-letters?vowel_count=3`);
            const data = await response.json();
            
            // FIX: Save letters so submitAnswer can use them
            state.currentData = data;
            
            roundTitleEl.innerText = "Round " + state.currentRound + ": Letras";
            roundDescriptionEl.innerText = "Forma la palabra más larga con estas letras.";
            inputHintEl.innerText = "Escribe la palabra más larga que puedas formar.";
            
            contentAreaEl.innerText = data.letters.join(' ');
        }
    } catch (e) {
        contentAreaEl.innerText = "Error al cargar la ronda. Reintenta.";
    } finally {
        state.isLoading = false;
        actionBtn.disabled = false;
        userInputEl.disabled = false;
        userInputEl.focus();
    }
}

async function submitAnswer() {
    const userValue = userInputEl.value.trim();
    if (!userValue) return;

    actionBtn.disabled = true;
    contentAreaEl.innerHTML = `<div class="loading-spinner">Enviando respuesta...</div>`;

    try {
        if (state.currentRound % 2 !== 0) {
            // Submit Numbers
            const response = await fetch(`${API_BASE}/submit-numbers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_value: parseInt(userValue),
                    best_val: state.currentData?.best_val 
                })
            });
            const scoreData = await response.json();
            state.score = scoreData.main_score;
            updateUI();
        } else {
            // Submit Letters
            const response = await fetch(`${API_BASE}/submit-letters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    word: userValue,
                    letters: state.currentData?.letters
                })
            });
            const scoreData = await response.json();
            state.score = scoreData.main_score;
            updateUI();
        }

        userInputEl.value = "";
        state.currentRound++;
        
        if (state.currentRound > 6) {
            alert("¡Juego Terminado!");
            location.reload();
        } else {
            roundTitleEl.innerText = "Round " + state.currentRound;
            contentAreaEl.innerText = "Cargando siguiente ronda...";
            setTimeout(() => {
                startGame(); 
            }, 1000);
        }
    } catch (e) {
        console.error(e);
        contentAreaEl.innerText = "Error al enviar respuesta.";
    } finally {
        actionBtn.disabled = false;
    }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
actionBtn.addEventListener('click', submitAnswer);

// Initial Score Fetch
fetchScore();