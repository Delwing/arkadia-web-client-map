import Triggers, {Trigger} from "../Triggers";
import gagsData from "./gags.json";
import {client} from "../main";
import {colorString, encloseColor, findClosestColor} from "../Colors";

const gagColors = {
    "moje_ciosy": "#f0f8ff",
    "moje_spece": "#adff2f",
    "innych_ciosy": "#d3d3d3",
    "innych_ciosy_we_mnie": "#d3d3d3",
    "innych_spece": "#708090",
    "moje_uniki": "#4682b4",
    "innych_uniki": "#2f4f4f",
    "moje_parowanie": "#4682b4",
    "innych_parowanie": "#2f4f4f",
    "zaslony_udane": "#00bfff",
    "zaslony_nieudane": "#483d8b",
    "bron": "#ffd700",
    "npc": "#fffaf0",
    "npc_spece": "#fffaf0"
};
const gagColorCodes: Record<string, number> = Object.fromEntries(
    Object.entries(gagColors).map(([k, v]) => [k, findClosestColor(v)])
) as Record<string, number>;
const OWN_HIT_COLOR = findClosestColor('#2db92d');
const DAMAGE_COLOR = findClosestColor('#ff9933');
const combatTypes = ["combat.avatar", "combat.team", "combat.others"]

class EmptyMatches extends Array<string> implements RegExpMatchArray {
    "0": string;
    groups: { [p: string]: string };
    index: number;
    input: string;
}

function isCombatMsg(
    _rawLine: string,
    _line: string,
    _matches: any,
    type: string
): RegExpMatchArray | undefined {
    return combatTypes.indexOf(type) > -1 ? new EmptyMatches() : undefined;
}

function gagsIsType(
    checkedType: string,
    _rawLine: string,
    _line: string,
    _matches: any,
    type: string
): RegExpMatchArray | undefined {
    return checkedType.match(type)
}

function gag(rawLine: string, power: string, totalPower: string, kind: string) {
    return gagPrefix(rawLine, `${power}/${totalPower}`, kind)
}

function gagOwnSpec(rawLine: string, power: string, totalPower: string) {
    if (totalPower) {
        gagSpec(rawLine, '', power, totalPower, "moje_spece")
    }
    return gagPrefix(rawLine, `${power}/${totalPower}`, "moje_spece");
}

function gagPrefix(rawLine: string, prefix: string, type: string) {
    return client.prefix(rawLine, encloseColor(`[${prefix}] `, gagColorCodes[type]));
}

function gagSpec(rawLine: string, prefix: string, power: string, totalPower: string, kind: string) {
    return gagPrefix(rawLine, `${prefix}${power}/${totalPower}`, kind)
}

const callMap: Record<string, (...args: any[]) => string> = {
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

function registerGroup(parent: Triggers | Trigger, group: GagGroup) {
    const patterns = Array.isArray(group.patterns) ? group.patterns : [];
    const triggers = Array.isArray(group.triggers) ? group.triggers : [];
    const groups = Array.isArray(group.groups) ? group.groups : [];

    if (patterns.length === 0 && triggers.length === 0) {
        groups.forEach(gr => registerGroup(parent, gr));
        return;
    }

    let container: Triggers | Trigger = parent;
    patterns.forEach(pat => {
        const pattern = toPattern(pat);
        container = container instanceof Trigger
            ? container.registerChild(pattern, undefined, group.name)
            : (parent as Triggers).registerTrigger(pattern, undefined, group.name);
    });
    triggers.forEach(tr => registerTrigger(container, tr));
    groups.forEach(gr => registerGroup(container, gr));
}

function registerTrigger(parent: Triggers | Trigger, tr: GagTrigger) {
    if (!tr.patterns || tr.patterns.length === 0) return;
    let container: Triggers | Trigger = parent;
    tr.patterns.forEach((pat) => {
        const pattern = toPattern(pat);
        const callback = (rawLine: string) => {
            (tr.calls || []).forEach(c => {
                const fn = callMap[c.func];
                if (fn) rawLine = fn(rawLine, ...c.args.map(parseArg));
            });
            return rawLine;
        }
        container instanceof Trigger ? container.registerChild(pattern, callback, tr.name) : (parent as Triggers).registerTrigger(pattern, callback, tr.name);
    });
}


function gagOwnRegularHits(rawLine: string, matches: RegExpMatchArray | { index: number }, power: string) {
    let ignoreList = [
        "opalizujacego runicznego",
        "czarnoblekitnego pulsujacego morgensterna",
        "czarnego smuklego topora",
        "srebrzyst\\w+ kos\\w+ bojow\\w+"
    ]


    if (ignoreList.filter(ignore => rawLine.match(ignore)).length > 0) {
        return rawLine
    }

    rawLine = colorString(rawLine, matches[0], OWN_HIT_COLOR)


    return gag(rawLine, power, "6", "moje_ciosy")
}

function color_hit(rawLine: string, matches: RegExpMatchArray, value: string, type: string) {
    let target
    if (type == "combat.avatar") {
        target = "innych_ciosy_we_mnie"
    }


    if (matches.groups.target) {
        rawLine = colorString(rawLine, matches.groups.damage + " cie", DAMAGE_COLOR)
    } else {
        target = "innych_ciosy"
    }
    return gag(rawLine, value, "6", target)
}

function gagOtherRegularHits(rawLine: string, matches: RegExpMatchArray, type: string) {
    let damage = matches.groups.damage
    let value = 0
    switch (damage) {
        case "ledwo muska":
            value = 1
            break
        case "lekko rani":
            value = 2
            break
        case "rani":
            value = 3
            break
        case "powaznie rani":
            value = 4
            break;
        case "bardzo ciezko rani":
            value = 5
            break;
        case "masakruje":
        case "smiertelnie rani":
            value = 6
            break;
    }


    return color_hit(rawLine, matches, value.toString(), type)
}

export default function registerGagTriggers(manager: Triggers) {
    (gagsData as GagGroup[]).forEach(group => registerGroup(manager, group));

    const combatMessages = client.Triggers.registerTrigger(isCombatMsg)
    combatMessages.registerChild(/^Ledwo muskasz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "1"))
    combatMessages.registerChild(/^Lekko ranisz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "2"))
    combatMessages.registerChild(/^Ranisz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "3"))
    combatMessages.registerChild(/^Powaznie ranisz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "4"))
    combatMessages.registerChild(/^Bardzo ciezko ranisz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "5"))
    combatMessages.registerChild(/^Masakrujesz/, (rawLine, _, matches) => gagOwnRegularHits(rawLine, matches, "6"))
    combatMessages.registerChild(/^(?<attacker>\w+(?: \w+){0,4}?) (?<damage>ledwo muska|lekko rani|bardzo ciezko rani|powaznie rani|rani|masakruje|smiertelnie rani) (?<target>cie) (?<weapon>.+?), trafiajac cie w (?<where>.*)\.$/, (rawLine, _, matches, type) => gagOtherRegularHits(rawLine, matches, type))
    combatMessages.registerChild(/^(?<attacker>\w+(?: \w+){0,4}?) (?<damage>ledwo muska|lekko rani|bardzo ciezko rani|powaznie rani|rani|masakruje|smiertelnie rani) (?<target_weapon>.+?), trafiajac (?:go|ja|je) w (?<where>.*)\.$/, (rawLine, _, matches, type) => gagOtherRegularHits(rawLine, matches, type))
}

