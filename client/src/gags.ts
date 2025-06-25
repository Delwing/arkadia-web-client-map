import Triggers, { Trigger } from "./Triggers";
import gagsData from "./gags.json";

export function isCombatMsg(
    _rawLine: string,
    _line: string,
    _matches: any,
    _type: string
): RegExpMatchArray | { index: number } | undefined {
    // TODO: implement combat message detection
    return undefined;
}

export function gagsIsType(
    _typeName: string,
    _rawLine: string,
    _line: string,
    _matches: any,
    _type: string
): RegExpMatchArray | { index: number } | undefined {
    // TODO: implement type check
    return undefined;
}

export function gag(..._args: any[]) {
    // TODO: implement gag
}

export function gagOwnSpec(..._args: any[]) {
    // TODO: implement gag_own_spec
}

export function gagPrefix(..._args: any[]) {
    // TODO: implement gag_prefix
}

export function gagSpec(..._args: any[]) {
    // TODO: implement gag_spec
}

const callMap: Record<string, (...args: any[]) => void> = {
    gag,
    gag_own_spec: gagOwnSpec,
    gag_prefix: gagPrefix,
    gag_spec: gagSpec,
};

type PatternObj = { pattern: string; type?: number | null };

type GagTrigger = {
    name: string;
    patterns: PatternObj[];
    calls?: { func: string; args: string[] }[];
};

type GagGroup = {
    name: string;
    patterns: PatternObj[];
    triggers: GagTrigger[];
    groups: GagGroup[];
};

function parseArg(arg: string): any {
    const trimmed = arg.trim();
    let value: any = trimmed;
    if (
        (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        trimmed.includes("\\\"")
    ) {
        try {
            value = JSON.parse(trimmed);
        } catch {
            value = trimmed.slice(1, -1);
        }
        if (typeof value === "string") {
            value = value.replace(/^\"|\"$/g, "");
        }
    }
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
    return value;
}

function toPattern(p: PatternObj) {
    if (p.type === 1) {
        return new RegExp(p.pattern);
    }
    if (p.type === 4) {
        const code = p.pattern.trim();
        if (code === "return is_combat_msg()") {
            return (raw: string, line: string, matches: any, type: string) =>
                isCombatMsg(raw, line, matches, type);
        }
        const m = code.match(/^return scripts\.gags:is_type\("(.+)"\)$/);
        if (m) {
            return (raw: string, line: string, matches: any, type: string) =>
                gagsIsType(m[1], raw, line, matches, type);
        }
        return () => undefined;
    }
    return p.pattern;
}

export default function registerGagTriggers(manager: Triggers) {
    (gagsData as GagGroup[]).forEach(group => registerGroup(manager, group));
}

function registerGroup(parent: Triggers | Trigger, group: GagGroup) {
    if (
        (!group.patterns || group.patterns.length === 0) &&
        (!group.triggers || group.triggers.length === 0) &&
        (!group.groups || group.groups.length === 0)
    ) {
        return;
    }
    let container: Triggers | Trigger = parent;
    (group.patterns || []).forEach(pat => {
        const pattern = toPattern(pat);
        container = container instanceof Trigger
            ? container.registerChild(pattern, undefined, group.name)
            : (parent as Triggers).registerTrigger(pattern, undefined, group.name);
    });
    (group.triggers || []).forEach(tr => registerTrigger(container, tr));
    (group.groups || []).forEach(gr => registerGroup(container, gr));
}

function registerTrigger(parent: Triggers | Trigger, tr: GagTrigger) {
    if (!tr.patterns || tr.patterns.length === 0) return;
    let container: Triggers | Trigger = parent;
    tr.patterns.forEach((pat, index) => {
        const pattern = toPattern(pat);
        const isLast = index === tr.patterns.length - 1;
        const callback = isLast
            ? () => {
                  (tr.calls || []).forEach(c => {
                      const fn = callMap[c.func];
                      if (fn) fn(...c.args.map(parseArg));
                  });
                  return undefined;
              }
            : undefined;
        container = container instanceof Trigger
            ? container.registerChild(pattern, callback, tr.name)
            : (parent as Triggers).registerTrigger(pattern, callback, tr.name);
    });
}
