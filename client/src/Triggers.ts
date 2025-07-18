import Client from "./Client";
import { stripAnsiCodes } from "./stripAnsiCodes";
export { stripAnsiCodes };

type TriggerCallback = (
    rawLine: string,
    line: string,
    matches: RegExpMatchArray,
    type: string
) => string | undefined;

type TriggerMatchFunction = (
    rawLine: string,
    line: string,
    _matches: RegExpMatchArray | undefined,
    type: string
) => RegExpMatchArray | undefined;

type TriggerSubPattern = string | RegExp | TriggerMatchFunction;
type TriggerPattern = TriggerSubPattern | TriggerSubPattern[];

export interface TriggerOptions {
    stayOpenLines?: number;
}

export class Trigger {
    id = Math.random().toString(36).slice(2);
    children: Map<string, Trigger> = new Map();
    private openInstances: number[] = [];

    constructor(
        private manager: Triggers,
        public pattern: TriggerPattern,
        public callback?: TriggerCallback,
        public tag?: string,
        public parent?: Trigger,
        private options: TriggerOptions = {}
    ) {}

    registerChild(
        pattern: TriggerPattern,
        callback?: TriggerCallback,
        tag?: string,
        options?: TriggerOptions
    ) {
        const child = new Trigger(this.manager, pattern, callback, tag, this, options);
        this.children.set(child.id, child);
        return child;
    }

    registerOneTimeChild(
        pattern: TriggerPattern,
        callback: TriggerCallback,
        tag?: string,
        options?: TriggerOptions
    ) {
        const child = this.registerChild(
            pattern,
            (rawLine, line, matches, type) => {
                this.manager.removeTrigger(child);
                return callback(rawLine, line, matches, type);
            },
            tag,
            options
        );
        return child;
    }

    execute(rawLine: string, type: string) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, "");
        this.openInstances = this.openInstances.map(v => v - 1).filter(v => v > 0);
        let matches: RegExpMatchArray | undefined;
        const patterns = Array.isArray(this.pattern) ? this.pattern : [this.pattern];
        for (const pattern of patterns) {
            if (pattern instanceof RegExp) {
                matches = line.match(pattern);
            } else if (typeof pattern === "string") {
                const patternStr = pattern.toString();
                const index = rawLine.toLowerCase().indexOf(patternStr.toLowerCase());
                if (index > -1) {
                    const end = index + patternStr.length;
                    matches = [rawLine.substring(index, end)];
                    matches.index = index;
                }
            } else if (typeof pattern === "function") {
                matches = pattern(rawLine, line, undefined, type);
            }
            if (matches) {
                break;
            }
        }
        let matched = false;
        if (matches) {
            matched = true;
            if (this.options.stayOpenLines && this.options.stayOpenLines > 0) {
                this.openInstances.push(this.options.stayOpenLines + 1);
            }
        } else if (this.openInstances.length > 0) {
            matched = true;
        }
        if (matched) {
            if (matches && this.callback) {
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
    multilineTriggers: Map<string, Trigger> = new Map();
    private tokenTriggers: { words: string[]; trigger: Trigger }[] = [];

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

    registerTrigger(pattern: TriggerPattern, callback?: TriggerCallback, tag?: string, options?: TriggerOptions) {
        const trigger = new Trigger(this, pattern, callback, tag, undefined, options);
        this.triggers.set(trigger.id, trigger);
        return trigger;
    }

    registerMultilineTrigger(pattern: TriggerPattern, callback?: TriggerCallback, tag?: string, options?: TriggerOptions) {
        const trigger = new Trigger(this, pattern, callback, tag, undefined, options);
        this.multilineTriggers.set(trigger.id, trigger);
        return trigger;
    }

    registerOneTimeTrigger(pattern: TriggerPattern, callback: TriggerCallback, tag?: string, options?: TriggerOptions) {
        const trigger = this.registerTrigger(
            pattern,
            (rawLine, line, matches, type) => {
                this.removeTrigger(trigger);
                return callback(rawLine, line, matches, type);
            },
            tag,
            options
        );
        return trigger;
    }

    registerTokenTrigger(token: string, callback?: TriggerCallback, tag?: string, options?: TriggerOptions) {
        const words = token
            .toLowerCase()
            .split(/[ \n\t.,!?*()\/\[\]]+/)
            .filter(w => w.length > 0);
        const trigger = new Trigger(this, token, callback, tag, undefined, options);
        this.tokenTriggers.push({ words, trigger });
        return trigger;
    }

    registerOneTimeMultilineTrigger(pattern: TriggerPattern, callback: TriggerCallback, tag?: string, options?: TriggerOptions) {
        const trigger = this.registerMultilineTrigger(
            pattern,
            (rawLine, line, matches, type) => {
                this.removeTrigger(trigger);
                return callback(rawLine, line, matches, type);
            },
            tag,
            options
        );
        return trigger;
    }

    removeByTag(tag: string) {
        this.removeByTagRecursive(tag, this.triggers);
        this.removeByTagRecursive(tag, this.multilineTriggers);
        this.tokenTriggers = this.tokenTriggers.filter(t => t.trigger.tag !== tag);
    }

    removeTrigger(trigger: Trigger) {
        if (trigger.parent) {
            trigger.parent.children.delete(trigger.id);
        } else {
            this.triggers.delete(trigger.id);
            this.multilineTriggers.delete(trigger.id);
            this.tokenTriggers = this.tokenTriggers.filter(t => t.trigger.id !== trigger.id);
        }
    }

    parseLine(rawLine: string, type: string) {
        const line = stripAnsiCodes(rawLine).replace(/\s$/g, "");
        const tokens = line
            .split(/[ \n\t.,!?*()\/\[\]]+/)
            .filter(t => t.length > 0)
            .map(t => t.toLowerCase());

        this.tokenTriggers.forEach(({ words, trigger }) => {
            for (let i = 0; i <= tokens.length - words.length; i++) {
                let found = true;
                for (let j = 0; j < words.length; j++) {
                    if (tokens[i + j] !== words[j]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    rawLine = trigger.execute(rawLine, type);
                    break;
                }
            }
        });

        this.triggers.forEach(trigger => {
            rawLine = trigger.execute(rawLine, type);
        });
        return rawLine;
    }

    parseMultiline(rawLine: string, type: string) {
        this.multilineTriggers.forEach(trigger => {
            rawLine = trigger.execute(rawLine, type);
        });
        return rawLine;
    }

}
