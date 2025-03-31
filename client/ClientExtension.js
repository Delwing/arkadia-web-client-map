import Triggers from "./Triggers";
import PackageHelper from "./PackageHelper";

const originalSend = Input.send

export default class ClientExtension {

    triggers = new Triggers(this)
    packageHelper = new PackageHelper(this)
    panel = document.getElementById("panel_buttons_bottom")
    eventTarget = new EventTarget()
    functionalBind = () => {}


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
    }

    addEventListener(event, listener, options) {
        this.eventTarget.addEventListener(event, listener, options)
    }

    removeEventListener(event, listener) {
        this.eventTarget.removeEventListener(event, listener)
    }

    registerTrigger(pattern, callback) {
        this.triggers.registerTrigger(pattern, callback)
    }

    onLine(line) {
        return line.split('\n').map(partial => this.triggers.parseLine(partial)).join('\n')
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
        this.print(`\n\t\x1B[22;38;5;49mbind \x1B[22;38;5;222m]\x1B[22;38;5;49m: ${printable}\n`)
    }

    print(printable) {
        Output.send(Text.parse_patterns(printable))
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
}

export class Script {

    rawLine
    currentLine
    buffer

    constructor(rawLine, currentLine) {
        this.rawLine = rawLine
        this.currentLine = currentLine
    }

    selectString(string) {
        console.log('select')
    }

    fg() {
        console.log('fg')
    }


}