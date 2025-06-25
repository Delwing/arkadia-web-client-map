import Triggers from "./Triggers";
import PackageHelper from "./PackageHelper";
import MapHelper from "./MapHelper";
import {Howl} from "howler"
import {FunctionalBind} from "./scripts/functionalBind";
import OutputHandler from "./OutputHandler";

const originalSend = Input.send

export default class Client {

    port: chrome.runtime.Port;
    eventTarget = new EventTarget()
    FunctionalBind = new FunctionalBind(this)
    Triggers = new Triggers(this)
    packageHelper = new PackageHelper(this)
    Map = new MapHelper(this)
    OutputHandler = new OutputHandler(this)
    panel = document.getElementById("panel_buttons_bottom")
    sounds: Record<string, Howl> = {
        // beep: new Howl({
        //     src: 'https://github.com/tjurczyk/arkadia-data/raw/refs/heads/master/sounds/beep.wav',
        //     preload: true,
        // })
    }

    constructor() {
        window.addEventListener('message', ({data: data}) => {
            this.eventTarget.dispatchEvent(new CustomEvent(data.type, {detail: data.payload}))
        })


        Object.values(this.sounds).forEach((sound) => sound.load())
    }

    connect(port: chrome.runtime.Port) {
        port.onMessage.addListener((message) => {
            Object.entries(message).forEach(([key, value]) => {
                this.eventTarget.dispatchEvent(new CustomEvent(key, {detail: value}))
            })
        })
        this.port = port;
        console.log("Client connected to background service.")
    }

    addEventListener(event: string, listener: (arg: CustomEvent) => void, options?: AddEventListenerOptions | boolean) {
        const reference = listener
        this.eventTarget.addEventListener(event, reference, options)
        return () => this.eventTarget.removeEventListener(event, reference, options)
    }

    removeEventListener(event: string, listener: EventListenerOrEventListenerObject | null) {
        this.eventTarget.removeEventListener(event, listener)
    }

    sendCommand(command: string) {
        this.eventTarget.dispatchEvent(new CustomEvent('command', {detail: command}))
        originalSend(this.Map.parseCommand(command))
    }

    onLine(line: string, type: string) {
        const buffer: {out: string, type?: string}[] = [];
        const originalOutputSend = Output.send;
        Output.send = (out: string, outputType?: string): any => {
            buffer.push({out, type: outputType});
        };
        const flush = () => {
            Output.send = originalOutputSend;
            buffer.forEach(item => originalOutputSend(item.out, item.type));
            removeListener();
        };

        const removeListener = this.addEventListener('output-sent', flush, {once: true});

        //TODO might better to find previous valid ANSI sequence in unmodified line, that way we might be able to restore original color, not default one
        let result = line.split('\n').map(partial => this.Triggers.parseLine(partial, type)).join('\n')
        if (line.substring(0, 1) === '') {
            const resetSequence = line.substring(0, 14)
            result = result.replace(/\[0m/g, resetSequence)
        }
        return result
    }

    sendEvent(type: string, payload?: any) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, {detail: payload}))
        const frame = document.getElementById('cm-frame') as HTMLIFrameElement;
        return frame?.contentWindow.postMessage(this.createEvent(type, payload), '*');
    }

    createEvent(type, payload) {
        return {
            type: type,
            data: payload
        }
    }

    print(printable) {
        if (typeof printable === 'object') {
            printable = JSON.stringify(printable)
        }
        Output.flush_buffer()
        // @ts-ignore
        Output.send(Text.parse_patterns(printable))
    }

    println(printable) {
        this.print("\n")
        this.print(printable)
        this.print("\n")
    }

    createButton(name: string, callback: () => void) {
        let button = document.createElement('input')
        button.value = name
        button.type = 'button'
        button.className = 'panel_button button k-button'
        button.onclick = callback
        this.panel.appendChild(button)
        return button
    }

    playSound(key: string) {
        this.sounds[key].play()
    }
}
