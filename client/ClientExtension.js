import Triggers from "./Triggers";
import PackageHelper from "./PackageHelper";

const originalSend = Input.send

const colorCodes = [
    "#000000",
    "#800000",
    "#008000",
    "#808000",
    "#000080",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#808080",
    "#ff0000",
    "#00ff00",
    "#ffff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ffffff",
    "#000000",
    "#00005f",
    "#000087",
    "#0000af",
    "#0000df",
    "#0000ff",
    "#005f00",
    "#005f5f",
    "#005f87",
    "#005faf",
    "#005fdf",
    "#005fff",
    "#008700",
    "#00875f",
    "#008787",
    "#0087af",
    "#0087df",
    "#0087ff",
    "#00af00",
    "#00af5f",
    "#00af87",
    "#00afaf",
    "#00afdf",
    "#00afff",
    "#00df00",
    "#00df5f",
    "#00df87",
    "#00dfaf",
    "#00dfdf",
    "#00dfff",
    "#00ff00",
    "#00ff5f",
    "#00ff87",
    "#00ffaf",
    "#00ffdf",
    "#00ffff",
    "#5f0000",
    "#5f005f",
    "#5f0087",
    "#5f00af",
    "#5f00df",
    "#5f00ff",
    "#5f5f00",
    "#5f5f5f",
    "#5f5f87",
    "#5f5faf",
    "#5f5fdf",
    "#5f5fff",
    "#5f8700",
    "#5f875f",
    "#5f8787",
    "#5f87af",
    "#5f87df",
    "#5f87ff",
    "#5faf00",
    "#5faf5f",
    "#5faf87",
    "#5fafaf",
    "#5fafdf",
    "#5fafff",
    "#5fdf00",
    "#5fdf5f",
    "#5fdf87",
    "#5fdfaf",
    "#5fdfdf",
    "#5fdfff",
    "#5fff00",
    "#5fff5f",
    "#5fff87",
    "#5fffaf",
    "#5fffdf",
    "#5fffff",
    "#870000",
    "#87005f",
    "#870087",
    "#8700af",
    "#8700df",
    "#8700ff",
    "#875f00",
    "#875f5f",
    "#875f87",
    "#875faf",
    "#875fdf",
    "#875fff",
    "#878700",
    "#87875f",
    "#878787",
    "#8787af",
    "#8787df",
    "#8787ff",
    "#87af00",
    "#87af5f",
    "#87af87",
    "#87afaf",
    "#87afdf",
    "#87afff",
    "#87df00",
    "#87df5f",
    "#87df87",
    "#87dfaf",
    "#87dfdf",
    "#87dfff",
    "#87ff00",
    "#87ff5f",
    "#87ff87",
    "#87ffaf",
    "#87ffdf",
    "#87ffff",
    "#af0000",
    "#af005f",
    "#af0087",
    "#af00af",
    "#af00df",
    "#af00ff",
    "#af5f00",
    "#af5f5f",
    "#af5f87",
    "#af5faf",
    "#af5fdf",
    "#af5fff",
    "#af8700",
    "#af875f",
    "#af8787",
    "#af87af",
    "#af87df",
    "#af87ff",
    "#afaf00",
    "#afaf5f",
    "#afaf87",
    "#afafaf",
    "#afafdf",
    "#afafff",
    "#afdf00",
    "#afdf5f",
    "#afdf87",
    "#afdfaf",
    "#afdfdf",
    "#afdfff",
    "#afff00",
    "#afff5f",
    "#afff87",
    "#afffaf",
    "#afffdf",
    "#afffff",
    "#df0000",
    "#df005f",
    "#df0087",
    "#df00af",
    "#df00df",
    "#df00ff",
    "#df5f00",
    "#df5f5f",
    "#df5f87",
    "#df5faf",
    "#df5fdf",
    "#df5fff",
    "#df8700",
    "#df875f",
    "#df8787",
    "#df87af",
    "#df87df",
    "#df87ff",
    "#dfaf00",
    "#dfaf5f",
    "#dfaf87",
    "#dfafaf",
    "#dfafdf",
    "#dfafff",
    "#dfdf00",
    "#dfdf5f",
    "#dfdf87",
    "#dfdfaf",
    "#dfdfdf",
    "#dfdfff",
    "#dfff00",
    "#dfff5f",
    "#dfff87",
    "#dfffaf",
    "#dfffdf",
    "#dfffff",
    "#ff0000",
    "#ff005f",
    "#ff0087",
    "#ff00af",
    "#ff00df",
    "#ff00ff",
    "#ff5f00",
    "#ff5f5f",
    "#ff5f87",
    "#ff5faf",
    "#ff5fdf",
    "#ff5fff",
    "#ff8700",
    "#ff875f",
    "#ff8787",
    "#ff87af",
    "#ff87df",
    "#ff87ff",
    "#ffaf00",
    "#ffaf5f",
    "#ffaf87",
    "#ffafaf",
    "#ffafdf",
    "#ffafff",
    "#ffdf00",
    "#ffdf5f",
    "#ffdf87",
    "#ffdfaf",
    "#ffdfdf",
    "#ffdfff",
    "#ffff00",
    "#ffff5f",
    "#ffff87",
    "#ffffaf",
    "#ffffdf",
    "#ffffff",
    "#080808",
    "#121212",
    "#1c1c1c",
    "#262626",
    "#303030",
    "#3a3a3a",
    "#444444",
    "#4e4e4e",
    "#585858",
    "#606060",
    "#666666",
    "#767676",
    "#808080",
    "#8a8a8a",
    "#949494",
    "#9e9e9e",
    "#a8a8a8",
    "#b2b2b2",
    "#bcbcbc",
    "#c6c6c6",
    "#d0d0d0",
    "#dadada",
    "#e4e4e4",
    "#eeeeee",
]



export default class ClientExtension {

    triggers = new Triggers(this)
    packageHelper = new PackageHelper(this)
    panel = document.getElementById("panel_buttons_bottom")
    eventTarget = new EventTarget()
    functionalBind = () => {}

    constructor(port) {
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
        this.triggers.registerTrigger(pattern, callback, tag)
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
        this.println(`\t\x1B[22;38;5;49mbind \x1B[22;38;5;222m]\x1B[22;38;5;49m: ${printable}`)
    }

    print(printable) {
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


export class Script {

    rawLine
    currentLine
    cursor
    currentFgColor

    constructor(rawLine, currentLine) {
        this.rawLine = rawLine
        this.currentLine = currentLine
    }

    moveCursor(index) {
        this.cursor = index
    }

    insert(string) {
        let toInsert = ''
        if (this.currentFgColor) {
            toInsert += this.currentFgColor
        }
        toInsert += string
        return this.rawLine.substring(0, this.cursor) + toInsert + this.rawLine.substring(this.cursor)
    }

    fg(color) {
        this.currentFgColor = `\x1B[22;38;5;${color}m`
    }

    reset() {
        delete this.currentFgColor
    }




}