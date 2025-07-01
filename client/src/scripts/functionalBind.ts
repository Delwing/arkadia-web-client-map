import {color} from "../Colors";
import Client from "../Client";

export interface FunctionalBindOptions {
    key?: string;
    label?: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
}

export class FunctionalBind {

    private client: Client;
    private functionalBind = () => {};
    private button?: HTMLInputElement;
    private key: string;
    private label: string;
    private ctrl: boolean;
    private alt: boolean;
    private shift: boolean;

    constructor(client: Client, options: FunctionalBindOptions = {}) {
        this.client = client;
        this.key = options.key ?? 'BracketRight';
        this.label = options.label ?? (this.key === 'BracketRight' ? ']' : this.key);
        this.ctrl = !!options.ctrl;
        this.alt = !!options.alt;
        this.shift = !!options.shift;
        window.addEventListener('keydown', (ev) => {
            if (
                ev.code === this.key &&
                (!!this.ctrl === ev.ctrlKey) &&
                (!!this.alt === ev.altKey) &&
                (!!this.shift === ev.shiftKey)
            ) {
                this.functionalBind();
                ev.preventDefault();
            }
        })
    }

    set(printable: string | null, callback: () => void) {
        this.functionalBind = callback;
        this.button?.remove();
        if (printable) {
            this.client.println(`\t${color(49)}bind ${color(222)}${this.label}${color(49)}: ${printable}`);
            this.button = this.client.createButton(printable, callback);
        }
    }

    clear() {
        this.functionalBind = () => {};
        this?.button?.remove();
    }

}