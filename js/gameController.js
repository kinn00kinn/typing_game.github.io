/**
 * gameController.js
 * 
 * The main controller for the game. It manages game state, the game loop,
 * scoring, and coordinates all other modules.
 */

import { renderer } from './renderer.js';
import { inputManager } from './inputManager.js';
import { audioManager } from './audioManager.js';
import { questsManager } from './questsManager.js';
import { storageManager } from './storageManager.js';

const GAME_DURATION = 60; // seconds

const state = {
    status: 'ready', // ready, playing, finished
    phrases: [],
    currentPhrase: null,
    timer: GAME_DURATION,
    score: 0,
    misses: 0,
    combo: 0,
    totalTyped: 0,
    totalCorrect: 0,
    difficulty: 'normal',
    intervalId: null,
};

/**
 * Initializes the game controller.
 */
async function init() {
    try {
        const response = await fetch('data/phrases.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.phrases)) {
            throw new Error('Invalid phrases data format.');
        }
        state.phrases = data.phrases;
    } catch (error) {
        console.error("Failed to load phrases:", error);
        // Re-throw the error to be caught by Promise.all
        throw error;
    }

    inputManager.init(handleInput, handleCommit);
    renderer.toggleStartScreen(true);
}

/**
 * Starts a new game.
 */
function startGame() {
    state.status = 'playing';
    state.score = 0;
    state.misses = 0;
    state.combo = 0;
    state.timer = GAME_DURATION;
    state.totalTyped = 0;
    state.totalCorrect = 0;
    state.difficulty = document.getElementById('difficulty-select').value;

    renderer.clearMessages();
    questsManager.reset();
    renderer.renderQuests(questsManager.getActiveQuests());
    updateHUD();
    nextPhrase();

    state.intervalId = setInterval(tick, 1000);
    renderer.toggleStartScreen(false);
    inputManager.focus();
    audioManager.play('start');
}

/**
 * Ends the current game.
 */
function endGame() {
    clearInterval(state.intervalId);
    state.status = 'finished';
    audioManager.play('end');

    const accuracy = state.totalTyped > 0 ? (state.totalCorrect / state.totalTyped) * 100 : 0;
    const completedQuests = questsManager.check('game_end', { 
        difficulty: state.difficulty,
        accuracy: accuracy
    });
    handleCompletedQuests(completedQuests);

    // Final message
    renderer.renderNewPhrase(`Game Over! Final Score: ${state.score}`);
    renderer.toggleStartScreen(true);
    // Modify start button for replay
    document.getElementById('start-button').textContent = 'Play Again';
}

/**
 * The main game loop tick, called every second.
 */
function tick() {
    state.timer--;
    updateHUD();
    if (state.timer <= 0) {
        endGame();
    }
}

/**
 * Loads the next phrase for the player to type.
 */
function nextPhrase() {
    if (state.phrases.length === 0) {
        renderer.renderNewPhrase("Error: No phrases loaded. Check server and file paths.");
        console.error("Cannot start game: phrases array is empty.");
        // Stop the game from proceeding
        if(state.intervalId) clearInterval(state.intervalId);
        state.status = 'finished';
        renderer.toggleStartScreen(true);
        return;
    }

    inputManager.clear();
    renderer.clearInputDisplay();

    // Get a random phrase that is not the same as the current one
    let newPhrase;
    do {
        newPhrase = state.phrases[Math.floor(Math.random() * state.phrases.length)];
    } while (state.phrases.length > 1 && newPhrase?.id === state.currentPhrase?.id);
    
    state.currentPhrase = newPhrase;

    if (!state.currentPhrase) {
        renderer.renderNewPhrase("Error: Failed to select a new phrase.");
        console.error("Could not get a new phrase from the phrases array.", state.phrases);
        return;
    }

    renderer.renderNewPhrase(state.currentPhrase.text);
}

/**
 * Handles input from the inputManager.
 * @param {string} typedText - The current text in the input field.
 */
function handleInput(typedText) {
    if (state.status !== 'playing') return;

    const phraseText = state.currentPhrase.text;
    renderer.updateInputDisplay(phraseText, typedText);

    const lastCharIndex = typedText.length - 1;
    const lastTypedChar = typedText[lastCharIndex];
    const correctChar = phraseText[lastCharIndex];

    if (lastTypedChar === correctChar) {
        state.combo++;
        state.score += 10; // Base score per char
        state.totalCorrect++;
        audioManager.play('type');
    } else {
        state.combo = 0;
        state.misses++;
        state.score -= 5; // Penalty
        audioManager.play('miss');
    }
    state.totalTyped++;

    const questResult = questsManager.check('stat_update', { combo: state.combo });
    handleCompletedQuests(questResult);

    updateHUD();
}

/**
 * Handles the commit action (Enter key).
 */
function handleCommit(typedText) {
    if (state.status !== 'playing') return;

    const phraseText = state.currentPhrase.text;
    if (typedText === phraseText) {
        audioManager.play('success');
        state.score += 100; // Bonus for completing a phrase
        
        const questResult = questsManager.check('phrase_complete', { misses: state.misses });
        handleCompletedQuests(questResult);

        state.misses = 0; // Reset misses for the next phrase quest
        nextPhrase();
    }
}

function handleCompletedQuests(completedQuests) {
    if (completedQuests.length > 0) {
        completedQuests.forEach(q => {
            state.score += q.reward.scoreBonus || 0;
            audioManager.play('quest');
        });
        renderer.renderQuests(questsManager.getActiveQuests());
    }
}

function updateHUD() {
    renderer.updateHUD({
        timer: state.timer,
        score: state.score,
        misses: state.misses,
        combo: state.combo,
    });
}

export const gameController = {
    init,
    startGame,
};
