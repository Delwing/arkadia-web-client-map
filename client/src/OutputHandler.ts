import Client from "./Client";

export default class OutputHandler {

    client: Client
    output = document.getElementById("main_text_output_msg_wrapper")
    clickerCallbacks: Function[] = [];

    constructor(clientExtension: Client) {
        this.client = clientExtension
        this.client.addEventListener('output-sent', (event: CustomEvent) => {
            this.processOutput(event);
        })
        this.client.addEventListener('buffer-sent', (event: CustomEvent) => {
                this.processOutput(event);
            }
        )
    }

    private processOutput(event: CustomEvent) {
        if (!this.output.children) {
            return
        }
        for (let i = 0; i < event.detail; i++) {
            const element = this.output.children[this.output.children.length - 2 - i]
            if (!element) {
                return;
            }
            const msg = element.querySelector(".output_msg_text") as HTMLElement | null
            if (msg) {
                const elements: HTMLElement[] = Array.from(msg.querySelectorAll("span")) as HTMLElement[]
                elements.filter(el => el.textContent.indexOf("click:") > -1).forEach(el => {
                    el.style.cursor = "pointer"
                    el.style.textDecoration = " underline"
                    el.style.textDecorationStyle = "dotted"
                    el.style.textDecorationSkipInk = "auto"
                    const clickIndex = el.textContent.indexOf("{click:")
                    const clickTitleSeparator = el.textContent.indexOf(":", clickIndex + 7)
                    const closerIndex = el.textContent.indexOf("}", clickIndex)
                    const hasTitle = clickTitleSeparator > clickIndex && clickTitleSeparator < closerIndex
                    if (hasTitle) {
                        el.title = el.textContent.substring(clickTitleSeparator + 1, closerIndex)
                    }
                    const callbackIndex = parseInt(el.textContent.substring(clickIndex + 7, hasTitle ? clickTitleSeparator : closerIndex))
                    el.textContent = el.textContent.substring(0, clickIndex) + el.textContent.substring(closerIndex + 1)
                    const cb = this.clickerCallbacks[callbackIndex]
                    this.clickerCallbacks[callbackIndex] = undefined as any
                    el.onclick = () => {
                        cb?.apply(null)
                    }
                })
                if (msg.textContent && msg.textContent.indexOf("{click:") > -1) {
                    const clickReg = /\{click:(\d+)(?::([^}]+))?\}/
                    Array.from(msg.childNodes).forEach((node) => {
                        if (node.nodeType !== Node.TEXT_NODE) {
                            return
                        }
                        let text = node.textContent || ""
                        let match = clickReg.exec(text)
                        if (!match) {
                            return
                        }
                        const frag = document.createDocumentFragment()
                        while (match) {
                            const before = text.substring(0, match.index)
                            if (before) {
                                frag.appendChild(document.createTextNode(before))
                            }
                            text = text.substring(match.index + match[0].length)
                            const nextMatch = clickReg.exec(text)
                            const nextIndex = nextMatch ? nextMatch.index : text.length
                            const clickableText = text.substring(0, nextIndex)
                            const span = document.createElement("span")
                            span.textContent = clickableText
                            span.style.cursor = "pointer"
                            span.style.textDecoration = " underline"
                            span.style.textDecorationStyle = "dotted"
                            span.style.textDecorationSkipInk = "auto"
                            if (match[2]) {
                                span.title = match[2]
                            }
                            const cbIndex = parseInt(match[1])
                            const cb = this.clickerCallbacks[cbIndex]
                            this.clickerCallbacks[cbIndex] = undefined as any
                            span.onclick = () => {
                                cb?.apply(null)
                            }
                            frag.appendChild(span)
                            text = text.substring(nextIndex)
                            match = nextMatch
                        }
                        if (text) {
                            frag.appendChild(document.createTextNode(text))
                        }
                        node.replaceWith(frag)
                    })
                }
            }
        }
    }

    makeStringClickable(string: string, callback: Function, title?: string) {
        this.clickerCallbacks.push(callback)
        return `{click:${this.clickerCallbacks.length - 1}${title ? ":" + title : ""}}${string}`
    }

    makeClickable(rawLine: string, string: string, callback: Function, title?: string) {
        const matchIndex = rawLine.indexOf(string)
        this.clickerCallbacks.push(callback)
        return rawLine.substring(0, matchIndex) + `{click:${this.clickerCallbacks.length - 1}${title ? ":" + title : ""}}${string}` + rawLine.substring(matchIndex + string.length)
    }
}