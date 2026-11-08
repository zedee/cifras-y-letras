const API_BASE = "http://localhost:8000";

// Game State
const state = {
    score: 0,
    powerPoints: 0,
    currentRound: 0,
    timer: 0,
    timerInterval: null,
    isLoading: false,
    isPaused: false,
    currentData: null
};

// Number Round Interaction State
let currentNumbers = []; // Array of objects: { value: number, id: string, isUsed: boolean }
let selectedA = null;   // index in currentNumbers
let selectedB = null;   // index in currentNumbers
let selectedOp = null;  // "+", "-", "*", "/"
let calculationHistory = []; // Array of { stepStr, valA, valB, valA_idx, valB_idx, result }

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

// New UI Elements
const interactionUI = document.getElementById('number-interaction-ui');
const historyEl = document.getElementById('calc-history');
const addCalcBtn = document.getElementById('add-calc-btn');
const removeCalcBtn = document.getElementById('remove-calc-btn');
const opBtns = document.querySelectorAll('.op-btn');

function updateUI() {
    scoreEl.innerText = state.score;
    powerPointsEl.innerText = state.powerPoints;
    
    // --- TIMER_CODE_COMMENTED_OUT ---
    /*
    const minutes = Math.floor(state.timer / 60);
    const seconds = state.timer % 60;
    timerEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (state.isPaused) {
        document.getElementById('game-container').classList.add('paused');
        pauseBtn.innerText = "Reanudar";
    } else {
        document.getElementById('game-container').classList.remove('paused');
        pauseBtn.innerText = "Pausa";
    }
    */
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

// Helper to create the chip container to avoid clearing the Target
function getOrCreateChipContainer() {
    let container = document.getElementById('number-chips-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'number-chips-container';
        contentAreaEl.appendChild(container);
    }
    return container;
}

function renderNumberRound() {
    const chipContainer = getOrCreateChipContainer();
    chipContainer.innerHTML = ""; // Only clear the chips, not the Target
    
    interactionUI.style.display = "block";
    
    currentNumbers.forEach((num, index) => {
        const chip = document.createElement('div');
        chip.className = `chip ${num.isUsed ? 'used' : ''} ${selectedA === index ? 'selected' : ''} ${selectedB === index ? 'selected' : ''}`;
        chip.innerText = num.value;
        chip.onclick = () => selectNumber(index);
        chipContainer.appendChild(chip);
    });
}

function selectNumber(index) {
    if (currentNumbers[index].isUsed) return;

    if (selectedA === null) {
        selectedA = index;
    } else if (selectedA !== index && selectedB === null) {
        selectedB = index;
    } else {
        selectedA = index; // Switch selection if clicking a third time
        selectedB = null;
    }
    renderNumberRound();
}

opBtns.forEach(btn => {
    btn.onclick = () => {
        opBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedOp = btn.dataset.op;
    };
});

//Adds a calculation to history on the number challenge
function addCalcToHistory() {
    if (selectedA === null || selectedB === null || selectedOp === null) {
        alert("Selecciona dos números y una operación.");
        return;
    }

    const valA = currentNumbers[selectedA].value;
    const valB = currentNumbers[selectedB].value;
    let result = 0;

    switch (selectedOp) {
        case '+': result = valA + valB; break;
        case '-': result = valA - valB; break;
        case '*': result = valA * valB; break;
        case '/': result = valB !== 0 && valA % valB === 0 ? valA / valB : null; break;
    }

    if (result === null || result === 0) {
        alert("Operación no válida o resultado no es entero.");
        return;
    }

    // Update State
    currentNumbers[selectedA].isUsed = true;
    currentNumbers[selectedB].isUsed = true;
    
    const stepStr = `${valA} ${selectedOp} ${valB} = ${result}`;
    calculationHistory.push({
        stepStr: stepStr,
        valA: valA,
        valB: valB,
        valA_idx: selectedA,
        valB_idx: selectedB,
        result: result
    });
    
    historyEl.innerHTML += `<div class="history-item">${stepStr}</div>`;
    historyEl.scrollTop = historyEl.scrollHeight;

    // Add new chip for result
    currentNumbers.push({
        value: result,
        id: Date.now().toString(),
        isUsed: false
    });

    // Reset selection
    selectedA = null;
    selectedB = null;
    selectedOp = null;
    opBtns.forEach(b => b.classList.remove('active'));
    
    renderNumberRound();
};

//Removes last calculation from history on the number challenge
function removeCalcFromHistory() {
    if (calculationHistory.length === 0) return;

    const lastEntry = calculationHistory.pop();
    
    // Liberate the numbers used in that specific calculation
    currentNumbers[lastEntry.valA_idx].isUsed = false;
    currentNumbers[lastEntry.valB_idx].isUsed = false;
    
    // Remove the last chip (the result of the removed calculation)
    currentNumbers.pop();
    
    // Update UI
    const historyItems = historyEl.querySelectorAll('.history-item');
    if (historyItems.length > 0) {
        historyItems[historyItems.length - 1].remove();
    }

    renderNumberRound();
};

async function startGame() {
    if (state.currentRound === 0) {
        state.currentRound = 1;
        state.timer = 40;
        state.isPaused = false; 
    }

    roundDescriptionEl.innerText = "Cargando...";
    state.isLoading = true;
    state.currentData = null; 
    
    actionBtn.disabled = true;
    userInputEl.disabled = true;
    contentAreaEl.innerHTML = `<div class="loading-spinner">Calculando ronda...</div>`;
    interactionUI.style.display = "none";
    historyEl.innerHTML = "";
    calculationHistory = [];
    selectedA = null;
    selectedB = null;
    selectedOp = null;
    
    // --- TIMER_CODE_COMMENTED_OUT ---
    /*
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
    */

    try {
        if (state.currentRound % 2 !== 0) {
            // Number Round
            const response = await fetch(`${API_BASE}/start-numbers`);
            const data = await response.json();
            
            state.currentData = data;
            best_path_hint = data.best_path ? data.best_path.join(' + ') : "No hint available";
            
            roundTitleEl.innerText = "Ronda " + state.currentRound + ": Números";
            roundDescriptionEl.innerText = "Logra el número objetivo con las cifras dadas.";
            inputHintEl.innerText = "Usa los botones para realizar cálculos.";
            
            currentNumbers = data.numbers.map((val, idx) => ({
                value: val,
                id: `n-${idx}`,
                isUsed: false
            }));
            
            contentAreaEl.innerHTML = "";
            
            const targetDiv = document.createElement('div');
            targetDiv.style.fontSize = "1.5rem";
            targetDiv.style.color = "#007bff";
            targetDiv.style.marginBottom = "1rem";
            targetDiv.innerText = "Objetivo: " + data.target;
            contentAreaEl.appendChild(targetDiv);

            // Add the Hint button
            const hintBtn = document.createElement('button');
            hintBtn.innerText = "Mostrar Solución Óptima";
            hintBtn.style.marginTop = "10px";
            hintBtn.style.backgroundColor = "#6c757d";
            hintBtn.style.fontSize = "0.8rem";
            hintBtn.onclick = () => {
                const hintArea = document.getElementById('best-path-hint');
                hintArea.style.display = hintArea.style.display === 'none' ? 'block' : 'none';
            };
            
            const hintArea = document.createElement('div');
            hintArea.id = 'best-path-hint';
            hintArea.style.display = 'none';
            hintArea.style.marginTop = "10px";
            hintArea.style.padding = "10px";
            hintArea.style.background = "#e9ecef";
            hintArea.style.borderRadius = "8px";
            hintArea.style.fontSize = "0.9rem";
            hintArea.innerHTML = `<strong>Mejor camino:</strong> ${best_path_hint}`;
            
            contentAreaEl.appendChild(hintBtn);
            contentAreaEl.appendChild(hintArea);
            
            renderNumberRound();

        } else {
            // Letter Round
            const response = await fetch(`${API_BASE}/start-letters?vowel_count=3`);
            const data = await response.json();
            
            state.currentData = data;
            
            roundTitleEl.innerText = "Ronda " + state.currentRound + ": Letras";
            roundDescriptionEl.innerText = "Forma la palabra más larga con estas letras.";
            inputHintEl.innerText = "Escribe la palabra más larga que puedas formar.";
            
            contentAreaEl.innerHTML = "";
            contentAreaEl.innerText = data.letters.join(' ');
            contentAreaEl.style.fontSize = "2.5rem";
            contentAreaEl.style.color = "#333";
            interactionUI.style.display = "none";
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
    let finalValue = null;
    if (state.currentRound % 2 !== 0) {
        if (calculationHistory.length > 0) {
            const lastEntry = calculationHistory[calculationHistory.length - 1];
            finalValue = lastEntry.result;
        }
    } else {
        finalValue = userInputEl.value.trim();
    }

    if (!finalValue) {
        alert("Por favor, completa la operación o introduce una palabra.");
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
                    user_value: finalValue,
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
                    word: finalValue,
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
addCalcBtn.addEventListener('click', addCalcToHistory);
removeCalcBtn.addEventListener('click', removeCalcFromHistory);

// Initial Score Fetch
fetchScore();