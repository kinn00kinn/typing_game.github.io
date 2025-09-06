/**
 * inputManager.js
 * 
 * Manages all user input, including handling for IMEs (Input Method Editors) 
 * for languages like Japanese. It listens to a hidden input field and dispatches 
 * custom events for the game controller to consume.
 */

const hiddenInput = document.getElementById('hidden-input');
let isComposing = false; // Tracks IME composition status

/**
 * Initializes the input manager by attaching event listeners.
 * @param {function} onInput - Callback for when input is received.
 * @param {function} onCommit - Callback for when a full phrase is submitted (e.g., by Enter).
 */
function init(onInput, onCommit) {
    if (!hiddenInput) {
        console.error("Fatal: Hidden input field not found.");
        return;
    }

    // Fires for every change, including individual characters and IME composition results.
    hiddenInput.addEventListener('input', (event) => {
        // If an IME is active, we wait for it to 'commit' the final characters.
        // Otherwise, we process the input directly.
        if (!isComposing) {
            onInput(event.target.value);
        }
    });

    // Fires when the user presses Enter.
    hiddenInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onCommit(hiddenInput.value);
        }
    });

    // --- IME Handling --- //

    // Fires when an IME composition session starts (e.g., user starts typing in Japanese).
    hiddenInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    // Fires when the composition session ends (e.g., user hits Enter to confirm Japanese text).
    hiddenInput.addEventListener('compositionend', (event) => {
        isComposing = false;
        // After composition ends, an 'input' event will fire with the resulting text.
        // We trigger the onInput callback here to ensure the final text is processed immediately.
        onInput(event.target.value);
    });
}

/**
 * Gets the current value of the hidden input.
 * @returns {string} The current input text.
 */
function getValue() {
    return hiddenInput.value;
}

/**
 * Clears the hidden input field.
 */
function clear() {
    hiddenInput.value = '';
}

/**
 * Sets focus to the hidden input field.
 */
function focus() {
    hiddenInput.focus();
}

export const inputManager = {
    init,
    getValue,
    clear,
    focus,
};
