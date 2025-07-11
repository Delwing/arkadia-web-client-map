import { FakeClient } from "./types/globals";
import {color, findClosestColor} from "@client/src/Colors.ts";

export default class ClientScript {
    actions: Array<() => Promise<void> | void> = [];
    constructor(private client: FakeClient) {}

    fake(text: string, type?: string) {
        text = color(findClosestColor("#666666")) + text
        this.actions.push(() => this.client.fake(text, type));
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

    eval(expression: string) {
        this.actions.push(() => {
            try {
                // eslint-disable-next-line no-new-func
                const value = new Function('return (' + expression + ')').call(window);
                this.client.print(value as any);
            } catch (err) {
                this.client.println(String(err));
            }
        });
        return this;
    }

    setMapPosition(position: number) {
        this.actions.push(() => {
            this.event("enterLocation", {room: {id: position}});
            this.client.Map.setMapRoomById(position);
        })
        return this;
    }

    wait(ms: number) {
        this.actions.push(() => new Promise(res => setTimeout(res, ms)));
        return this;
    }

    call(fn: () => void) {
        this.actions.push(fn);
        return this;
    }

    async run() {
        for (const act of this.actions) {
            await act();
        }
    }

    reset() {
        this.actions.push(() => window.Output.clear())
        return this;
    }
}
