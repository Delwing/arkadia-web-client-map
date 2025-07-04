import './style.css'
import ArkadiaClient from "./ArkadiaClient.ts";
import "./plugin.ts"
import "@client/src/main.ts"
import MockPort from "../MockPort.ts";

import npc from "../npc.json";
import mapData from "../../../data/mapExport.json";
import colors from "../../../data/colors.json";


const client = ArkadiaClient

const defaultSettings = {
    guilds: [],
    packageHelper: true,
    inlineCompassRose: false,
    prettyContainers: true,
    containerColumns: 2,
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


// Set up message event listener for UI updates
client.on('message', (message: string) => {
    // Get the content area element
    const contentArea = document.getElementById('main_text_output_msg_wrapper');
    if (contentArea) {
        // Create a new div for the message
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = message
        messageDiv.classList.add('output_msg_text');
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.whiteSpace = 'pre-wrap';

        contentArea.appendChild(messageDiv);
        contentArea.scrollTop = contentArea.scrollHeight;
    }
});

client.on('client.connect', () => {

})
client.connect()

const frame: HTMLIFrameElement = document.getElementById("cm-frame")! as HTMLIFrameElement;
frame.contentWindow?.postMessage({mapData, colors}, '*')


// Numpad key mapping for directions
// Numpad key mapping for directions
const numpadDirections: { [key: string]: string } = {
    'Numpad8': 'n',      // North
    'Numpad2': 's',      // South
    'Numpad4': 'w',      // West
    'Numpad6': 'e',      // East
    'Numpad7': 'nw',     // Northwest
    'Numpad9': 'ne',     // Northeast
    'Numpad1': 'sw',     // Southwest
    'Numpad3': 'se',     // Southeast
    'NumpadMultiply': 'u',   // Up (+ key)
    'NumpadSubtract': '',
    'Numpad5': 'zerknij'
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

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            Input.send(message);
            // Keep the text in the input field and select it
            messageInput.select();
        }
    }

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Scroll to bottom when input field is focused
    messageInput.addEventListener('focus', () => {
        const contentArea = document.getElementById('main_text_output_msg_wrapper');
        if (contentArea) {
            contentArea.scrollTop = contentArea.scrollHeight;
        }
    });
});

// @ts-ignore
window.client = client
