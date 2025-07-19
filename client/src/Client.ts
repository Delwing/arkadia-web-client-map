import Triggers from "./Triggers";
import { stripAnsiCodes } from "./stripAnsiCodes";
import PackageHelper from "./PackageHelper";
import MapHelper from "./MapHelper";
import InlineCompassRose from "./scripts/inlineCompassRose";
import {Howl} from "howler";
import {setXtermPalette} from "./Colors";
import {
    FunctionalBind,
    LINE_START_EVENT,
    formatLabel,
} from "./scripts/functionalBind";
import OutputHandler from "./OutputHandler";
import TeamManager from "./TeamManager";
import ObjectManager from "./ObjectManager";
import {beepSound} from "./sounds";
import {attachGmcpListener} from "./gmcp";
import {color} from "./Colors";
import {SKIP_LINE} from "./ControlConstants";
import {stripPolishCharacters} from "./stripPolishCharacters";

export interface ClientAdapter {
    send(text: string, echo?: boolean): void;

    output(text?: string, type?: string): void

    sendGmcp(type: string, payload?: any): void
}

export default class Client {
    clientAdapter: ClientAdapter;
    port?: any;
    eventTarget = new EventTarget();
    FunctionalBind = new FunctionalBind(this);
    Triggers = new Triggers(this);
    packageHelper = new PackageHelper(this);
    Map = new MapHelper(this);
    OutputHandler = new OutputHandler(this);
    TeamManager = new TeamManager(this);
    ObjectManager = new ObjectManager(this);
    inlineCompassRose = new InlineCompassRose(this);
    panel = document.getElementById("panel_buttons_bottom");
    contentWidth = 0;
    sounds: Record<string, Howl> = {
        beep: new Howl({
            src: beepSound,
            preload: true,
        }),
    };
    aliases: { pattern: RegExp; callback: Function }[] = [];
    lampBind = {key: "Digit4", ctrl: true} as {
        key: string;
        ctrl?: boolean;
        alt?: boolean;
        shift?: boolean;
    };
    inLineProcess = false; //TODO figure out something else
    defaultColor = 255;
    buffer: { out: string, type?: string }[] = [];


    constructor(clientAdapter: ClientAdapter, port: any) {
        this.clientAdapter = clientAdapter
        attachGmcpListener(this);
        window.addEventListener('extension-message', (ev: Event) => {
            const data: any = (ev as CustomEvent).detail;
            if (data && data.data !== undefined) {
                this.eventTarget.dispatchEvent(new CustomEvent(data.type, {detail: data.data}))
            }
        })

        this.updateContentWidth()
        window.addEventListener('resize', () => this.updateContentWidth())
        this.addEventListener('uiSettings', () => this.updateContentWidth())

        Object.values(this.sounds).forEach((sound) => sound.load())

        window.addEventListener('keydown', (ev) => {
            if (
                (ev.code === this.lampBind.key || ev.key === this.lampBind.key) &&
                !!this.lampBind.ctrl === ev.ctrlKey &&
                !!this.lampBind.alt === ev.altKey &&
                !!this.lampBind.shift === ev.shiftKey
            ) {
                this.sendCommand('napelnij lampe olejem')
                ev.preventDefault()
            }
        })

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
            const lamp = ev.detail?.binds?.lamp
            if (lamp) {
                this.lampBind = {...lamp}
            }
            if (ev.detail?.xtermPalette) {
                setXtermPalette(ev.detail.xtermPalette);
            }
        })

        this.addEventListener('gmcp.char.colors', (ev: CustomEvent) => {
            this.defaultColor = ev.detail.text ?? 255
        })

        this.addEventListener('output-sent', () => {
            if (this.buffer.length == 0) return
            this.buffer.forEach(item => this.clientAdapter.output(item.out, item.type))
            this.sendEvent('buffer-sent', this.buffer.length)
            this.buffer = []
        })

        this.port = port
        port.onMessage.addListener((message) => {
            Object.entries(message).forEach(([key, value]) => {
                this.eventTarget.dispatchEvent(new CustomEvent(key, {detail: value}))
            })
        })
    }

    connect(port: any, initial: boolean) {
        if (initial) {
            port.postMessage({type: 'GET_STORAGE', key: 'settings'})
            port.postMessage({type: 'GET_STORAGE', key: 'kill_counter'})
            port.postMessage({type: 'GET_STORAGE', key: 'containers'})
            port.postMessage({type: 'GET_STORAGE', key: 'deposits'})
            port.postMessage({type: 'GET_STORAGE', key: 'scripts'})
        }
        this.port = port
        this.eventTarget.dispatchEvent(new CustomEvent('port-connected'))
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

    send(command: string, echo: boolean = true) {
        this.clientAdapter.send(command, echo)
    }

    sendCommand(command: string, echo: boolean = true) {
        if (command) {
            command = stripPolishCharacters(command)
        }
        this.eventTarget.dispatchEvent(new CustomEvent('command', {detail: command}))
        const split = command.split(/[#;]/)
        if (split.length > 1) {
            split.forEach(part => this.sendCommand(part, echo))
            return
        }

        command = this.Map.parseCommand(command)
        const isAlias = this.aliases.find(alias => {
            const matches = command.match(alias.pattern)
            if (matches) {
                alias.callback(matches)
                return true
            }
            return false
        })
        if (!isAlias) {
            this.clientAdapter.send(this.Map.move(command).direction, echo)
        }
    }

    sendGMCP(type: string, payload?: any) {
        this.clientAdapter.sendGmcp(type, payload)
    }

    onLine(line: string, type: string) {
        this.inLineProcess = true
        this.eventTarget.dispatchEvent(new CustomEvent(LINE_START_EVENT))
        const ansiRegex = /\x1b\[[0-9;]*m/g

        line = this.Triggers.parseMultiline(line, type)
        let split = line.split('\n')
        if (stripAnsiCodes(split[split.length - 1]) === '') {
            split.pop()
        }
        let result = split.map(partial => this.Triggers.parseLine(partial, type)).filter(line => line !== SKIP_LINE).join('\n')
        if (!result.startsWith("\x1b")) {
            result = color(255) + result
        }
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
                    stack.pop()
                    const prev = stack[stack.length - 1]
                    if (prev) {
                        restore.push(prev)
                    } else {
                        restore.push(color(this.defaultColor) || '\x1b[0m')
                    }
                }
            } else {
                stack.push(seq)
            }
        })
        let index = 0
        result = result.replace(/\x1b\[0m/g, () => restore[index++] || '\x1b[0m')
        this.inLineProcess = false
        return result
    }

    sendEvent(type: string, payload?: any) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, {detail: payload}))
        window.dispatchEvent(new CustomEvent(type, {detail: payload}))
    }

    createEvent(type, payload) {
        return {
            type: type,
            data: payload,
        }
    }

    print(printable: string) {
        if (typeof printable === 'object') {
            printable = JSON.stringify(printable)
        }
        // @ts-ignore
        const text = Text.parse_patterns(printable)
        this.buffer.push({out: text})
        if (!this.inLineProcess) {
            this.sendEvent('output-sent', 1)
        }
    }

    println(printable: string) {
        this.print('\n')
        this.print(printable)
        this.print('\n')
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
        return prefix + rawLine
    }

    updateContentWidth() {
        const content = document.getElementById('main_text_output_msg_wrapper') as HTMLElement | null
        const measure = document.getElementById('content-width-measure') as HTMLElement | null
        if (!content || !measure) {
            return
        }
        const style = window.getComputedStyle(content)
        measure.style.fontFamily = style.fontFamily
        measure.style.fontSize = style.fontSize
        const charWidth = measure.getBoundingClientRect().width
        const paddingLeft = parseFloat(style.paddingLeft) || 0
        const paddingRight = parseFloat(style.paddingRight) || 0
        const width = content.clientWidth - paddingLeft - paddingRight
        if (charWidth > 0 && width > 0) {
            this.contentWidth = Math.floor(width / charWidth)
            this.sendEvent('contentWidth', this.contentWidth)
        }
    }
}
