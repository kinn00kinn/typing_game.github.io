# AncientTech — Typing Game

This is a retro-futuristic typing game built with Vanilla JavaScript, HTML, and CSS. It runs entirely in the browser and is designed to be deployed on services like GitHub Pages.

## Features

*   **Chat-style UI**: A modern, clean interface modeled after AI chat applications.
*   **Dynamic Scoring**: Score is calculated based on speed, accuracy, and combos, inspired by games like *Sushi-da*.
*   **Challenge Quests**: In-game objectives to achieve for bonus points.
*   **Multiple Difficulties**: Four difficulty levels from EASY to LUNATIC.
*   **Sound Effects**: Audio feedback for typing, errors, and game events.
*   **Local Persistence**: High scores and settings are saved in the browser's localStorage.

## How to Run Locally

Because this project uses ES Modules (`import`/`export`) and the `fetch()` API to load game data, you cannot run it by simply opening `index.html` in your browser. You need to serve the files from a local web server.

1.  **Navigate to the project directory**:
    ```sh
    cd C:\Users\haruk\Documents\dev\typing_game
    ```

2.  **Start a local server**:
    If you have Python installed, you can easily start a server with one of the following commands:

    *For Python 3:*
    ```sh
    python -m http.server
    ```

    *For Python 2:*
    ```sh
    python -m SimpleHTTPServer
    ```

3.  **Open the game**:
    Once the server is running, open your web browser and navigate to:
    [http://localhost:8000](http://localhost:8000)

## Project Structure

```
/ (repo root)
├─ index.html         // Main application entry point
├─ README.md          // This file (Japanese)
├─ README.en.md       // This file (English)
├─ css/
│  └─ styles.css      // All styles for the application
├─ js/
│  ├─ main.js         // Main entry point, initializes modules
│  ├─ gameController.js // Core game logic and state management
│  ├─ renderer.js     // Handles all DOM manipulation
│  ├─ inputManager.js // Manages user keyboard input (including IME)
│  ├─ audioManager.js // Plays sound effects
│  ├─ questsManager.js// Tracks quest progress
│  └─ storageManager.js // Saves and loads data from localStorage
├─ data/
│  ├─ phrases.json    // Typing phrases
│  └─ quests.json     // Quest definitions
├─ assets/
│  ├─ audio/          // (Placeholder) Add sound files here
│  └─ icons/          // (Placeholder) Add icon files here
```

## Important Note on Assets

The audio files are not included in this repository. You will need to add your own `.ogg` or `.mp3` files to the `assets/audio/` directory for the sound to work. The placeholder paths are:
*   `assets/audio/type.ogg`
*   `assets.audio/miss.ogg`
*   `assets/audio/success.ogg`
*   `assets/audio/quest.ogg`
*   `assets/audio/start.ogg`
*   `assets/audio/end.ogg`

## GitHub Repository

You can find the source code for this project here: [https://github.com/kinn00kinn/typing_game.github.io]

```