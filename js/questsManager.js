/**
 * questsManager.js
 * 
 * Manages loading, tracking, and completing quests.
 */

let allQuests = [];
let activeQuests = [];

/**
 * Loads quest definitions from the JSON file.
 */
async function init() {
    try {
        const response = await fetch('data/quests.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.quests)) {
            throw new Error('Invalid quests data format.');
        }
        allQuests = data.quests;
        reset();
        console.log("Quests manager initialized.");
    } catch (error) {
        console.error("Error initializing quests manager:", error);
        allQuests = [];
        throw error; // Re-throw
    }
}

/**
 * Resets active quests for a new game, selecting a few random ones.
 * @param {number} count - The number of quests to activate for the round.
 */
function reset(count = 3) {
    // Simple selection: take the first `count` quests that are not completed.
    // A more advanced implementation could be random.
    activeQuests = allQuests.slice(0, count).map(q => ({ ...q, completed: false, progress: 0 }));
}

/**
 * Checks game events and stats against active quest conditions.
 * @param {string} eventType - The type of event (e.g., 'phrase_complete', 'stat_update').
 * @param {object} data - The data associated with the event.
 * @returns {Array<object>} A list of newly completed quests.
 */
function check(eventType, data) {
    const newlyCompletedQuests = [];

    activeQuests.forEach(quest => {
        if (quest.completed) return;

        let questCompleted = false;
        switch (quest.type) {
            case 'no_miss':
                if (eventType === 'phrase_complete' && data.misses === 0) {
                    quest.progress = (quest.progress || 0) + 1;
                    if(quest.progress >= quest.condition.count) questCompleted = true;
                }
                break;
            
            case 'combo':
                if (eventType === 'stat_update' && data.combo >= quest.condition.target) {
                    questCompleted = true;
                }
                break;

            case 'phrases_completed':
                if (eventType === 'phrase_complete') {
                    quest.progress = (quest.progress || 0) + 1;
                    if (quest.progress >= quest.condition.count) questCompleted = true;
                }
                break;

            case 'accuracy':
                if (eventType === 'game_end' && data.accuracy >= quest.condition.target) {
                    questCompleted = true;
                }
                break;

            case 'difficulty_specific':
                if (eventType === 'game_end' && data.difficulty === quest.condition.difficulty) {
                    questCompleted = true;
                }
                break;
        }

        if (questCompleted) {
            quest.completed = true;
            newlyCompletedQuests.push(quest);
        }
    });

    return newlyCompletedQuests;
}

/**
 * Gets the current state of active quests.
 * @returns {Array<object>} The list of active quests.
 */
function getActiveQuests() {
    return activeQuests;
}

export const questsManager = {
    init,
    reset,
    check,
    getActiveQuests,
};
