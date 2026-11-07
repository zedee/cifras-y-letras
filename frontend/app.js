const API_BASE = "http://localhost:8000";

// Game State
const state = {
    score: 0,
    powerPoints: 0,
    currentRound: 0,
    timer: 0,
    timerInterval: null,
    isLoading: false,
    isPaused: false, // Pause feature
    currentData: null // Stores the current round's data (numbers, target, best_val, letters, etc.)
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
const pauseBtn = document.getElementById('pause-btn');

function updateUI() {
    scoreEl.innerText = state.score;
    powerPointsEl.innerText = state.powerPoints;
    // Format timer as MM:SS
    const minutes = Math.floor(state.timer / 60);
    const seconds = state.timer % 60;
    timerEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Toggle the paused class on the container
    if (state.isPaused) {
        document.getElementById('game-container').classList.add('paused');
        pauseBtn.innerText = "Reanudar";
    } else {
        document.getElementById('game-container').classList.remove('paused');
        pauseBtn.innerText = "Pausa";
    }
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
    // Only initialize Round 1 if we are starting fresh (currentRound is 0)
    if (state.currentRound === 0) {
        state.currentRound = 1;
        state.timer = 40;
        state.isPaused = false; 
        // Note: We don't reset the timer to 40 if we are continuing from a previous round
        // unless you want the timer to reset every round. 
        // If you want a fresh timer every round, move state.timer = 40 here.
    }

    roundDescriptionEl.innerText = "Cargando...";
    state.isLoading = true;
    state.currentData = null; 
    
    actionBtn.disabled = true;
    userInputEl.disabled = true;
    contentAreaEl.innerHTML = `<div class="loading-spinner">Calculando ronda...</div>`;
    
    // Start Timer
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        if (!state.isPaused) {
            state.timer--;
            updateUI();
            if (state.timer <= 0) {
                clearInterval(state.timerInterval);
                alert("¡Tiempo agotado!");
                actionBtn.disabled = false;
                userInputEl.disabled = false;
            }
        }
    }, 1000);

    try {
        if (state.currentRound % 2 !== 0) {
            // Number Round
            const response = await fetch(`${API_BASE}/start-numbers`);
            const data = await response.json();
            
            state.currentData = data;
            
            roundTitleEl.innerText = "Ronda " + state.currentRound + ": Números";
            roundDescriptionEl.innerText = "Logra el número objetivo con las cifras dadas.";
            inputHintEl.innerText = "Introduce el número más cercano posible al objetivo.";
            
            contentAreaEl.innerHTML = `
                <div style="font-size: 2.5rem; margin-bottom: 1rem; color: #333;">${data.numbers.join(' | ')}</div>
                <div style="font-size: 1.5rem; color: #007bff; margin-bottom: 1rem;">Objetivo: ${data.target}</div>
                <div style="font-size: 0.9rem; color: #666; background: #eee; padding: 10px; border-radius: 5px;">
                    Mejor posible: ${data.best_val} <br>
                    <small>(${data.best_path.join(' + ')})</small>
                </div>
            `;
        } else {
            // Letter Round
            const response = await fetch(`${API_BASE}/start-letters?vowel_count=3`);
            const data = await response.json();
            
            state.currentData = data;
            
            roundTitleEl.innerText = "Ronda " + state.currentRound + ": Letras";
            roundDescriptionEl.innerText = "Forma la palabra más larga con estas letras.";
            inputHintEl.innerText = "Escribe la palabra más larga que puedas formar.";
            
            contentAreaEl.innerText = data.letters.join(' ');
            contentAreaEl.style.fontSize = "2.5rem";
            contentAreaEl.style.color = "#333";
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
    if (!userValue) {
        alert("Por favor, introduce una respuesta.");
        return;
    }

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
                    target: state.currentData?.target,
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
            roundTitleEl.innerText = "Ronda " + state.currentRound;
            contentAreaEl.innerText = "Cargando siguiente ronda...";
            setTimeout(() => {
                startGame(); 
            }, 1000);
        }
    } catch (e) {
        console.error(e);
        contentAreaEl.innerText = "Error al enviar respuesta.";
        actionBtn.disabled = false;
    }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
actionBtn.addEventListener('click', submitAnswer);
pauseBtn.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    updateUI();
});

// Initial Score Fetch
fetchScore();