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
    resultsChart: document.getElementById('results-chart'),
    // Settings Panel elements
    settingsButton: document.getElementById('settings-button'),
    settingsPanel: document.getElementById('settings-panel'),
    muteButton: document.getElementById('mute-button'),
    themeToggleButton: document.getElementById('theme-toggle-button'),
    shareTwitterButton: document.getElementById('share-twitter-button'),
    historyButton: document.getElementById('history-button'),
    historyScreen: document.getElementById('history-screen'),
    historyChart: document.getElementById('history-chart'),
    closeHistoryButton: document.getElementById('close-history-button'),
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

let chartInstance = null;

/**
 * Renders a chart with the game results.
 * @param {object} stats - { score, accuracy, wpm }
 */
function renderResultsChart({ accuracy, wpm }) {
    const ctx = elements.resultsChart.getContext('2d');

    if (chartInstance) {
        chartInstance.destroy(); // Destroy existing chart before creating a new one
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['WPM', 'Accuracy'],
            datasets: [{
                label: 'Your Performance',
                data: [wpm, accuracy],
                backgroundColor: [
                    'rgba(0, 255, 209, 0.6)', // Neon for WPM
                    'rgba(124, 255, 0, 0.6)'  // Accent for Accuracy
                ],
                borderColor: [
                    'rgba(0, 255, 209, 1)',
                    'rgba(124, 255, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + (context.label === 'Accuracy' ? '%' : '');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Displays the results screen with final stats.
 * @param {object} stats - { score, accuracy, wpm }
 */
function displayResults({ score, accuracy, wpm }) {
    elements.resultsScore.textContent = score;
    elements.resultsAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    elements.resultsWpm.textContent = wpm.toFixed(1);
    renderResultsChart({ accuracy, wpm }); // Render the chart
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

/**
 * Toggles the theme between light and dark.
 * @param {boolean} isLight - True to set light theme, false for dark.
 */
function toggleTheme(isLight) {
    if (isLight) {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
}

/**
 * Shares game results on Twitter.
 * @param {object} stats - { score, accuracy, wpm }
 */
function shareOnTwitter({ score, accuracy, wpm }) {
    const text = `I scored ${score} points with ${accuracy.toFixed(1)}% accuracy and ${wpm.toFixed(1)} WPM in AncientTech Typing Game! Can you beat my score? #AncientTechTypingGame`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

let historyChartInstance = null;

/**
 * Renders a line chart with historical game results.
 * @param {Array<object>} results - An array of historical game results.
 */
function renderHistoricalChart(results) {
    const ctx = elements.historyChart.getContext('2d');

    if (historyChartInstance) {
        historyChartInstance.destroy();
    }

    const labels = results.map((_, index) => `Game ${index + 1}`);
    const wpmData = results.map(r => r.wpm);
    const accuracyData = results.map(r => r.accuracy);

    historyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'WPM',
                    data: wpmData,
                    borderColor: 'var(--neon)',
                    backgroundColor: 'rgba(0, 255, 209, 0.2)',
                    tension: 0.3,
                    fill: true,
                },
                {
                    label: 'Accuracy',
                    data: accuracyData,
                    borderColor: 'var(--accent)',
                    backgroundColor: 'rgba(124, 255, 0, 0.2)',
                    tension: 0.3,
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--text)'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + (context.dataset.label === 'Accuracy' ? '%' : '');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Shows the historical results screen.
 */
function showHistoryScreen() {
    elements.historyScreen.classList.remove('hidden');
}

/**
 * Hides the historical results screen.
 */
function hideHistoryScreen() {
    elements.historyScreen.classList.add('hidden');
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
    toggleTheme,
    shareOnTwitter,
    showHistoryScreen,
    hideHistoryScreen,
    focusInput: () => elements.hiddenInput.focus(),
};
