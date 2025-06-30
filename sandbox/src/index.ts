import "./sandbox.ts"
import "@client/src/main.ts"

import npc from "./npc.json";
import mapData from "../../data/mapExport.json";
import colors from "../../data/colors.json";
import { fakeClient } from "./fakeClient.ts";

const defaultSettings = {
    guilds: [],
    packageHelper: true,
    inlineCompassRose: true,
    prettyContainers: true,
    containerColumns: 2
}

localStorage.setItem('npc', JSON.stringify(npc))
localStorage.setItem('settings', JSON.stringify(defaultSettings))

if (!localStorage.getItem('kill_counter')) {
    localStorage.setItem('kill_counter', JSON.stringify({}))
}

fakeClient.eventTarget.dispatchEvent(new CustomEvent("npc", {detail: npc}));
const frame: HTMLIFrameElement = document.getElementById("cm-frame")! as HTMLIFrameElement;
frame.contentWindow?.postMessage({mapData, colors}, '*')

window.dispatchEvent(new CustomEvent("extension-ready"));
window.dispatchEvent(new CustomEvent("map-ready", {
    detail: {
        mapData, colors
    }
}));

fakeClient.eventTarget.dispatchEvent(new CustomEvent("gmcp.room.info", {
    detail: {map: {x: 80, y: 89, z: 0, name: "Wissenland"}}
}));

const wrapper = document.getElementById('main_text_output_msg_wrapper')!;

function applyGmcpColumn() {
    if (localStorage.getItem('gmcpColumn') === '1') {
        wrapper.classList.add('show-gmcp-column');
    } else {
        wrapper.classList.remove('show-gmcp-column');
    }
}

applyGmcpColumn();

wrapper.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = `${ev.clientY}px`;
    menu.style.left = `${ev.clientX}px`;
    menu.style.background = '#333';
    menu.style.color = '#fff';
    menu.style.padding = '4px 8px';
    menu.style.fontSize = '12px';
    menu.style.border = '1px solid #555';
    menu.style.cursor = 'pointer';
    menu.textContent = wrapper.classList.contains('show-gmcp-column')
        ? 'Hide GMCP column'
        : 'Show GMCP column';
    document.body.appendChild(menu);

    const removeMenu = () => {
        menu.remove();
        document.removeEventListener('click', removeMenu);
    };

    menu.addEventListener('click', () => {
        if (wrapper.classList.toggle('show-gmcp-column')) {
            localStorage.setItem('gmcpColumn', '1');
        } else {
            localStorage.removeItem('gmcpColumn');
        }
        removeMenu();
    });

    document.addEventListener('click', removeMenu);
});
