import Client from "./Client";

const stripAnsiCodes = (str: string) =>
    str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

type TriggerCallback = (
    rawLine: string,
    line: string,
    matches: { index: number } | RegExpMatchArray,
    type: string
) => string | undefined;

type TriggerMatchFunction = (
    rawLine: string,
    line: string,
    _matches: { index: number } | RegExpMatchArray | undefined,
    type: string
) => { index: number } | RegExpMatchArray | undefined;

type TriggerPattern = string | RegExp | TriggerMatchFunction;

export class Trigger {
    id = crypto.randomUUID();
    children: Map<string, Trigger> = new Map();

    constructor(
        private manager: Triggers,
        public pattern: TriggerPattern,
        public callback?: TriggerCallback,
        public tag?: string,
        public parent?: Trigger
    ) {}

    registerChild(
        pattern: TriggerPattern,
        callback?: TriggerCallback,
        tag?: string
    ) {
        const child = new Trigger(this.manager, pattern, callback, tag, this);
        this.children.set(child.id, child);
        return child;
    }

    registerOneTimeChild(
        pattern: TriggerPattern,
        callback: TriggerCallback,
        tag?: string
    ) {
        const child = this.registerChild(
            pattern,
            (rawLine, line, matches, type) => {
                this.manager.removeTrigger(child);
                return callback(rawLine, line, matches, type);
            },
            tag
        );
        return child;
    }

    execute(rawLine: string, type: string) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, "");
        let matches: { index: number } | RegExpMatchArray | undefined;
        if (this.pattern instanceof RegExp) {
            matches = line.match(this.pattern);
        } else if (typeof this.pattern === "string") {
            const index = rawLine.toLowerCase().indexOf(this.pattern.toLowerCase());
            if (index > -1) {
                matches = { index };
            }
        } else if (typeof this.pattern === "function") {
            matches = this.pattern(rawLine, line, undefined, type);
        }
        if (matches) {
            if (this.callback) {
                rawLine = this.callback(rawLine, line, matches, type) ?? rawLine;
            }
            this.children.forEach(child => {
                rawLine = child.execute(rawLine, type);
            });
        }
        return rawLine;
    }
}

export default class Triggers {

    clientExtension: Client;
    triggers: Map<string, Trigger> = new Map();

    constructor(clientExtension: Client) {
        this.clientExtension = clientExtension;
    }

    private removeByTagRecursive(tag: string, collection: Map<string, Trigger>) {
        Array.from(collection.values()).forEach(trigger => {
            if (trigger.tag === tag) {
                this.removeTrigger(trigger);
            } else {
                this.removeByTagRecursive(tag, trigger.children);
            }
        });
    }

    registerTrigger(pattern: TriggerPattern, callback?: TriggerCallback, tag?: string) {
        const trigger = new Trigger(this, pattern, callback, tag);
        this.triggers.set(trigger.id, trigger);
        return trigger;
    }

    registerOneTimeTrigger(pattern: TriggerPattern, callback: TriggerCallback, tag?: string) {
        const trigger = this.registerTrigger(
            pattern,
            (rawLine, line, matches, type) => {
                this.removeTrigger(trigger);
                return callback(rawLine, line, matches, type);
            },
            tag
        );
        return trigger;
    }

    removeByTag(tag: string) {
        this.removeByTagRecursive(tag, this.triggers);
    }

    removeTrigger(trigger: Trigger) {
        if (trigger.parent) {
            trigger.parent.children.delete(trigger.id);
        } else {
            this.triggers.delete(trigger.id);
        }
    }

    parseLine(rawLine: string, type: string) {
        const buffered: Array<[string, string | undefined]> = []
        const originalOutputSend = Output.send

        Output.send = (out: string, outType?: string): any => {
            buffered.push([out, outType])
        }

        const flush = () => {
            buffered.forEach(([out, outType]) => originalOutputSend(out, outType))
        }

        this.clientExtension.addEventListener('output-sent', flush, {once: true})

        this.triggers.forEach(trigger => {
            rawLine = trigger.execute(rawLine, type)
        })

        Output.send = originalOutputSend

        return rawLine
    }

}
