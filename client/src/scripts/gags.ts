import {client} from "../main";
import {colorStringInLine, colorString, findClosestColor} from "../Colors";
import Client from "../Client";

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

function gag(rawLine: string, power: string, totalPower: string, kind: string) {
    return gagPrefix(rawLine, `${power}/${totalPower}`, kind)
}

function gagPrefix(rawLine: string, prefix: string, type: string) {
    return client.prefix(rawLine, colorString(`[${prefix}] `, gagColorCodes[type]));
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

    rawLine = colorStringInLine(rawLine, matches[0], OWN_HIT_COLOR)


    return gag(rawLine, power, "6", "moje_ciosy")
}

function color_hit(rawLine: string, matches: RegExpMatchArray, value: string, type: string) {
    let target
    if (type == "combat.avatar") {
        target = "innych_ciosy_we_mnie"
    }


    if (matches.groups.target) {
        rawLine = colorStringInLine(rawLine, matches.groups.damage + " cie", DAMAGE_COLOR)
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

export default function registerGagTriggers(client: Client) {
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

