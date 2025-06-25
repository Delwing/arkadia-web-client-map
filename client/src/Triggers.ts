import Client from "./Client";

const stripAnsiCodes = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

type TriggerCallback = (rawLine: string, line: string, matches: {
    index: number
} | RegExpMatchArray, type: string) => string | undefined

export interface Trigger {
    pattern: string | RegExp;
    callback: TriggerCallback
    tag?: string;
}

export default class Triggers {

    clientExtension: Client;
    triggers: Map<string, Trigger> = new Map()

    constructor(clientExtension: Client) {
        this.clientExtension = clientExtension;
    }

    registerTrigger(pattern: string | RegExp, callback: TriggerCallback, tag?: string): string {
        const uuid = crypto.randomUUID()
        this.triggers.set(uuid, {
            pattern: pattern,
            callback: callback,
            tag: tag
        })
        return uuid;
    }

    registerOneTimeTrigger(pattern: string | RegExp, callback: TriggerCallback, tag?: string) {
        const uuid = this.registerTrigger(pattern, (rawLine, line, matches, type): string => {
            this.removeTrigger(uuid)
            return callback(rawLine, line, matches, type)
        }, tag)
        return uuid;
    }

    removeByTag(tag: string) {
        Array.from(this.triggers.entries()).filter(([, trigger]) => trigger.tag === tag).forEach(([key]) => {
            this.removeTrigger(key)
        })
    }

    removeTrigger(uuid: string) {
        this.triggers.delete(uuid)
    }

    parseLine(rawLine: string, type: string) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, '')
        Array.from(this.triggers.entries()).forEach(([_, trigger]) => {
            let matches: { index: number } | RegExpMatchArray;
            if (trigger.pattern instanceof RegExp) {
                matches = line.match(trigger.pattern)
            } else if (rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase()) > -1) {
                matches = {
                    index: rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase())
                }
            }
            if (matches) {
                rawLine = trigger.callback(rawLine, line, matches, type) ?? rawLine
            }
        })
        return rawLine
    }

}