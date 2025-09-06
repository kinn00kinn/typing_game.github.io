/**
 * main.js
 * 
 * The entry point for the application. This file initializes all the necessary
 * modules and sets up the primary event listeners.
 */

import { gameController } from './gameController.js';
import { audioManager } from './audioManager.js';
import { questsManager } from './questsManager.js';
import { renderer } from './renderer.js';

const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const settingsButton = document.getElementById('settings-button');
const muteButton = document.getElementById('mute-button');
const themeToggleButton = document.getElementById('theme-toggle-button');
const shareTwitterButton = document.getElementById('share-twitter-button');
const historyButton = document.getElementById('history-button');
const closeHistoryButton = document.getElementById('close-history-button');

if (!startButton || !playAgainButton || !settingsButton || !muteButton || !themeToggleButton || !shareTwitterButton || !historyButton || !closeHistoryButton) {
    console.error("Fatal: One or more UI buttons not found!");
} else {
    // Initialize modules that need to fetch data.
    Promise.all([
        questsManager.init(),
        gameController.init(),
    ]).then(() => {
        console.log("Game initialized and ready.");
        // renderer.updateMuteButtonText(audioManager.isMuted()); // Set initial mute button text
    }).catch(error => {
        console.error("An error occurred during initialization:", error);
    });

    const handleStartGame = async () => {
        try {
            // await audioManager.init(); // Audio context requires user interaction.
            gameController.startGame();
        } catch (error) {
            console.error("Error starting the game:", error);
        }
    };

    // Listener for the main start button
    startButton.addEventListener('click', handleStartGame);

    // Listener for the play again button on the results screen
    playAgainButton.addEventListener('click', () => {
        renderer.hideResults();
        handleStartGame();
    });

    // Listener for the settings button
    settingsButton.addEventListener('click', () => {
        // Toggle settings panel visibility
        const isPanelHidden = renderer.elements.settingsPanel.classList.contains('hidden');
        renderer.toggleSettingsPanel(isPanelHidden);
    });

    // Listener for the mute button
    muteButton.addEventListener('click', () => {
        audioManager.toggleMute();
        renderer.updateMuteButtonText(audioManager.isMuted());
    });

    let isLightTheme = false; // Default to dark theme
    // Listener for the theme toggle button
    themeToggleButton.addEventListener('click', () => {
        isLightTheme = !isLightTheme;
        renderer.toggleTheme(isLightTheme);
        themeToggleButton.textContent = isLightTheme ? 'Dark Theme' : 'Light Theme';
    });

    // Listener for the Twitter share button
    shareTwitterButton.addEventListener('click', () => {
        const lastResults = gameController.getLastGameResults(); // Assuming gameController provides this
        if (lastResults) {
            renderer.shareOnTwitter(lastResults);
        } else {
            console.warn("No game results to share.");
        }
    });

    // Listener for the history button
    historyButton.addEventListener('click', () => {
        const historicalResults = storageManager.loadGameResults();
        renderer.renderHistoricalChart(historicalResults);
        renderer.showHistoryScreen();
    });

    // Listener for the close history button
    closeHistoryButton.addEventListener('click', () => {
        renderer.hideHistoryScreen();
    });

    // Also allow starting the game by pressing Enter on the start screen
    document.addEventListener('keydown', (event) => {
        const startScreen = document.getElementById('start-screen');
        if (startScreen.style.display !== 'none' && event.key === 'Enter') {
            startButton.click();
        }
    });

    // Listener for difficulty select to regain focus
    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            setTimeout(() => {
                gameController.focusInput();
            }, 0);
        });
    }
}