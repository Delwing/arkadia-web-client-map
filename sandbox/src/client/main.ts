import './style.css'
import ArkadiaClient from "./ArkadiaClient.ts";
import "./plugin.ts"
import "@client/src/main.ts"

import npc from "../npc.json";
import mapData from "../../../data/mapExport.json";
import colors from "../../../data/colors.json";
import MockPort from "../MockPort.ts";

const client = ArkadiaClient

const defaultSettings = {
    guilds: [],
    packageHelper: true,
    inlineCompassRose: true,
    prettyContainers: true,
    containerColumns: 2,
    collectMode: 3,
    collectMoneyType: 1,
    collectExtra: []
}

localStorage.setItem('npc', JSON.stringify(npc))
localStorage.setItem('settings', JSON.stringify(defaultSettings))

const port = new MockPort();
window.clientExtension.connect(port as any);

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
    client.send("delwing")
    client.send("come2papa")
})
client.connect()


document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const sendButton = document.getElementById('send-button') as HTMLButtonElement;

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            Input.send(message);
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// @ts-ignore
window.client = client
