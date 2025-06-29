import "./sandbox.ts"
import "@client/src/main.ts"

import npc from "./npc.json";
import mapData from "../../data/mapExport.json";
import colors from "../../data/colors.json";
import { fakeClient } from "./fakeClient.ts";

const defaultSettings = {
    guilds: [],
    packageHelper: true,
    inlineCompassRose: true
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
