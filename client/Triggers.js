const stripAnsiCodes = str => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export default class Triggers {

    clientExtension
    triggers = new Map()

    constructor(clientExtension) {
        this.clientExtension = clientExtension;
    }

    registerTrigger(pattern, callback, tag) {
        const uuid = crypto.randomUUID()
        this.triggers.set(uuid, {
            pattern: pattern,
            callback: callback,
            tag: tag
        })
        return uuid;
    }

    removeByTag(tag) {
        this.triggers.entries().filter(([key, trigger]) => trigger.tag === tag).forEach(([key, trigger]) => {
            this.removeTrigger(key)
        })
    }

    removeTrigger(uuid) {
        this.triggers.delete(uuid)
    }

    parseLine(rawLine) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, '')
        this.triggers.entries().forEach(([uuid, trigger]) => {
            let matches
            if (trigger.pattern instanceof RegExp) {
                matches = line.match(trigger.pattern)
            } else if (rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase()) > -1) {
                matches = {
                    index: rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase())
                }
            }
            if (matches) {
                rawLine = trigger.callback(rawLine, line, matches, uuid) ?? rawLine
            }
        })
        return rawLine
    }

}