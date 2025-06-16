const stripAnsiCodes = str => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export default class Triggers {

    clientExtension
    triggers = []

    constructor(clientExtension) {
        this.clientExtension = clientExtension;
    }

    registerTrigger(pattern, callback, tag) {
        const uuid = crypto.randomUUID()
        this.triggers.push({
            pattern: pattern,
            callback: callback,
            uuid: uuid,
            tag: tag
        })
    }

    removeByTag(tag) {
        this.triggers = this.triggers.filter(trigger => trigger.tag !== tag)
    }

    parseLine(rawLine) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, '')
        this.triggers.forEach(trigger => {
            let matches
            if (trigger.pattern instanceof RegExp) {
                matches = line.match(trigger.pattern)
            } else if (rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase()) > -1) {
                matches = {
                    index: rawLine.toLowerCase().indexOf(trigger.pattern.toLowerCase())
                }
            }
            if (matches) {
                rawLine = trigger.callback(rawLine, line, matches) ?? rawLine
            }
        })
        return rawLine
    }

}