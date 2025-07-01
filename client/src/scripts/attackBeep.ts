import Client from "../Client";
import {colorString, findClosestColor} from "../Colors";

const RED = findClosestColor("#ff0000");

function highlightAttack(line: string) {
    const phrase = "atakuje cie";
    const colored = colorString(line, phrase, RED);
    return colored.replace(phrase, phrase.toUpperCase());
}

export default function initAttackBeep(client: Client) {
    const tag = "attackBeep";
    const beep = (_: string, line: string): string => {
        client.playSound("beep");
        return highlightAttack(line);
    };

    [
        /(.*) atakuje cie!/,
        /(.*) atakuje cie nie dajac ci czasu na skontrowanie swojego ataku!/,
        /^Ku twojemu zdumieniu, (.*) pojawil sie nagle tuz obok ciebie!/,
        /^Oczy (.*) zachodza woalem rytualnego transu, gdy jak blyskawica rzuca sie on na ciebie, rozniecajac burze Tanca Smierci!/,
        /^W oczach (.*) rozpala sie swiety ogien nienawisci i z imieniem Morra na ustach (rzuca sie do walki z toba)!/,
        /^\w+(?: \w+){0,4} z determinacja i pewnoscia siebie unosi swoja bron i (naciera na ciebie)!/,
        /^\w+(?: \w+){0,4} z pierwotna wsciekloscia (rzuca sie na ciebie), rozpoczynajac walke!/
    ].forEach(p => client.Triggers.registerTrigger(p, beep, tag));

    client.Triggers.registerTrigger("atakuje cie!", (_r, line) => highlightAttack(line), tag);
}
