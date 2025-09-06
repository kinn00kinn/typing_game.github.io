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

// Scoring constants from design document
const SCORING = {
    basePoint: 10,
    missPenalty: 15,
    timeBonusFactor: 200,
    comboMultiplier: 0.02,
    difficultyFactor: {
        easy: 0.8,
        normal: 1,
        hard: 1.2,
        lunatic: 1.5
    }
};

const state = {
    status: 'ready', // ready, playing, finished
    phrases: [],
    currentPhrase: null,
    timer: GAME_DURATION,
    score: 0,
    misses: 0, // Per-phrase misses
    combo: 0,
    totalTyped: 0,
    totalCorrect: 0,
    difficulty: 'normal',
    intervalId: null,
    lastGameResults: null,
    isGameStarted: false,
    hasUserTyped: false,
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
        console.log(`Loaded ${state.phrases.length} phrases.`);
    } catch (error) {
        console.error("Failed to load phrases:", error);
        // Re-throw to ensure Promise.all catches it
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

    // state.intervalId = setInterval(tick, 1000);
    renderer.toggleStartScreen(false);
    inputManager.focus(); // Ensure input is focused after game starts
    // audioManager.play('start');
}

/**
 * Ends the current game.
 */
function endGame() {
    clearInterval(state.intervalId);
    state.status = 'finished';
    state.isGameStarted = false; // Reset flag
    state.hasUserTyped = false; // Reset flag
    audioManager.play('end');

    const accuracy = state.totalTyped > 0 ? (state.totalCorrect / state.totalTyped) * 100 : 0;
    // A standard "word" is 5 characters. WPM = (total chars / 5) / (time in minutes)
    const wpm = (state.totalCorrect / 5) / (GAME_DURATION / 60);

    const completedQuests = questsManager.check('game_end', { 
        difficulty: state.difficulty,
        accuracy: accuracy
    });
    handleCompletedQuests(completedQuests);

    renderer.displayResults({
        score: Math.round(state.score),
        accuracy: accuracy,
        wpm: wpm,
    });

    state.lastGameResults = {
        score: Math.round(state.score),
        accuracy: accuracy,
        wpm: wpm,
    };

    storageManager.saveGameResult(state.lastGameResults);
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
        console.error("nextPhrase called with empty phrases array.");
        renderer.renderNewPhrase("Error: No phrases loaded. Check server and file paths.");
        console.error("Cannot start game: phrases array is empty.");
        if(state.intervalId) clearInterval(state.intervalId);
        state.status = 'finished';
        renderer.toggleStartScreen(true);
        return;
    }

    inputManager.clear();
    renderer.clearInputDisplay();

    let newPhrase;
    do {
        newPhrase = state.phrases[Math.floor(Math.random() * state.phrases.length)];
    } while (state.phrases.length > 1 && newPhrase?.id === state.currentPhrase?.id);
    
    state.currentPhrase = newPhrase;
    state.misses = 0; // Reset per-phrase misses

    if (!state.currentPhrase) {
        renderer.renderNewPhrase("Error: Failed to select a new phrase.");
        return;
    }

    // Check for special character quest
    const questResult = questsManager.check('phrase_start', { text: state.currentPhrase.text });
    handleCompletedQuests(questResult);

    renderer.renderNewPhrase(state.currentPhrase.text);
    updateHUD();
}

/**
 * Handles input from the inputManager.
 * @param {string} typedText - The current text in the input field.
 */
function handleInput(typedText) {
    if (state.status !== 'playing') return;

    // Start timer on first character
    if (!state.isGameStarted && typedText.length === 1 && typedText.trim() !== '') {
        state.isGameStarted = true;
        state.intervalId = setInterval(tick, 1000);
        // Optional: audioManager.play('game_start_sound');
    }

    renderer.updateInputDisplay(state.currentPhrase.text, typedText);

    const lastCharIndex = typedText.length - 1;
    const lastTypedChar = typedText[lastCharIndex];
    const correctChar = state.currentPhrase.text[lastCharIndex];

    if (lastTypedChar === correctChar) {
        state.combo++;
        const difficultyFactor = SCORING.difficultyFactor[state.difficulty] || 1;
        const comboMultiplier = 1 + (state.combo * SCORING.comboMultiplier);
        const charScore = SCORING.basePoint * difficultyFactor * comboMultiplier;
        state.score += charScore;
        state.totalCorrect++;
        audioManager.play('type');
    } else {
        state.combo = 0;
        state.misses++;
        state.score -= SCORING.missPenalty;
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

    if (typedText === state.currentPhrase.text) {
        audioManager.play('success');
        
        // Add time bonus
        const timeBonus = Math.floor((state.timer / GAME_DURATION) * SCORING.timeBonusFactor);
        state.score += timeBonus;

        const questResult = questsManager.check('phrase_complete', { misses: state.misses });
        handleCompletedQuests(questResult);

        // Render the user's successful input before getting the next phrase
        renderer.renderUserMessage(typedText);

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
        score: Math.round(state.score),
        misses: state.misses,
        combo: state.combo,
    });
}

export const gameController = {
    init,
    startGame,
    getLastGameResults: () => state.lastGameResults,
    focusInput: () => inputManager.focus(), // Expose inputManager's focus
};