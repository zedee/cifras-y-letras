// game.js - Handles state, logic, and API calls
import { Apiservice } from './apiservice.js';
import * as renderer from './renderer.js';

// Game State
export const state = {
    score: 0,
    powerPoints: 0,
    currentRound: 0,
    timer: 0,
    timerInterval: null,
    isLoading: false,
    isPaused: false,
    currentData: null,
    bestPathHint: "" 
};

// Number Round Interaction State
let currentNumbers = []; 
let selectedA = null;   
let selectedB = null;   
let selectedOp = null;  
let calculationHistory = []; 

const numberShowDelay = 250;

// Helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function loadInitialScore() {
    const data = await Apiservice.fetchScore();
    if (data) {
        state.score = data.main_score;
        state.powerPoints = data.power_points;
        renderer.updateScore(state.score, state.powerPoints);
    }
}

export async function resetScore() {
    const data = await Apiservice.resetScore();
    if (data) {
        state.score = data.main_score;
        state.powerPoints = data.power_points;
        renderer.updateScore(state.score, state.powerPoints);
    }
}

export function handleChipClick(index) {
    if (currentNumbers[index].isUsed) return;

    if (selectedA === null) {
        selectedA = index;
    } else if (selectedA !== index && selectedB === null) {
        selectedB = index;
    } else {
        selectedA = index; 
        selectedB = null;
    }
    renderer.renderChips(currentNumbers, selectedA, selectedB);
}

export function selectOperation(op) {
    selectedOp = op;
    renderer.setOpBtnActive(op);
}

export function addCalculation() {
    if (selectedA === null || selectedB === null || selectedOp === null) {
        alert("Selecciona dos números y una operación.");
        return;
    }

    const valA = currentNumbers[selectedA].value;
    const valB = currentNumbers[selectedB].value;
    let result = 0;

    switch (selectedOp) {
        case '+': result = valA + valB; break;
        case '-': result = Math.abs(valA - valB); break;
        case '*': result = valA * valB; break;
        case '/': result = (valB !== 0 && valA % valB === 0) ? valA / valB : null; break;
    }

    if (result === null || result === 0) {
        alert("Operación no válida o resultado no es entero.");
        return;
    }

    currentNumbers[selectedA].isUsed = true;
    currentNumbers[selectedB].isUsed = true;
    
    const stepStr = `${valA} ${selectedOp} ${valB} = ${result}`;
    calculationHistory.push({
        stepStr, valA, valB, valA_idx: selectedA, valB_idx: selectedB, result
    });
    
    renderer.updateHistory(calculationHistory);

    currentNumbers.push({
        value: result,
        id: Date.now().toString(),
        isUsed: false
        // isOriginal is undefined/false here, so it goes to the bottom row automatically
    });

    if (state.currentRound % 2 !== 0) {
        renderer.setInput(result, true, "#e9ecef", "not-allowed");
    }

    selectedA = null;
    selectedB = null;
    selectedOp = null;
    renderer.setOpBtnNone();
    renderer.renderChips(currentNumbers, null, null, true); // Force rebuild because list changed
}

export function removeCalculation() {
    if (calculationHistory.length === 0) return;

    const lastEntry = calculationHistory.pop();
    currentNumbers[lastEntry.valA_idx].isUsed = false;
    currentNumbers[lastEntry.valB_idx].isUsed = false;
    currentNumbers.pop();
    
    renderer.updateHistory(calculationHistory);
    renderer.renderChips(currentNumbers, null, null, true); // Force rebuild because list changed
}

export async function startGame() {
    await resetScore();

    if (state.currentRound === 0) {
        state.currentRound = 1;
        state.timer = 40;
        state.isPaused = false; 
    }

    renderer.setLoading(true, "Cargando...");
    state.currentData = null; 
    
    renderer.clearContent();
    renderer.setInteractionUIVisibility(false);
    calculationHistory = [];
    selectedA = null;
    selectedB = null;
    selectedOp = null;
    
    try {
        if (state.currentRound % 2 !== 0) {
            const data = await Apiservice.fetchStartNumbers();
            state.currentData = data;
            state.bestPathHint = data.best_path ? data.best_path.join(' + ') : "No hint available";
            
            renderer.setRoundInfo(
                "Ronda " + state.currentRound + ": Números",
                "Logra el número objetivo con las cifras dadas.",
                "Usa los botones para realizar cálculos."
            );
            
            const targetNumberDiv = renderer.createTargetNumber(data.target);
            renderer.setTargetVisibility(targetNumberDiv, false);
            renderer.setTargetVisibility(document.getElementById('numbers-grid-wrapper'), true);            
            
            renderer.showHint(state.bestPathHint);

            // FIX: Added isOriginal: true here
            currentNumbers = data.numbers.map((val, idx) => ({
                value: val,
                id: `n-${idx}`,
                isUsed: false,
                isOriginal: true
            }));
            
            await renderer.animateNumbers(currentNumbers, numberShowDelay);

            renderer.setTargetVisibility(targetNumberDiv, true);
            
            /*
            startTimer(); 
            */

        } else {
            // Hide number grids
            renderer.setTargetVisibility(document.getElementById('numbers-grid-wrapper'), false);

            // Handle Vowel Selection flow
            renderer.setRoundInfo(
                "Ronda " + state.currentRound + ": Letras",
                "Forma la palabra más larga con estas letras.",
                "Elige el número de vocales antes de empezar."
            );
            
            renderer.showVowelSelection();

        }
    } catch (e) {
        console.error(e);
        renderer.setLoading(false, "Error al cargar la ronda. Reintenta.");
    } finally {
        renderer.setLoading(false);
        renderer.setInput("", false);
        renderer.toggleControls(true);
    }
}

// Global handler for vowel selection to bridge renderer -> game
window.onVowelSelected = async (vowelCount) => {
    renderer.clearContent();
    renderer.setRoundInfo(
        "Ronda " + state.currentRound + ": Letras",
        "Forma la palabra más larga con estas letras.",
        "Escribe la palabra más larga que puedas formar."
    );

    try {
        const data = await Apiservice.fetchStartLetters(vowelCount);
        state.currentData = data;
        
        renderer.setContentText(data.letters.join(' '), "2.5rem", "#333");
        renderer.setInteractionUIVisibility(false);
    } catch (e) {
        console.error(e);
        renderer.setLoading(false, "Error al generar letras. Reintenta.");
    }
};

export async function submitAnswer() {
    let finalValue = null;
    if (state.currentRound % 2 !== 0) {
        if (calculationHistory.length > 0) {
            finalValue = calculationHistory[calculationHistory.length - 1].result;
        }
    } else {
        finalValue = renderer.getInputValue();
    }

    if (!finalValue) {
        alert("Por favor, completa la operación o introduce una palabra.");
        return;
    }

    renderer.setLoading(true, "Enviando respuesta...");

    try {
        let scoreData;
        if (state.currentRound % 2 !== 0) {
            scoreData = await Apiservice.submitNumbers({
                user_value: finalValue,
                target: state.currentData?.target,
                best_val: state.currentData?.best_val 
            });
        } else {
            scoreData = await Apiservice.submitLetters({
                word: finalValue,
                letters: state.currentData?.letters
            });
        }
        
        const oldScore = state.score;
        state.score = scoreData.main_score;
        renderer.updateScore(state.score, state.powerPoints);

        let feedbackMsg = "";
        if (state.currentRound % 2 !== 0) {
            const target = state.currentData?.target;
            const diff = Math.abs(target - finalValue);
            if (diff === 0) feedbackMsg = "¡Exacto! ¡Increíble!";
            else if (diff <= 5) feedbackMsg = "¡Casi! Estás muy cerca.";
            else feedbackMsg = "Sigue intentándolo.";
        } else {
            feedbackMsg = `¡Buen intento! Has ganado ${state.score - oldScore} puntos.`;
        }

        renderer.showFeedback(feedbackMsg, state.score);

        setTimeout(() => {
            renderer.setInput("", false);
            if (state.currentRound % 2 !== 0) {
                renderer.setInput("", false, "", "default");
            }

            state.currentRound++;
            
            if (state.currentRound > 6) {
                alert("¡Juego Terminado!");
                location.reload();
            } else {
                renderer.setRoundInfo("Ronda " + state.currentRound, "Cargando...", "");
                setTimeout(() => {
                    startGame(); 
                }, 1000);
            }
        }, 2500);

    } catch (e) {
        console.error(e);
        renderer.setLoading(false, "Error al enviar respuesta.");
    }
}