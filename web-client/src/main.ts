import 'bootswatch/dist/darkly/bootstrap.min.css';
import './style.css'
import ArkadiaClient from "./ArkadiaClient.ts";
import "./plugin.ts"
import { Modal, Dropdown } from 'bootstrap';
import CharState from "./CharState";

import "@client/src/main.ts"
import MockPort from "./MockPort.ts";
import { loadMapData, loadColors } from "./mapDataLoader.ts";
import { loadNpcData } from "./npcDataLoader.ts";
import "@map/embedded.js"
const client = ArkadiaClient

import { createElement } from 'react'
import { createRoot} from 'react-dom/client'
import App from "@options/src/App.tsx"

// Prevent tab sleep on mobile when switching tabs
let noSleepAudio: HTMLAudioElement | null = null;
let wakeLock: any = null;
let tabSleepPreventionActive = false;

// Function to prevent tab sleep
function preventTabSleep() {
    // If already active, don't activate again
    if (tabSleepPreventionActive) return;

    tabSleepPreventionActive = true;

    // Create silent audio element if it doesn't exist
    if (!noSleepAudio) {
        noSleepAudio = document.createElement('audio');
        noSleepAudio.setAttribute('playsinline', '');
        noSleepAudio.setAttribute('src', 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA='); // 1ms silent audio
        noSleepAudio.loop = true;
        document.body.appendChild(noSleepAudio);
    }

    // Try to use Wake Lock API if available
    if ('wakeLock' in navigator) {
        try {
            // @ts-ignore - TypeScript might not recognize wakeLock API
            navigator.wakeLock.request('screen').then((lock: any) => {
                wakeLock = lock;
                console.log('Wake Lock activated');

                // Release wake lock when page is hidden
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible' && !wakeLock) {
                        // @ts-ignore
                        navigator.wakeLock.request('screen').then((lock: any) => {
                            wakeLock = lock;
                            console.log('Wake Lock reactivated');
                        });
                    }
                });
            }).catch((err: any) => {
                console.error('Wake Lock error:', err);
                // Fallback to audio method if Wake Lock fails
                playNoSleepAudio();
            });
        } catch (err) {
            console.error('Wake Lock error:', err);
            // Fallback to audio method if Wake Lock fails
            playNoSleepAudio();
        }
    } else {
        // Fallback to audio method if Wake Lock is not supported
        playNoSleepAudio();
    }
}

// Function to play silent audio to prevent sleep
function playNoSleepAudio() {
    if (noSleepAudio) {
        // Play audio when page becomes visible or hidden
        document.addEventListener('visibilitychange', () => {
            if (noSleepAudio) {
                if (document.visibilityState === 'hidden') {
                    noSleepAudio.play().catch(err => console.error('Audio play error:', err));
                } else {
                    // Keep playing even when visible to maintain the audio context
                    noSleepAudio.play().catch(err => console.error('Audio play error:', err));
                }
            }
        });

        // Initial play (requires user interaction)
        document.addEventListener('touchstart', () => {
            if (noSleepAudio && noSleepAudio.paused) {
                noSleepAudio.play().catch(err => console.error('Audio play error:', err));
            }
        }, { once: true });
    }
}

loadNpcData().then(npc => {
    window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}))
})

const port = new MockPort();
window.clientExtension.connect(port as any, true);

const progressContainer = document.getElementById('map-progress-container')!;
const progressBar = document.getElementById('map-progress-bar') as HTMLElement;

progressContainer.style.display = 'none';

function updateProgress(p: number, loaded?: number, total?: number) {
    progressContainer.style.display = 'block';
    progressBar.style.width = `${p}%`;
    if (loaded !== undefined && total !== undefined && total > 0) {
        const loadedKb = Math.floor(loaded / 1024);
        const totalKb = Math.ceil(total / 1024);
        progressBar.textContent = `${loadedKb} / ${totalKb} KB`;
    } else {
        progressBar.textContent = `${Math.floor(p)}%`;
    }
}

// Load map data and colors asynchronously
let mapDataPromise = loadMapData(updateProgress);
let colorsPromise = loadColors();

// When both are loaded, dispatch events
Promise.all([mapDataPromise, colorsPromise])
    .then(([mapData, colors]) => {
        console.log('Map data and colors loaded successfully');

        progressContainer.style.display = 'none';

        // Dispatch map-ready event
        window.dispatchEvent(new CustomEvent("map-ready", {
            detail: {
                mapData, colors
            }
        }));

        // Send map data to iframe
        window.postMessage({mapData, colors}, '*');
    })
    .catch(error => {
        progressContainer.style.display = 'none';
        console.error('Failed to load map data or colors:', error);
    });


// Set up message event listener for UI updates
client.on('message', (message: string, type?: string) => {
    const contentArea = document.getElementById('main_text_output_msg_wrapper');
    if (contentArea) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('output_msg');

        // Add GMCP message type as class if provided
        if (type) {
            wrapper.classList.add(type);
        }

        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = message;
        messageDiv.classList.add('output_msg_text');
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.whiteSpace = 'pre-wrap';

        wrapper.appendChild(messageDiv);
        contentArea.appendChild(wrapper);
        contentArea.scrollTop = contentArea.scrollHeight;
    }
});

// Track connection state
let isConnected = false;

// Function to update the connect button state
function updateConnectButton() {
    const connectButton = document.getElementById('connect-button') as HTMLButtonElement;
    if (connectButton) {
        if (isConnected) {
            connectButton.style.display = 'none'; // Hide button when connected
        } else {
            connectButton.style.display = ''; // Show button when disconnected
            connectButton.textContent = 'Connect';
            connectButton.classList.add('disconnected');
            connectButton.classList.remove('connected');
        }
    }
}

// Handle client connect event
client.on('client.connect', () => {
    isConnected = true;
    updateConnectButton();
    console.log('Client connected to Arkadia server.');
});

// Handle client disconnect event
client.on('client.disconnect', () => {
    isConnected = false;
    updateConnectButton();
    console.log('Client disconnected from Arkadia server.');
});


// Numpad key mapping for directions (reversed)
const numpadDirections: { [key: string]: string } = {
    'Numpad8': 's',      // South (reversed from North)
    'Numpad2': 'n',      // North (reversed from South)
    'Numpad4': 'e',      // East (reversed from West)
    'Numpad6': 'w',      // West (reversed from East)
    'Numpad7': 'se',     // Southeast (reversed from Northwest)
    'Numpad9': 'sw',     // Southwest (reversed from Northeast)
    'Numpad1': 'ne',     // Northeast (reversed from Southwest)
    'Numpad3': 'nw',     // Northwest (reversed from Southeast)
    'NumpadMultiply': 'u',   // Up (unchanged)
    'NumpadSubtract': '',
    'Numpad5': 'zerknij'  // Look (unchanged)
};

// Add global keydown event listener for numpad directions
document.addEventListener('keydown', (e) => {
    // Check if the pressed key is a numpad direction key
    if (numpadDirections[e.code]) {
        // Prevent default behavior
        e.preventDefault();

        // Send the direction command
        const direction = numpadDirections[e.code];
        Input.send(direction);

        console.log(`Numpad direction sent: ${direction}`);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Activate tab sleep prevention for mobile devices
    if (window.innerWidth < 768) {
        preventTabSleep();
        console.log('Tab sleep prevention activated for mobile device');
    }

    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const sendButton = document.getElementById('send-button') as HTMLButtonElement;
    const connectButton = document.getElementById('connect-button') as HTMLButtonElement;
    const menuButton = document.getElementById('menu-button') as HTMLButtonElement | null;
    const optionsButton = document.getElementById('options-button') as HTMLButtonElement;

    // Initialize Bootstrap modal
    const optionsModalElement = document.getElementById('options-modal');
    const optionsModal = optionsModalElement ? new Modal(optionsModalElement) : null;

    if (menuButton) {
        new Dropdown(menuButton);
    }

    window.addEventListener('close-options', () => {
        if (optionsModal) {
            optionsModal.hide();
        }
    });

    // Add event listener to options button
    if (optionsButton && optionsModal) {
        optionsButton.addEventListener('click', () => {
            optionsModal.show();
        });
    }

    // Command history implementation
    const commandHistory: string[] = [];
    let historyIndex = -1;
    let currentInput = '';

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Only add command to history if we've received the first GMCP event
            if (client.hasReceivedFirstGmcp()) {
                // Add command to history if it's different from the last one
                if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== message) {
                    commandHistory.push(message);
                }
                // Reset history index
                historyIndex = -1;
                currentInput = '';

                Input.send(message);
                messageInput.select();
            } else {
                // If we haven't received the first GMCP event yet, clear the input field
                Input.send(message);
                messageInput.value = '';
            }
        }
    }

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Handle up/down arrow keys for command history
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent cursor from moving

            // Only allow command history navigation if we've received the first GMCP event
            if (!client.hasReceivedFirstGmcp()) return;

            if (commandHistory.length === 0) return;

            // Save current input if we're just starting to navigate history
            if (historyIndex === -1) {
                currentInput = messageInput.value;
            }

            if (e.key === 'ArrowUp') {
                // Navigate backward in history
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    messageInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
                    messageInput.select();
                }
            } else if (e.key === 'ArrowDown') {
                // Navigate forward in history
                if (historyIndex > 0) {
                    historyIndex--;
                    messageInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
                    messageInput.select();
                } else if (historyIndex === 0) {
                    // Return to current input when reaching the end of history
                    historyIndex = -1;
                    messageInput.value = currentInput;
                    messageInput.select();
                }
            }
        }
    });

    // Scroll to bottom when input field is focused
    messageInput.addEventListener('focus', () => {
        const contentArea = document.getElementById('main_text_output_msg_wrapper');
        if (contentArea) {
            contentArea.scrollTop = contentArea.scrollHeight;
        }
    });

    // Handle connect/disconnect button click
    connectButton.addEventListener('click', () => {
        if (isConnected) {
            client.disconnect();
        } else {
            client.connect();
        }
    });

    // Initialize button state
    updateConnectButton();

    // Display character state
    new CharState(window.clientExtension);

    // Initialize mobile direction buttons
    new MobileDirectionButtons(window.clientExtension);

    const rootElement = document.getElementById('options');
    if (rootElement) {
        createRoot(rootElement).render(createElement(App));
    }
});

// Add resize event listener to check if device becomes mobile-sized
window.addEventListener('resize', () => {
    // Check if device is mobile-sized and tab sleep prevention is not active
    if (window.innerWidth < 768 && !tabSleepPreventionActive) {
        preventTabSleep();
        console.log('Tab sleep prevention activated on resize for mobile device');
    }
});

// @ts-ignore
window.client = client

import MobileDirectionButtons from "./scripts/mobileDirectionButtons"
