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
    // New row elements
    originalRow: document.getElementById('original-numbers-row'),
    calculatedRow: document.getElementById('calculated-numbers-row')
};

// State to track when to rebuild the DOM
let lastRenderedLength = 0;

// Helper Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    elements.originalRow.innerHTML = "";
    elements.calculatedRow.innerHTML = "";
    lastRenderedLength = 0;
}

export function createTargetNumber(target) {
    const targetDiv = document.createElement('div');
    targetDiv.style.fontSize = "1.5rem";
    targetDiv.style.color = "#007bff";
    targetDiv.style.marginBottom = "1rem";
    targetDiv.innerText = "Objetivo: " + target;
    elements.contentArea.appendChild(targetDiv);
    return targetDiv;
}

export function setTargetVisibility(targetDiv, isVisible) {
    if (targetDiv.classList.contains('hidden')) {
        return isVisible ? targetDiv.classList.remove('hidden') : false;
    } else {
        targetDiv.style.display = isVisible ? "block" : "none";
    }
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
    elements.originalRow.innerHTML = "";
    elements.calculatedRow.innerHTML = "";
    
    for (let i = 0; i < numbers.length; i++) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = numbers[i].value;
        chip.onclick = () => window.handleChipClick(i);
        elements.originalRow.appendChild(chip);
        await sleep(delay);
    }
    lastRenderedLength = numbers.length;
}

/**
 * Renders or updates the number chips.
 * @param {Array} numbers - The current list of numbers
 * @param {number|null} selectedA - Index of first selection
 * @param {number|null} selectedB - Index of second selection
 * @param {boolean} forceRebuild - If true, clears the rows and recreates chips
 */
export function renderChips(numbers, selectedA, selectedB, forceRebuild = false) {
    // Rebuild if forced OR if the number of items has changed
    if (forceRebuild || numbers.length !== lastRenderedLength || lastRenderedLength === 0) {
        elements.originalRow.innerHTML = "";
        elements.calculatedRow.innerHTML = "";
        
        numbers.forEach((num, index) => {
            const chip = document.createElement('div');
            chip.className = `chip ${num.isUsed ? 'used' : ''} ${selectedA === index ? 'selected' : ''} ${selectedB === index ? 'selected' : ''}`;
            chip.innerText = num.value;
            chip.onclick = () => {
                window.handleChipClick(index);
            };
            
            if (num.isOriginal) {
                elements.originalRow.appendChild(chip);
            } else {
                elements.calculatedRow.appendChild(chip);
            }
        });
        lastRenderedLength = numbers.length;
    } else {
        // If data hasn't changed, only update the visual "selected" classes
        const allChips = [...elements.originalRow.children, ...elements.calculatedRow.children];
        
        allChips.forEach((chip, index) => {
            chip.classList.remove('selected');
            if (index === selectedA || index === selectedB) {
                chip.classList.add('selected');
            }
        });
    }
    
    elements.interactionUI.style.display = "block";
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

export function showFeedback(message, score, suggestions = []) {
    let suggestionsHtml = "";
    if (suggestions.length > 0) {
        suggestionsHtml = `
            <div style="margin-top: 20px; text-align: left; display: inline-block;">
                <h4 style="margin-bottom: 5px; color: #555;">Sugerencias:</h4>
                <p style="margin: 0; font-style: italic; color: #666;">${suggestions.join(', ')}</p>
            </div>
        `;
    }

    elements.contentArea.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #28a745;">${message}</h2>
            <p>Puntos actuales: ${score}</p>
            ${suggestionsHtml}
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

/**
 * Renders letters as individual spans inside a wrapper to allow for dimming effects.
 */
export function renderLetters(letters) {
    elements.contentArea.innerHTML = ""; // Clear previous content
    const wrapper = document.createElement('div');
    wrapper.id = "letters-pool-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.flexWrap = "wrap";
    wrapper.style.gap = "10px";
    wrapper.style.justifyContent = "center";
    wrapper.style.marginTop = "20px";

    letters.forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        span.style.fontSize = "2.5rem";
        span.style.color = "#333";
        span.style.fontWeight = "bold";
        span.className = "letter-chip";
        span.dataset.char = char;
        wrapper.appendChild(span);
    });

    elements.contentArea.appendChild(wrapper);
}

/**
 * Dims letters in the pool that have been used in the current input.
 * Handles multiple letters and both typing/deleting correctly.
 * @param {string} inputValue - The current text in the input field.
 */
export function dimLetters(inputValue) {
    const spans = elements.contentArea.querySelectorAll('.letter-chip');
    
    // Create a frequency map of letters used in the input
    const charCounts = {};
    for (const char of inputValue) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }

    // Reset all chips to original color
    spans.forEach(span => {
        span.style.color = "#333";
    });

    // Dim chips that match the input frequency
    spans.forEach(span => {
        const char = span.dataset.char;
        if (charCounts[char] > 0) {
            span.style.color = "#ccc"; // Clear grey
            charCounts[char]--;
        }
    });
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
            window.onVowelSelected(count);
        };
    });
}