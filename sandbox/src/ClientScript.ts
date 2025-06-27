import { FakeClient } from "./types/globals";

export default class ClientScript {
    actions: Array<() => Promise<void> | void> = [];
    constructor(private client: FakeClient) {}

    fake(text: string, type?: string) {
        this.actions.push(() => (this.client as any).fake(text, type));
        return this;
    }

    event(name: string, detail?: any) {
        this.actions.push(() => {
            this.client.eventTarget.dispatchEvent(new CustomEvent(name, { detail }));
        });
        return this;
    }

    send(command: string) {
        this.actions.push(() => window.Input.send(command));
        return this;
    }

    wait(ms: number) {
        this.actions.push(() => new Promise(res => setTimeout(res, ms)));
        return this;
    }

    async run() {
        for (const act of this.actions) {
            await act();
        }
        this.actions = [];
    }
}
