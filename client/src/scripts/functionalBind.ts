import {color} from "../Colors";
import Client from "../Client";

export class FunctionalBind {

    private client: Client;
    private functionalBind = () => {}
    private button?: HTMLInputElement

    constructor(client: Client) {
        this.client = client;
        window.addEventListener('keydown', (ev) => {
            if (ev.code === 'BracketRight') {
                this.functionalBind();
                ev.preventDefault()
            }
        })
    }

    set(printable, callback) {
        this.functionalBind = callback
        this.client.println(`\t${color(49)}bind ${color(222)}]${color(49)}: ${printable}`)
        this.button = this.client.createButton("napij sie do syta wody", () => Input.send("napij sie do syta wody"))
    }

    clear() {
        this.functionalBind = () => {};
        this?.button?.remove()
    }

}