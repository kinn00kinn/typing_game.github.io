/**
 * audioManager.js
 * 
 * Handles loading and playing all sound effects for the game.
 * It includes controls for muting and pre-loading audio assets.
 */

const SOUNDS = {
    type: 'assets/audio/type.ogg',      // Placeholder path
    miss: 'assets/audio/miss.ogg',      // Placeholder path
    success: 'assets/audio/success.ogg',  // Placeholder path
    quest: 'assets/audio/quest.ogg',      // Placeholder path
    start: 'assets/audio/start.ogg',      // Placeholder path
    end: 'assets/audio/end.ogg'          // Placeholder path
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};
let isMuted = false;
let isInitialized = false;

/**
 * Loads all audio files into buffers for fast playback.
 */
async function init() {
    isInitialized = true;
    console.log("Audio manager is disabled. Game will run without sound.");
    return Promise.resolve();
}

/**
 * Plays a sound from the pre-loaded buffers.
 * @param {string} name - The name of the sound to play (e.g., 'type', 'miss').
 */
function play(name) {
    // Audio is disabled, do nothing.
    return;
}

function toggleMute(muteState) {
    isMuted = typeof muteState === 'boolean' ? muteState : !isMuted;
}

export const audioManager = {
    init,
    play,
    toggleMute,
    isMuted: () => isMuted,
};
