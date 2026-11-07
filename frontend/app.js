const API_BASE = "http://localhost:8000";

// Game State
const state = {
    score: 0,
    powerPoints: 0,
    currentRound: 0,
    timer: 0,
    timerInterval: null,
    currentData: {}
};

// DOM Elements
const scoreEl = document.getElementById('score');
const powerPointsEl = document.getElementById('power-points');
const timerEl = document.getElementById('timer');
const roundTitleEl = document.getElementById('round-title');
const roundDescriptionEl = document.getElementById('round-description');
const contentAreaEl = document.getElementById('content-area');
const userInputEl = document.getElementById('user-input');
const actionBtn = document.getElementById('action-btn');

function updateUI() {
    scoreEl.innerText = state.score;
    powerPointsEl.innerText = state.powerPoints;
    timerEl.innerText = `00:${state.timer.toString().padStart(2, '0')}`;
}

async function fetchScore() {
    const response = await fetch(`${API_BASE}/score`);
    const data = await response.json();
    state.score = data.main_score;
    state.powerPoints = data.power_points;
    updateUI();
}

async function startGame() {
    state.currentRound = 1;
    actionBtn.innerText = "Submit";
    userInputEl.disabled = false;
    userInputEl.focus();
    
    if (state.currentRound % 2 !== 0) {
        // It's a Number Round
        roundTitleEl.innerText = "Round " + state.currentRound + ": Números";
        roundDescriptionEl.innerText = "Logra el número objetivo con las cifras dadas.";
        
        const response = await fetch(`${API_BASE}/start-numbers`);
        const data = await response.json();
        state.currentData = data;
        
        contentAreaEl.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 1rem;">${data.numbers.join(' | ')}</div>
            <div style="color: #007bff;">Objetivo: ${data.target}</div>
            <div style="font-size: 0.8rem; margin-top: 1rem; color: #666;">
                Mejor posible: ${data.best_val} (${data.best_path.join(' ')})
            </div>
        `;
    } else {
        // It's a Letter Round
        roundTitleEl.innerText = "Round " + state.currentRound + ": Letras";
        roundDescriptionEl.innerText = "Forma la palabra más larga con estas letras.";
        
        const response = await fetch(`${API_BASE}/start-letters?vowel_count=3`);
        const data = await response.json();
        state.currentData = data;
        
        contentAreaEl.innerText = data.letters.join(' ');
    }

    state.timer = 40;
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.timer--;
        updateUI();
        if (state.timer <= 0) {
            clearInterval(state.timerInterval);
            alert("¡Tiempo agotado!");
        }
    }, 1000);
}

async function submitAnswer() {
    const userValue = parseInt(userInputEl.value);
    
    if (state.currentRound % 2 !== 0) {
        // Submit Numbers
        const response = await fetch(`${API_BASE}/submit-numbers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_value: userValue,
                best_val: state.currentData.best_val
            })
        });
        const scoreData = await response.json();
        state.score = scoreData.main_score;
        updateUI();
    } else {
        // Submit Letters (Logic for letters to be added next)
        console.log("Letter submitted:", userInputEl.value);
    }

    userInputEl.value = "";
    state.currentRound++;
    
    if (state.currentRound > 6) {
        alert("¡Juego Terminado!");
        location.reload();
    } else {
        roundTitleEl.innerText = "Round " + state.currentRound;
        contentAreaEl.innerText = "Cargando siguiente ronda...";
        // In a real app, we'd trigger the next round's data fetch here
    }
}

actionBtn.addEventListener('click', () => {
    if (state.currentRound === 0) {
        startGame();
    } else {
        submitAnswer();
    }
});

// Polling for score updates from backend
setInterval(fetchScore, 2000);

updateUI();