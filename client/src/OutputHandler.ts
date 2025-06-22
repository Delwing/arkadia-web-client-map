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
                const msg = element.querySelector(".output_msg_text")
                if (msg) {
                    Array.from(msg.querySelectorAll("span")).filter(el => el.textContent.indexOf("click:") > -1).forEach(el => {
                        el.style.cursor = "pointer"
                        const clickIndex = el.textContent.indexOf("{click:")
                        const closerIndex = el.textContent.indexOf("}", clickIndex)
                        const callbackIndex = el.textContent.substring(clickIndex + 7, closerIndex)
                        el.textContent = el.textContent.substring(0, clickIndex) + el.textContent.substring(closerIndex + 1)
                        el.onclick = () => {
                            this.clickerCallbacks[callbackIndex]?.apply()
                        }
                    })
                }
            }
        })
    }

    makeClickable(rawLine: string, string: string, callback: Function) {
        const matchIndex = rawLine.indexOf(string)
        this.clickerCallbacks.push(callback)
        return rawLine.substring(0, matchIndex) + `{click:${this.clickerCallbacks.length - 1}}${string}` +  rawLine.substring(matchIndex + string.length)
    }
}