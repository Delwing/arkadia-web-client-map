import Client from "../Client";
import {colorString, encloseColor, findClosestColor} from "../Colors";

const RED = findClosestColor("#ff0000");

function highlightAttack(line: string, upper?: string) {
    let colored = encloseColor(line, RED);
    if (upper && colored.includes(upper)) {
        colored = colored.replace(upper, upper.toUpperCase());
    }
    return colored;
}

function highlightPhrase(line: string) {
    const phrase = "atakuje cie";
    const colored = colorString(line, phrase, RED);
    return colored.replace(phrase, phrase.toUpperCase());
}

export default function initAttackBeep(client: Client) {
    const tag = "attackBeep";
    const beep = (raw: string, _line: string, matches: RegExpMatchArray): string => {
        client.playSound("beep");
        const upper = (matches.groups && (matches.groups as any).upper) as string | undefined;
        return highlightAttack(raw, upper);
    };

    [
        /(?<name>.*) atakuje cie!/,
        /(?<name>.*) atakuje cie nie dajac ci czasu na skontrowanie swojego ataku!/,
        /^Ku twojemu zdumieniu, (?<name>.*) pojawil sie nagle tuz obok ciebie!/,
        /^Oczy (?<name>.*) zachodza woalem rytualnego transu, gdy jak blyskawica rzuca sie on na ciebie, rozniecajac burze Tanca Smierci!/,
        /^W oczach (?<name>.*) rozpala sie swiety ogien nienawisci i z imieniem Morra na ustach (?<upper>rzuca sie do walki z toba)!/,
        /^\w+(?: \w+){0,4} z determinacja i pewnoscia siebie unosi swoja bron i (?<upper>naciera na ciebie)!/,
        /^\w+(?: \w+){0,4} z pierwotna wsciekloscia (?<upper>rzuca sie na ciebie), rozpoczynajac walke!/
    ].forEach(p => client.Triggers.registerTrigger(p, beep, tag));

    client.Triggers.registerTrigger(/^atakuje cie!$/, (_r, line) => highlightPhrase(line), tag);
}
