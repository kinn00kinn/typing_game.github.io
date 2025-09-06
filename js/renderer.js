/**
 * renderer.js
 * 
 * Handles all DOM updates and rendering for the game.
 * This keeps rendering logic separate from the main game state management.
 */

const elements = {
    messages: document.getElementById('messages'),
    userInput: document.getElementById('user-input-display'),
    hiddenInput: document.getElementById('hidden-input'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    missCount: document.getElementById('miss-count'),
    comboCount: document.getElementById('combo-count'),
    questList: document.getElementById('quest-list'),
    startScreen: document.getElementById('start-screen'),
};

/**
 * Renders a new phrase to be typed in the chat pane.
 * @param {string} text - The phrase text.
 */
function renderNewPhrase(text) {
    const systemBubble = document.createElement('div');
    systemBubble.className = 'system-bubble';
    
    const chars = text.split('').map((char, index) => {
        return `<span class="char" data-index="${index}">${char}</span>`;
    }).join('');

    systemBubble.innerHTML = chars;
    elements.messages.appendChild(systemBubble);
    elements.messages.scrollTop = elements.messages.scrollHeight; // Scroll to bottom
}

/**
 * Updates the user's input display, showing correct/incorrect characters.
 * @param {string} phraseText - The original phrase.
 * @param {string} typedText - The text the user has typed so far.
 */
function updateInputDisplay(phraseText, typedText) {
    const phraseChars = phraseText.split('');
    const typedChars = typedText.split('');
    
    let html = typedChars.map((char, index) => {
        let status = '';
        if (index < phraseChars.length) {
            status = char === phraseChars[index] ? 'correct' : 'incorrect';
        }
        return `<span class="char ${status}">${char}</span>`;
    }).join('');

    html += '<span class="cursor">_</span>';
    elements.userInput.innerHTML = html;
}

/**
 * Clears the user input display.
 */
function clearInputDisplay() {
    elements.userInput.innerHTML = '<span class="cursor">_</span>';
}

/**
 * Updates the HUD with the latest game stats.
 * @param {object} stats - Object containing timer, score, misses, and combo.
 */
function updateHUD({ timer, score, misses, combo }) {
    if (timer !== undefined) elements.timer.textContent = timer;
    if (score !== undefined) elements.score.textContent = score;
    if (misses !== undefined) elements.missCount.textContent = misses;
    if (combo !== undefined) elements.comboCount.textContent = combo;
}

/**
 * Renders the list of active quests.
 * @param {Array<object>} quests - Array of quest objects with description and completed status.
 */
function renderQuests(quests) {
    elements.questList.innerHTML = quests.map(q => 
        `<li class="${q.completed ? 'completed' : ''}">${q.description}</li>`
    ).join('');
}

/**
 * Shows or hides the start screen overlay.
 * @param {boolean} show - Whether to show the screen.
 */
function toggleStartScreen(show) {
    elements.startScreen.style.display = show ? 'flex' : 'none';
}

/**
 * Clears all messages from the chat pane.
 */
function clearMessages() {
    elements.messages.innerHTML = '';
}


export const renderer = {
    renderNewPhrase,
    updateInputDisplay,
    clearInputDisplay,
    updateHUD,
    renderQuests,
    toggleStartScreen,
    clearMessages,
    focusInput: () => elements.hiddenInput.focus(),
};
