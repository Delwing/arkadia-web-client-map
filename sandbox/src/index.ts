import "./sandbox.ts"
import "@client/src/main.ts"

import npc from "./npc.json";
import mapData from "../../data/mapExport.json";
import colors from "../../data/colors.json";
import { client } from "@client/src/main.ts";
import { FakeClient } from "./types/globals";
import MockPort from "./MockPort.ts";

export const fakeClient = client as FakeClient

const port = new MockPort()
fakeClient.connect(port as any)

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

const originalDispatch = fakeClient.eventTarget.dispatchEvent.bind(fakeClient.eventTarget)
fakeClient.eventTarget.dispatchEvent = (event: Event) => {
    if (event.type.startsWith('gmcp\.')) {
        const detail = (event as CustomEvent).detail
        let text = ''
        try {
            text = detail !== undefined ? JSON.stringify(detail, null, 2) : ''
        } catch (e) {
            text = String(detail)
        }
        fakeClient.print(`${event.type}${text ? ' ' + text : ''}`)
        const wrapper = document.getElementById('main_text_output_msg_wrapper')!
        const last = wrapper.lastElementChild as HTMLElement | null
        if (last) {
            last.classList.add('gmcp-event')
        }
    }
    return originalDispatch(event)
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

fakeClient.fake = (text: string, type?: string) => {
    client.sendEvent("gmcp_msg." + type, {})
    window.Output.send(window.Text.parse_patterns(client.onLine(text, type)), type)
}

