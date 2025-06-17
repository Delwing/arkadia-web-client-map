import Triggers from "./Triggers";
import PackageHelper from "./PackageHelper";
import MapHelper from "./MapHelper";
const {Howl} = require('howler');

const originalSend = Input.send

export default class ClientExtension {

    eventTarget = new EventTarget()
    triggers = new Triggers(this)
    packageHelper = new PackageHelper(this)
    mapHelper = new MapHelper(this)
    panel = document.getElementById("panel_buttons_bottom")
    functionalBind = () => {}
    sounds = {
        beep: new Howl({src: 'https://github.com/tjurczyk/arkadia-data/raw/refs/heads/master/sounds/beep.wav', html5: true, preload: true})
    }

    constructor() {
        window.addEventListener('message', ({data: data}) => {
            if (data.type === 'command') {
                originalSend(data.payload)
            }
            if (data.type === 'bindButton') {
                Conf.data.buttons.push(data.payload)
                Conf.refresh()
            }
            if (data.type === 'clearBindButton') {
                Conf.data.buttons = Conf.data.buttons.filter(item => !item.BindButton)
                Conf.refresh()
            }
            this.eventTarget.dispatchEvent(new CustomEvent(data.type, {detail: data.payload}))
        })
        window.addEventListener('keydown', (ev) => {
            if (ev.code === 'BracketRight') {
                this.functionalBind();
                ev.preventDefault()
            }
        })

        Object.values(this.sounds).forEach((sound) => sound.load())
    }

    connect(port) {
        port.onMessage.addListener((message) => {
            if (message.settings) {
                this.eventTarget.dispatchEvent(new CustomEvent('settings', {detail: message}))
            }
        })
    }

    addEventListener(event, listener, options) {
        this.eventTarget.addEventListener(event, listener, options)
    }

    removeEventListener(event, listener) {
        this.eventTarget.removeEventListener(event, listener)
    }

    registerTrigger(pattern, callback, tag) {
        return this.triggers.registerTrigger(pattern, callback, tag)
    }

    registerOneTimeTrigger(pattern, callback, tag) {
        return this.triggers.registerTrigger(pattern, (...args) => {
            callback(args)
            this.triggers.removeTrigger(args[3])
        }, tag)
    }

    removeTrigger(uuid) {
        return this.triggers.removeTrigger(uuid)
    }

    onLine(line) {
        console.log(line)
        //TODO might better to find previous valid ANSI sequence in unmodified line, that way we might be able to restore original color, not default one
        let result = line.split('\n').map(partial => this.triggers.parseLine(partial)).join('\n')
        if (line.substring(0, 1) === '') {
            const resetSequence = line.substring(0, 14)
            result = result.replace(/\[0m/g, resetSequence)
        }
        return result
    }

    sendEvent(type, payload) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, {detail: payload}))

        const frame = document.getElementById('cm-frame');
        return frame?.contentWindow.postMessage(this.createEvent(type, payload), '*',);
    }

    createEvent(type, payload) {
        return {
            type: type,
            data: payload
        }
    }

    setFunctionalBind(printable, callback) {
        this.functionalBind = callback
        this.println(`\t\x1B[22;38;5;49mbind \x1B[22;38;5;222m]\x1B[22;38;5;49m: ${printable}`)
    }

    clearFunctionalBind() {
        this.functionalBind = () => {
        };
    }

    print(printable) {
        Output.flush_buffer()
        Output.send(Text.parse_patterns(printable))
    }

    println(printable) {
        this.print("\n")
        this.print(printable)
        this.print("\n")
    }

    createButton(name, callback) {
        let button = document.createElement('input')
        button.value = name
        button.type = 'button'
        button.className = 'panel_button button k-button'
        button.onclick = callback
        this.panel.appendChild(button)
        return button
    }

    playSound(key) {
        this.sounds[key].play()
    }
}

export function color(colorCode) {
    return `\x1B[22;38;5;${colorCode}m`
}

export function colorString(rawLine, string, colorCode) {
    const matchIndex = rawLine.indexOf(string)
    const colorCodeIndex = rawLine.indexOf('\x1B[22;38;5;')
    const colorCodeEndIndex = rawLine.indexOf('m]', colorCodeIndex)
    const originalColor = rawLine.substring(colorCodeIndex, colorCodeEndIndex)
    return rawLine.substring(0, matchIndex) + color(colorCode) + rawLine.substring(string) + originalColor + rawLine.substring(matchIndex + string.length)
}
