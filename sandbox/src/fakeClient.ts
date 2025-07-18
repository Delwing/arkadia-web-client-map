import { registerScripts } from "@client/src/main.ts";
import Client, { ClientAdapter } from "@client/src/Client.ts";
import { FakeClient } from "./types/globals";
import MockPort from "./MockPort.ts";

class SandboxAdapter implements ClientAdapter {
    send(text: string, echo: boolean = true): void {
        if (echo) {
            window.Input.send(text);
        } else {
            window.Input.send(text);
        }
    }

    output(text?: string, type?: string): void {
        window.Output.send(text, type);
    }

    sendGmcp(type: string, payload?: any): void {
        // no-op in sandbox
    }
}

const port = new MockPort();
const adapter = new SandboxAdapter();
export const fakeClient = new Client(adapter, port) as FakeClient;
registerScripts(fakeClient);
fakeClient.connect(port as any, true);

//TODO fix dispatch
const originalDispatch = fakeClient.eventTarget.dispatchEvent.bind(fakeClient.eventTarget);
fakeClient.eventTarget.dispatchEvent = (event: Event) => {
    if (event.type.startsWith('gmcp.')) {
        const detail = (event as CustomEvent).detail;
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
    window.Output.send(window.Text.parse_patterns(fakeClient.onLine(text, type)), type);
    fakeClient.sendEvent('gmcp_msg.' + type, text);
};
