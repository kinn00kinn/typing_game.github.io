/**
 * storageManager.js
 * 
 * Manages saving and loading data to and from the browser's localStorage.
 * This allows for persisting high scores and user settings.
 */

const STORAGE_KEY = 'ancientTechGameData';

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

export const storageManager = {
    save: saveData,
    load: loadData,
};
