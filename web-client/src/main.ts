import 'bootswatch/dist/darkly/bootstrap.min.css';
import './style.css'
import ArkadiaClient from "./ArkadiaClient.ts";
import "./plugin.ts"
import { Modal, Dropdown } from 'bootstrap';
import CharState from "./CharState";
import ObjectList from "./ObjectList";
import LampTimer from "./LampTimer";

import "@client/src/main.ts"
import MockPort from "./MockPort.ts";
import NoSleep from 'nosleep.js';
import { loadMapData, loadColors } from "./mapDataLoader.ts";
import { loadNpcData } from "./npcDataLoader.ts";
import "@map/embedded.js"
const client = ArkadiaClient

import { createElement } from 'react'
import { createRoot} from 'react-dom/client'
import Binds from "@options/src/Binds.tsx"
import Npc from "@options/src/Npc.tsx"

// Prevent tab sleep on mobile when switching tabs
let noSleepInstance: NoSleep | null = null;
let tabSleepPreventionActive = false;
let wakeLockEnabled = false;
let wakeLockButton: HTMLButtonElement | null = null;

function updateWakeLockButton() {
    if (wakeLockButton) {
        wakeLockButton.textContent = wakeLockEnabled ? 'NoSleep ON' : 'NoSleep OFF';
    }
}

// Function to prevent tab sleep
function preventTabSleep() {
    // If already active, don't activate again
    if (tabSleepPreventionActive) return;

    tabSleepPreventionActive = true;

    if (!noSleepInstance) {
        noSleepInstance = new NoSleep();
    }

    const enableNoSleep = () => {
        noSleepInstance!.enable();
        wakeLockEnabled = true;
        updateWakeLockButton();
    };

    document.addEventListener('touchstart', enableNoSleep, { once: true });
    document.addEventListener('click', enableNoSleep, { once: true });
}

function disableTabSleepPrevention() {
    if (!tabSleepPreventionActive) return;
    tabSleepPreventionActive = false;
    if (noSleepInstance) {
        noSleepInstance.disable();
    }
    wakeLockEnabled = false;
    updateWakeLockButton();
}

loadNpcData().then(npc => {
    window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}))
})

const port = new MockPort();
window.clientExtension.connect(port as any, true);

const progressContainer = document.getElementById('map-progress-container')!;
const progressBar = document.getElementById('map-progress-bar') as HTMLElement;

progressContainer.style.display = 'none';

const outputWrapper = document.getElementById('main_text_output_msg_wrapper') as HTMLElement;
const scrollArea = document.getElementById('scroll-area') as HTMLElement;
const splitBottom = document.getElementById('split-bottom') as HTMLElement;
const stickyArea = document.getElementById('sticky-area') as HTMLElement;
let isSplitView = false;

function checkSplitView() {
    if (outputWrapper.scrollTop + outputWrapper.clientHeight >= outputWrapper.scrollHeight - 1) {
        if (isSplitView) {
            isSplitView = false;
            splitBottom.classList.add('split-hidden');
            stickyArea.innerHTML = '';
        }
    } else {
        if (!isSplitView) {
            isSplitView = true;
            splitBottom.classList.remove('split-hidden');
        }
    }
}

outputWrapper.addEventListener('scroll', checkSplitView);

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
    const wrapper = document.createElement('div');
    wrapper.classList.add('output_msg');

    if (type) {
        wrapper.classList.add(type);
    }

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    messageDiv.classList.add('output_msg_text');
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.whiteSpace = 'pre-wrap';

    wrapper.appendChild(messageDiv);
    scrollArea.appendChild(wrapper);

    const maxElements = 1000;
    while (scrollArea.childElementCount > maxElements) {
        const first = scrollArea.firstElementChild;
        if (first) {
            scrollArea.removeChild(first);
        } else {
            break;
        }
    }

    if (isSplitView) {
        stickyArea.appendChild(wrapper.cloneNode(true));
    } else {
        outputWrapper.scrollTop = outputWrapper.scrollHeight;
    }
});

// Track connection state
let isConnected = false;

// Function to update the connect button state
function updateConnectButtons() {
    const connectButton = document.getElementById('connect-button') as HTMLButtonElement;
    const authOverlay = document.getElementById('auth-overlay') as HTMLElement | null;
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
    const displayValue = connectButton.style.display;
    document.getElementById('login-button').style.display = displayValue;
    if (authOverlay) {
        authOverlay.style.display = displayValue;
    }
}

// Handle client connect event
client.on('client.connect', () => {
    isConnected = true;
    updateConnectButtons();
    console.log('Client connected to Arkadia server.');
});

// Handle client disconnect event
client.on('client.disconnect', () => {
    isConnected = false;
    updateConnectButtons();
    console.log('Client disconnected from Arkadia server.');
});

// Ensure button state is correct when returning to the tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && client.isSocketOpen()) {
        isConnected = true;
        updateConnectButtons();
    }
});


// Numpad key mapping for directions (standard orientation)
const numpadDirections: { [key: string]: string } = {
    'Numpad8': 'n',      // North
    'Numpad2': 's',      // South
    'Numpad4': 'w',      // West
    'Numpad6': 'e',      // East
    'Numpad7': 'nw',     // Northwest
    'Numpad9': 'ne',     // Northeast
    'Numpad1': 'sw',     // Southwest
    'Numpad3': 'se',     // Southeast
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
    const loginButton = document.getElementById('login-button') as HTMLButtonElement | null;
    const menuButton = document.getElementById('menu-button') as HTMLButtonElement | null;
    const optionsButton = document.getElementById('options-button') as HTMLButtonElement;
    const bindsButton = document.getElementById('binds-button') as HTMLButtonElement | null;
    const npcButton = document.getElementById('npc-button') as HTMLButtonElement | null;
    wakeLockButton = document.getElementById('wake-lock-button') as HTMLButtonElement | null;
    updateWakeLockButton();

    // Initialize Bootstrap modal
    const optionsModalElement = document.getElementById('options-modal');
    const optionsModal = optionsModalElement ? new Modal(optionsModalElement) : null;
    const bindsModalElement = document.getElementById('binds-modal');
    const bindsModal = bindsModalElement ? new Modal(bindsModalElement) : null;
    const npcModalElement = document.getElementById('npc-modal');
    const npcModal = npcModalElement ? new Modal(npcModalElement) : null;
    const loginModalElement = document.getElementById('login-modal');
    const loginModal = loginModalElement ? new Modal(loginModalElement) : null;
    const loginCharacter = document.getElementById('login-character') as HTMLInputElement | null;
    const loginPassword = document.getElementById('login-password') as HTMLInputElement | null;
    const loginForm = document.getElementById('login-form') as HTMLFormElement | null;

    if (menuButton) {
        new Dropdown(menuButton);
    }

    window.addEventListener('close-options', () => {
        if (optionsModal) {
            optionsModal.hide();
        }
        if (bindsModal) {
            bindsModal.hide();
        }
        if (npcModal) {
            npcModal.hide();
        }
    });

    // Add event listener to options button
    if (optionsButton && optionsModal) {
        optionsButton.addEventListener('click', () => {
            optionsModal.show();
        });
    }

    if (bindsButton && bindsModal) {
        bindsButton.addEventListener('click', () => {
            bindsModal.show();
        });
    }

    if (npcButton && npcModal) {
        npcButton.addEventListener('click', () => {
            npcModal.show();
        });
    }

    if (wakeLockButton) {
        wakeLockButton.addEventListener('click', () => {
            if (wakeLockEnabled) {
                disableTabSleepPrevention();
            } else {
                preventTabSleep();
            }
        });
    }

    if (loginButton && loginModal && loginForm) {
        loginButton.addEventListener('click', () => {
            loginModal.show();
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const character = loginCharacter?.value || '';
            const password = loginPassword?.value || '';
            loginModal.hide();

            const sendCreds = () => {
                if (character) Input.send(character);
                if (password) Input.send(password);
                client.off('client.connect', sendCreds);
            };

            if (!isConnected) {
                client.on('client.connect', sendCreds);
                client.connect();
            } else {
                sendCreds();
            }
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
        } else {
            Input.send('');
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
        outputWrapper.scrollTop = outputWrapper.scrollHeight;
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
    updateConnectButtons();

    // Display character state and lamp timer
    new CharState(client);
    new LampTimer(client);
    new ObjectList(window.clientExtension as any);

    // Initialize mobile direction buttons
    new MobileDirectionButtons(window.clientExtension);

    initUiSettings();
  
    const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.error('Failed to enter fullscreen:', err));
            } else {
                document.exitFullscreen().catch(err => console.error('Failed to exit fullscreen:', err));
            }
        });
    }

    const rootElement = document.getElementById('options');
    if (rootElement) {
        createRoot(rootElement).render(createElement(Settings));
    }

    const bindsRoot = document.getElementById('binds-options');
    if (bindsRoot) {
        createRoot(bindsRoot).render(createElement(Binds));
    }

    const npcRoot = document.getElementById('npc-options');
    if (npcRoot) {
        createRoot(npcRoot).render(createElement(Npc));
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
import Settings from "@options/src/Settings.tsx";
import initUiSettings from "./uiSettings";
