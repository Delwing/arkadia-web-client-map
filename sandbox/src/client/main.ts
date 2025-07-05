import './style.css'
import ArkadiaClient from "./ArkadiaClient.ts";
import "./plugin.ts"
import "@client/src/main.ts"
import MockPort from "../MockPort.ts";

import npc from "../npc.json";
import mapData from "../../../data/mapExport.json";
import colors from "../../../data/colors.json";
import "@map/embedded.js"
const client = ArkadiaClient

const defaultSettings = {
    guilds: [],
    packageHelper: true,
    inlineCompassRose: false,
    prettyContainers: true,
    containerColumns: 1,
    collectMode: 3,
    collectMoneyType: 1,
    collectExtra: []
}

localStorage.setItem('npc', JSON.stringify(npc))
localStorage.setItem('settings', JSON.stringify(defaultSettings))

const port = new MockPort();
window.clientExtension.connect(port as any, true);

window.dispatchEvent(new CustomEvent("map-ready", {
    detail: {
        mapData, colors
    }
}));

window.clientExtension.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}))


// Set up message event listener for UI updates
client.on('message', (message: string) => {
    const contentArea = document.getElementById('main_text_output_msg_wrapper');
    if (contentArea) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('output_msg');

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
            connectButton.textContent = 'Disconnect';
            connectButton.classList.add('connected');
            connectButton.classList.remove('disconnected');
        } else {
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


window.postMessage({mapData, colors}, '*')


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
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const sendButton = document.getElementById('send-button') as HTMLButtonElement;
    const connectButton = document.getElementById('connect-button') as HTMLButtonElement;

    // Command history implementation
    const commandHistory: string[] = [];
    let historyIndex = -1;
    let currentInput = '';

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add command to history if it's not the same as the last one
            if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== message) {
                commandHistory.push(message);
            }
            // Reset history index
            historyIndex = -1;
            currentInput = '';

            Input.send(message);
            messageInput.select();
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
});

// @ts-ignore
window.client = client
