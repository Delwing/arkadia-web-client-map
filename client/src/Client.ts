import Triggers from "./Triggers";
import PackageHelper from "./PackageHelper";
import MapHelper from "./MapHelper";
import InlineCompassRose from "./scripts/inlineCompassRose";
import {Howl} from "howler"
import {FunctionalBind, LINE_START_EVENT, formatLabel} from "./scripts/functionalBind";
import OutputHandler from "./OutputHandler";
import {rawInputSend, rawOutputSend} from "./main";
import TeamManager from "./TeamManager";
import ObjectManager from "./ObjectManager";
import {beepSound} from "./sounds";
import { attachGmcpListener } from "./gmcp";

export default class Client {

    port: chrome.runtime.Port;
    eventTarget = new EventTarget()
    FunctionalBind = new FunctionalBind(this)
    Triggers = new Triggers(this)
    packageHelper = new PackageHelper(this)
    Map = new MapHelper(this)
    OutputHandler = new OutputHandler(this)
    TeamManager = new TeamManager(this)
    ObjectManager = new ObjectManager(this)
    inlineCompassRose = new InlineCompassRose(this)
    panel = document.getElementById("panel_buttons_bottom")
    sounds: Record<string, Howl> = {
        beep: new Howl({
            src: beepSound,
            preload: true,
        })
    }
    inLineProcess = false //TODO figure out something else

    constructor() {
        attachGmcpListener(this);
        window.addEventListener('message', ({data: data}) => {
            if (data.payload) { //TODO doubtful!
                this.eventTarget.dispatchEvent(new CustomEvent(data.type, {detail: data.payload}))
            }
        })


        Object.values(this.sounds).forEach((sound) => sound.load())

        this.addEventListener('settings', (ev: CustomEvent) => {
            const bind = ev.detail?.binds?.main
            if (bind) {
                this.FunctionalBind.updateOptions({
                    key: bind.key,
                    ctrl: bind.ctrl,
                    alt: bind.alt,
                    shift: bind.shift,
                    label: formatLabel(bind)
                })
            }
        })
    }

    connect(port: chrome.runtime.Port, initial: boolean) {
        port.onMessage.addListener((message) => {
            Object.entries(message).forEach(([key, value]) => {
                this.eventTarget.dispatchEvent(new CustomEvent(key, {detail: value}))
            })
        })
        if (initial) {
            port.postMessage({type: 'GET_STORAGE', key: 'settings'})
            port.postMessage({type: 'GET_STORAGE', key: 'kill_counter'})
            port.postMessage({type: 'GET_STORAGE', key: 'containers'})
            port.postMessage({type: 'GET_STORAGE', key: 'deposits'})
        }
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
        rawInputSend(this.Map.parseCommand(command))
    }

    onLine(line: string, type: string) {
        this.inLineProcess = true
        this.eventTarget.dispatchEvent(new CustomEvent(LINE_START_EVENT));
        const buffer: { out: string, type?: string }[] = [];
        const originalOutputSend = Output.send;
        Output.send = (out: string, outputType?: string): any => {
            if (out) {
                buffer.push({out, type: outputType});
            } else {
                rawOutputSend()
            }
        };

        this.addEventListener('line-sent', () => {
            if (buffer.length > 0) {
                buffer.forEach(item => Output.send(item.out, item.type));
                this.sendEvent('buffer-sent', buffer.length)
            }
        }, {once: true});

        let result = line.split('\n').map(partial => this.Triggers.parseLine(partial, type)).join('\n')
        const ansiRegex = /\x1b\[[0-9;]*m/g
        const restore: string[] = []
        const stack: string[] = []
        const matches = Array.from(result.matchAll(ansiRegex))
        const resetMatches = Array.from(result.matchAll(/\x1b\[0m/g))
        const trailingCount = resetMatches.length === 1 && result.trimEnd().endsWith('\x1b[0m') ? 1 : 0
        matches.forEach((match, i) => {
            const seq = match[0]
            const isTrailing = seq === '\x1b[0m' && i >= matches.length - trailingCount
            if (seq === '\x1b[0m') {
                if (isTrailing) {
                    restore.push('\x1b[0m')
                } else {
                    const current = stack.pop()
                    const prev = stack[stack.length - 1]
                    if (prev) {
                        restore.push(prev)
                    } else {
                        restore.push(current || '\x1b[0m')
                    }
                }
            } else {
                stack.push(seq)
            }
        })
        let index = 0
        result = result.replace(/\x1b\[0m/g, () => restore[index++] || '\x1b[0m')
        Output.send = originalOutputSend;
        this.inLineProcess = false
        return result
    }

    sendEvent(type: string, payload?: any) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, {detail: payload}))
        const frame = document.getElementById('cm-frame') as HTMLIFrameElement;
        if (frame) {
            frame?.contentWindow.postMessage(this.createEvent(type, payload), '*');
        } else {
            window.postMessage(this.createEvent(type, payload));
        }
    }

    createEvent(type, payload) {
        return {
            type: type,
            data: payload
        }
    }

    print(printable: string) {
        if (typeof printable === 'object') {
            printable = JSON.stringify(printable)
        }
        // @ts-ignore
        const text = Text.parse_patterns(printable)
        Output.send(text)
        if (!this.inLineProcess) {
            this.sendEvent('output-sent', 1)
        }
    }

    println(printable: string) {
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
        this.panel?.appendChild(button)
        return button
    }

    playSound(key: string) {
        const sound = this.sounds[key]
        if (!sound) {
            return
        }
        const play = () => {
            sound.stop()
            sound.play()
        }
        if (sound.state() === 'loaded') {
            play()
        } else {
            sound.once('load', play)
            sound.load()
        }
    }

    prefix(rawLine: string, prefix: string) {
        return prefix + rawLine;
    }
}
