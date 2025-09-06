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
    // Results Screen elements
    resultsScreen: document.getElementById('results-screen'),
    resultsScore: document.getElementById('results-score'),
    resultsAccuracy: document.getElementById('results-accuracy'),
    resultsWpm: document.getElementById('results-wpm'),
    // Settings Panel elements
    settingsButton: document.getElementById('settings-button'),
    settingsPanel: document.getElementById('settings-panel'),
    muteButton: document.getElementById('mute-button'),
};

/**
 * Renders a new phrase to be typed in the chat pane.
 * @param {string} text - The phrase text.
 */
function renderNewPhrase(text) {
    const systemBubble = document.createElement('div');
    systemBubble.className = 'system-bubble';
    systemBubble.innerHTML = text.split('').map((char, index) => {
        return `<span class="char" data-index="${index}">${char}</span>`;
    }).join('');
    elements.messages.appendChild(systemBubble);
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

/**
 * Renders a successfully typed user message in the chat pane.
 * @param {string} text - The user's typed text.
 */
function renderUserMessage(text) {
    const userBubble = document.createElement('div');
    userBubble.className = 'user-bubble';
    userBubble.textContent = text;
    elements.messages.appendChild(userBubble);
    elements.messages.scrollTop = elements.messages.scrollHeight;
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
        let status = (index < phraseChars.length && char === phraseChars[index]) ? 'correct' : 'incorrect';
        return `<span class="char ${status}">${char}</span>`;
    }).join('');
    html += '<span class="cursor">_</span>';
    elements.userInput.innerHTML = html;
}

function clearInputDisplay() {
    elements.userInput.innerHTML = '<span class="cursor">_</span>';
}

function updateHUD({ timer, score, misses, combo }) {
    if (timer !== undefined) elements.timer.textContent = timer;
    if (score !== undefined) elements.score.textContent = score;
    if (misses !== undefined) elements.missCount.textContent = misses;
    if (combo !== undefined) elements.comboCount.textContent = combo;
}

function renderQuests(quests) {
    elements.questList.innerHTML = quests.map(q => 
        `<li class="${q.completed ? 'completed' : ''}">${q.description}</li>`
    ).join('');
}

function toggleStartScreen(show) {
    elements.startScreen.style.display = show ? 'flex' : 'none';
}

function clearMessages() {
    elements.messages.innerHTML = '';
}

/**
 * Displays the results screen with final stats.
 * @param {object} stats - { score, accuracy, wpm }
 */
function displayResults({ score, accuracy, wpm }) {
    elements.resultsScore.textContent = score;
    elements.resultsAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    elements.resultsWpm.textContent = wpm.toFixed(1);
    elements.resultsScreen.style.display = 'flex';
}

/**
 * Hides the results screen.
 */
function hideResults() {
    elements.resultsScreen.style.display = 'none';
}

/**
 * Toggles the visibility of the settings panel.
 * @param {boolean} show - Whether to show the panel.
 */
function toggleSettingsPanel(show) {
    if (elements.settingsPanel) {
        elements.settingsPanel.classList.toggle('hidden', !show);
    }
}

/**
 * Updates the text of the mute button based on the mute state.
 * @param {boolean} isMuted - Current mute state.
 */
function updateMuteButtonText(isMuted) {
    if (elements.muteButton) {
        elements.muteButton.textContent = isMuted ? 'Unmute Audio' : 'Mute Audio';
    }
}

export const renderer = {
    renderNewPhrase,
    renderUserMessage,
    updateInputDisplay,
    clearInputDisplay,
    updateHUD,
    renderQuests,
    toggleStartScreen,
    clearMessages,
    displayResults,
    hideResults,
    toggleSettingsPanel,
    updateMuteButtonText,
    focusInput: () => elements.hiddenInput.focus(),
};
