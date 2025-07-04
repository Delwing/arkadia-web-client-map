import { client } from "@client/src/main.ts";
import { FakeClient } from "./types/globals";
import MockPort from "./MockPort.ts";
import { setGmcp } from "@client/src/gmcp.ts";

export const fakeClient = client as FakeClient;

const port = new MockPort();
fakeClient.connect(port as any, true);

const originalDispatch = fakeClient.eventTarget.dispatchEvent.bind(fakeClient.eventTarget);
fakeClient.eventTarget.dispatchEvent = (event: Event) => {
    if (event.type.startsWith('gmcp.')) {
        const detail = (event as CustomEvent).detail;
        setGmcp(event.type.replace(/^gmcp\./, ''), detail);
        let text: string;
        try {
            text = detail !== undefined ? JSON.stringify(detail, null, 2) : '';
        } catch (e) {
            text = String(detail);
        }
        fakeClient.print(`${event.type}${text ? ' ' + text : ''}`);
        const wrapper = document.getElementById('main_text_output_msg_wrapper')!;
        const last = wrapper.lastElementChild as HTMLElement | null;
        if (last) {
            last.classList.add('gmcp-event');
        }
    } else if (event.type.startsWith('gmcp_msg.')) {
        const wrapper = document.getElementById('main_text_output_msg_wrapper')!;
        const last = wrapper.lastElementChild as HTMLElement | null;
        if (last) {
            last.classList.add('gmcp-msg');
            last.setAttribute('data-gmcp-type', event.type.replace(/^gmcp_msg\./, ''));
        }

    }
    return originalDispatch(event);
};
fakeClient.fake = (text: string, type?: string) => {
    window.Output.send(window.Text.parse_patterns(client.onLine(text, type)), type);
    client.sendEvent('gmcp_msg.' + type, text);
};
