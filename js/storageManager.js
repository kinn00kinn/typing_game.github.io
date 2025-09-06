/**
 * storageManager.js
 * 
 * Manages saving and loading data to and from the browser's localStorage.
 * This allows for persisting high scores and user settings.
 */

const STORAGE_KEY = 'ancientTechGameData';
const GAME_RESULTS_KEY = 'gameResults';

/**
 * Saves data to localStorage.
 * @param {object} data - The data to save (e.g., { highScore: 1000 }).
 */
function saveData(data) {
    try {
        const existingData = loadData() || {};
        const newData = { ...existingData, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
}

/**
 * Loads data from localStorage.
 * @returns {object | null} The loaded data or null if an error occurs or no data exists.
 */
function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return null;
    }
}

/**
 * Saves a single game result to the historical results array in localStorage.
 * @param {object} result - The game result to save ({ score, accuracy, wpm, timestamp }).
 */
function saveGameResult(result) {
    try {
        const allData = loadData() || {};
        const gameResults = allData[GAME_RESULTS_KEY] || [];
        gameResults.push({ ...result, timestamp: Date.now() });
        saveData({ [GAME_RESULTS_KEY]: gameResults });
    } catch (error) {
        console.error("Error saving game result to localStorage:", error);
    }
}

/**
 * Loads all historical game results from localStorage.
 * @returns {Array<object>} An array of historical game results.
 */
function loadGameResults() {
    try {
        const allData = loadData();
        return allData ? (allData[GAME_RESULTS_KEY] || []) : [];
    } catch (error) {
        console.error("Error loading game results from localStorage:", error);
        return [];
    }
}

export const storageManager = {
    save: saveData,
    load: loadData,
    saveGameResult: saveGameResult,
    loadGameResults: loadGameResults,
};
