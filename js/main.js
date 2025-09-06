/**
 * main.js
 * 
 * The entry point for the application. This file initializes all the necessary
 * modules and sets up the primary event listeners.
 */

import { gameController } from './gameController.js';
import { audioManager } from './audioManager.js';
import { questsManager } from './questsManager.js';

const startButton = document.getElementById('start-button');

if (!startButton) {
    console.error("Fatal: Start button not found!");
} else {
    // Initialize modules that need to fetch data.
    Promise.all([
        questsManager.init(),
        gameController.init(),
    ]).then(() => {
        console.log("Game initialized and ready.");
    }).catch(error => {
        console.error("An error occurred during initialization:", error);
    });

    // The main event listener to kick things off.
    startButton.addEventListener('click', async () => {
        try {
            // Audio context requires user interaction to start.
            await audioManager.init();
            gameController.startGame();
        } catch (error) {
            console.error("Error starting the game:", error);
        }
    });

    // Also allow starting the game by pressing Enter on the start screen
    document.addEventListener('keydown', (event) => {
        const startScreen = document.getElementById('start-screen');
        // Check if the start screen is visible and Enter is pressed
        if (startScreen.style.display !== 'none' && event.key === 'Enter') {
            startButton.click();
        }
    });
}