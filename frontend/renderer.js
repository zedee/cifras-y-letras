// renderer.js - Handles all DOM manipulations

export const elements = {
    score: document.getElementById('score'),
    powerPoints: document.getElementById('power-points'),
    timer: document.getElementById('timer'),
    roundTitle: document.getElementById('round-title'),
    roundDescription: document.getElementById('round-description'),
    contentArea: document.getElementById('content-area'),
    userInput: document.getElementById('user-input'),
    inputHint: document.getElementById('input-hint'),
    actionBtn: document.getElementById('action-btn'),
    startBtn: document.getElementById('start-game-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    controlsContainer: document.getElementById('controls-container'),
    interactionUI: document.getElementById('number-interaction-ui'),
    historyEl: document.getElementById('calc-history'),
    addCalcBtn: document.getElementById('add-calc-btn'),
    removeCalcBtn: document.getElementById('remove-calc-btn'),
    opBtns: document.querySelectorAll('.op-btn'),
    chipContainer: null 
};

// Helper Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function initChipContainer() {
    if (!elements.chipContainer) {
        elements.chipContainer = document.createElement('div');
        elements.chipContainer.id = 'number-chips-container';
        elements.contentArea.appendChild(elements.chipContainer);
    }
    return elements.chipContainer;
}

export function updateScore(score, powerPoints) {
    elements.score.innerText = score;
    elements.powerPoints.innerText = powerPoints;
}

export function setLoading(isLoading, message = "") {
    elements.actionBtn.disabled = isLoading;
    elements.userInput.disabled = isLoading;
    if (isLoading) {
        elements.contentArea.innerHTML = `<div class="loading-spinner">${message}</div>`;
    }
}

export function setRoundInfo(title, description, hint) {
    elements.roundTitle.innerText = title;
    elements.roundDescription.innerText = description;
    elements.inputHint.innerText = hint;
}

export function setInput(value, isReadOnly = false, bgColor = "", cursor = "default") {
    elements.userInput.value = value;
    elements.userInput.readOnly = isReadOnly;
    elements.userInput.style.backgroundColor = bgColor;
    elements.userInput.style.cursor = cursor;
}

export function getInputValue() {
    return elements.userInput.value.trim();
}

export function clearContent() {
    elements.contentArea.innerHTML = "";
    elements.historyEl.innerHTML = "";
    elements.chipContainer = null; 
}

export function createTarget(target) {
    const targetDiv = document.createElement('div');
    targetDiv.style.fontSize = "1.5rem";
    targetDiv.style.color = "#007bff";
    targetDiv.style.marginBottom = "1rem";
    targetDiv.innerText = "Objetivo: " + target;
    elements.contentArea.appendChild(targetDiv);
    return targetDiv;
}

export function setTargetVisibility(targetDiv, isVisible) {
    targetDiv.style.display = isVisible ? "block" : "none";
}

export function showHint(hintText) {
    const hintBtn = document.createElement('button');
    hintBtn.innerText = "Mostrar Solución Óptima";
    hintBtn.style.marginTop = "10px";
    hintBtn.style.backgroundColor = "#6c757d";
    hintBtn.style.fontSize = "0.8rem";
    
    const hintArea = document.createElement('div');
    hintArea.id = 'best-path-hint';
    hintArea.style.display = 'none';
    hintArea.style.marginTop = "10px";
    hintArea.style.padding = "10px";
    hintArea.style.background = "#e9ecef";
    hintArea.style.borderRadius = "8px";
    hintArea.style.fontSize = "0.9rem";
    hintArea.innerHTML = `<strong>Mejor camino:</strong> ${hintText}`;
    
    elements.contentArea.appendChild(hintBtn);
    elements.contentArea.appendChild(hintArea);
    
    hintBtn.onclick = () => {
        hintArea.style.display = hintArea.style.display === 'none' ? 'block' : 'none';
    };
}

export async function animateNumbers(numbers, delay) {
    const container = initChipContainer();
    container.innerHTML = "";
    for (let i = 0; i < numbers.length; i++) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = numbers[i].value;
        chip.onclick = () => window.handleChipClick(i);
        container.appendChild(chip);
        await sleep(delay);
    }
}

export function renderChips(numbers, selectedA, selectedB) {
    const container = initChipContainer();
    container.innerHTML = "";
    elements.interactionUI.style.display = "block";
    
    numbers.forEach((num, index) => {
        const chip = document.createElement('div');
        chip.className = `chip ${num.isUsed ? 'used' : ''} ${selectedA === index ? 'selected' : ''} ${selectedB === index ? 'selected' : ''}`;
        chip.innerText = num.value;
        chip.onclick = () => {
            window.handleChipClick(index);
        };
        container.appendChild(chip);
    });
}

export function updateHistory(history) {
    elements.historyEl.innerHTML = "";
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerText = item.stepStr;
        elements.historyEl.appendChild(div);
    });
    elements.historyEl.scrollTop = elements.historyEl.scrollHeight;
}

export function showFeedback(message, score) {
    elements.contentArea.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #28a745;">${message}</h2>
            <p>Puntos actuales: ${score}</p>
        </div>
    `;
}

export function toggleControls(isVisible) {
    if (elements.controlsContainer) {
        if (isVisible) elements.controlsContainer.classList.remove('hidden');
        else elements.controlsContainer.classList.add('hidden');
    }
}

export function setInteractionUIVisibility(isVisible) {
    elements.interactionUI.style.display = isVisible ? "block" : "none";
}

export function setOpBtnActive(op) {
    elements.opBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.op === op);
    });
}

export function setOpBtnNone() {
    elements.opBtns.forEach(btn => btn.classList.remove('active'));
}

export function setContentText(text, fontSize, color) {
    elements.contentArea.innerHTML = "";
    elements.contentArea.innerText = text;
    elements.contentArea.style.fontSize = fontSize;
    elements.contentArea.style.color = color;
}

export function showVowelSelection() {
    elements.contentArea.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h3>Elige el número de vocales:</h3>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="vowel-btn" data-count="3">3</button>
                <button class="vowel-btn" data-count="4">4</button>
                <button class="vowel-btn" data-count="5">5</button>
                <button class="vowel-btn" data-count="6">6</button>
            </div>
        </div>
    `;

    const buttons = elements.contentArea.querySelectorAll('.vowel-btn');
    buttons.forEach(btn => {
        btn.style.padding = "10px 20px";
        btn.style.fontSize = "1.2rem";
        btn.style.cursor = "pointer";
        btn.onclick = () => {
            const count = parseInt(btn.dataset.count);
            // We'll call a global helper or handle via game.js
            window.onVowelSelected(count);
        };
    });
}