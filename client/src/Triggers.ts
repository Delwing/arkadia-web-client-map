import Client from "./Client";

const stripAnsiCodes = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

type TriggerCallback = (rawLine: string, line: string, matches: {
    index: number
} | RegExpMatchArray, type: string) => string | undefined

export interface Trigger {
    pattern: string | RegExp;
    callback: TriggerCallback
    tag?: string;
    children: Map<string, Trigger>;
}

export default class Triggers {

    clientExtension: Client;
    triggers: Map<string, Trigger> = new Map()

    constructor(clientExtension: Client) {
        this.clientExtension = clientExtension;
    }

    private findTrigger(id: string, collection: Map<string, Trigger> = this.triggers): Trigger | undefined {
        if (collection.has(id)) {
            return collection.get(id)
        }
        for (const trigger of collection.values()) {
            const found = this.findTrigger(id, trigger.children)
            if (found) return found
        }
        return undefined
    }

    private findParentMap(id: string, collection: Map<string, Trigger>): Map<string, Trigger> | undefined {
        if (collection.has(id)) return collection
        for (const trigger of collection.values()) {
            const res = this.findParentMap(id, trigger.children)
            if (res) return res
        }
        return undefined
    }

    private removeByTagRecursive(tag: string, collection: Map<string, Trigger>) {
        Array.from(collection.entries()).forEach(([key, trigger]) => {
            if (trigger.tag === tag) {
                collection.delete(key)
            } else {
                this.removeByTagRecursive(tag, trigger.children)
            }
        })
    }

    registerTrigger(pattern: string | RegExp, callback: TriggerCallback, tag?: string, parentId?: string): string {
        const uuid = crypto.randomUUID()
        const trigger: Trigger = {
            pattern: pattern,
            callback: callback,
            tag: tag,
            children: new Map(),
        }
        if (parentId) {
            const parent = this.findTrigger(parentId)
            if (parent) {
                parent.children.set(uuid, trigger)
            } else {
                this.triggers.set(uuid, trigger)
            }
        } else {
            this.triggers.set(uuid, trigger)
        }
        return uuid
    }

    registerOneTimeTrigger(pattern: string | RegExp, callback: TriggerCallback, tag?: string, parentId?: string) {
        const uuid = this.registerTrigger(pattern, (rawLine, line, matches, type): string => {
            this.removeTrigger(uuid)
            return callback(rawLine, line, matches, type)
        }, tag, parentId)
        return uuid;
    }

    removeByTag(tag: string) {
        this.removeByTagRecursive(tag, this.triggers)
    }

    removeTrigger(uuid: string) {
        const parentMap = this.findParentMap(uuid, this.triggers)
        if (!parentMap) return
        parentMap.delete(uuid)
    }

    private executeTrigger(trigger: Trigger, rawLine: string, type: string): string {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, '')
        let matches: { index: number } | RegExpMatchArray
        if (trigger.pattern instanceof RegExp) {
            matches = line.match(trigger.pattern)
        } else if (rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase()) > -1) {
            matches = {
                index: rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase())
            }
        }
        if (matches) {
            rawLine = trigger.callback(rawLine, line, matches, type) ?? rawLine
            trigger.children.forEach(child => {
                rawLine = this.executeTrigger(child, rawLine, type)
            })
        }
        return rawLine
    }

    parseLine(rawLine: string, type: string) {
        this.triggers.forEach(trigger => {
            rawLine = this.executeTrigger(trigger, rawLine, type)
        })
        return rawLine
    }

}
