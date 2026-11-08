// app.js - Entry point and Event Listeners
import * as game from './game.js';
import * as renderer from './renderer.js';

// Global handler for chip clicks (passed to renderer)
window.handleChipClick = game.handleChipClick;

// Initialization
window.addEventListener('DOMContentLoaded', async () => {
    await game.loadInitialScore();
    
    // Wire up buttons
    renderer.elements.startBtn.addEventListener('click', game.startGame);
    renderer.elements.actionBtn.addEventListener('click', game.submitAnswer);
    
    renderer.elements.pauseBtn.addEventListener('click', () => {
        game.state.isPaused = !game.state.isPaused;
        // You can add timer logic here later
    });

    renderer.elements.addCalcBtn.addEventListener('click', game.addCalculation);
    renderer.elements.removeCalcBtn.addEventListener('click', game.removeCalculation);

    renderer.elements.opBtns.forEach(btn => {
        btn.addEventListener('click', () => game.selectOperation(btn.dataset.op));
    });
});