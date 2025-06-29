import Client from "./Client";

export default class OutputHandler {

    client: Client
    output = document.getElementById("main_text_output_msg_wrapper")
    clickerCallbacks: Function[] = [];

    constructor(clientExtension: Client) {
        this.client = clientExtension
        this.client.addEventListener('output-sent', (event: CustomEvent) => {
            if (!this.output.children) {
                return
            }
            for (let i = 0; i < event.detail; i++) {
                const element = this.output.children[this.output.children.length - 1 - i]
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
                        const callbackIndex = el.textContent.substring(clickIndex + 7, hasTitle ? clickTitleSeparator : closerIndex)
                        el.textContent = el.textContent.substring(0, clickIndex) + el.textContent.substring(closerIndex + 1)
                        el.onclick = () => {
                            this.clickerCallbacks[callbackIndex]?.apply(null)
                        }
                    })
                    if (msg.textContent && msg.textContent.indexOf("{click:") > -1) {
                        msg.style.cursor = "pointer"
                        msg.style.textDecoration = " underline"
                        msg.style.textDecorationStyle = "dotted"
                        msg.style.textDecorationSkipInk = "auto"
                        const clickIndex = msg.textContent.indexOf("{click:")
                        const clickTitleSeparator = msg.textContent.indexOf(":", clickIndex + 7)
                        const closerIndex = msg.textContent.indexOf("}", clickIndex)
                        const hasTitle = clickTitleSeparator > clickIndex && clickTitleSeparator < closerIndex
                        if (hasTitle) {
                            msg.title = msg.textContent.substring(clickTitleSeparator + 1, closerIndex)
                        }
                        const callbackIndex = msg.textContent.substring(clickIndex + 7, hasTitle ? clickTitleSeparator : closerIndex)
                        msg.textContent = msg.textContent.substring(0, clickIndex) + msg.textContent.substring(closerIndex + 1)
                        msg.onclick = () => {
                            this.clickerCallbacks[callbackIndex]?.apply(null)
                        }
                    }
                }
            }
        })
    }

    makeClickable(rawLine: string, string: string, callback: Function, title?: string) {
        const matchIndex = rawLine.indexOf(string)
        this.clickerCallbacks.push(callback)
        return rawLine.substring(0, matchIndex) + `{click:${this.clickerCallbacks.length - 1}${title ? ":" + title : ""}}${string}` +  rawLine.substring(matchIndex + string.length)
    }
}