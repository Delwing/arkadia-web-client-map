import Client from "../Client";
import {colorString, findClosestColor} from "../Colors";
import {SKIP_LINE} from "../ControlConstants";

const LABEL_COLOR = findClosestColor("#446fb1");

export default function initWeaponEvaluation(client: Client) {
    const tag = 'weapon-evaluation';

    const gripRegex = /^Zauwazasz, iz (.+?) (?:jest|sa) przystosowan[yae] do chwytania (w dowolnej rece lub oburacz|w lewej rece lub oburacz|w prawej rece lub oburacz|w dowolnej rece|oburacz|w lewej rece|w prawej rece)(, jednak ty .*)?\.$/;
    const dmgRegex = /^Za (jego|jej|ich) pomoca mozna zadawac rany (.*)\.$/;
    const statsRegex = /^Twoje doswiadczenie i umiejetnosci podpowiadaja ci, ze jak na (.+?) (jest|sa) (on|one|ono|ona) (.*) (wywazony|wywazona|wywazone) i (.*)\.$/;

    const EFFECTIVENESS: Record<string, { value: number; label: string }> = {
        "kompletnie nieskuteczn": { value: 1, label: "[1/14]" },
        "strasznie nieskuteczn": { value: 2, label: "[2/14]" },
        "bardzo nieskuteczn": { value: 3, label: "[3/14]" },
        "raczej nieskuteczn": { value: 4, label: "[4/14]" },
        "malo skuteczn": { value: 5, label: "[5/14]" },
        "niezbyt skuteczn": { value: 6, label: "[6/14]" },
        "raczej skuteczn": { value: 7, label: "[7/14]" },
        "dosyc skuteczn": { value: 8, label: "[8/14]" },
        "calkiem skuteczn": { value: 9, label: "[9/14]" },
        "bardzo skuteczn": { value: 10, label: "[10/14]" },
        "niezwykle skuteczn": { value: 11, label: "[11/14]" },
        "wyjatkowo skuteczn": { value: 12, label: "[12/14]" },
        "zabojczo skuteczn": { value: 13, label: "[13/14]" },
        "fantastycznie skuteczn": { value: 14, label: "[14/14]" },
    };

    const BALANCE: Record<string, { value: number; label: string }> = {
        "wyjatkowo zle": { value: 1, label: "[1/14]" },
        "bardzo zle": { value: 2, label: "[2/14]" },
        "zle": { value: 3, label: "[3/14]" },
        "bardzo kiepsko": { value: 4, label: "[4/14]" },
        "kiepsko": { value: 5, label: "[5/14]" },
        "przyzwoicie": { value: 6, label: "[6/14]" },
        "srednio": { value: 7, label: "[7/14]" },
        "niezle": { value: 8, label: "[8/14]" },
        "dosc dobrze": { value: 9, label: "[9/14]" },
        "dobrze": { value: 10, label: "[10/14]" },
        "bardzo dobrze": { value: 11, label: "[11/14]" },
        "doskonale": { value: 12, label: "[12/14]" },
        "perfekcyjnie": { value: 13, label: "[13/14]" },
        "genialnie": { value: 14, label: "[14/14]" },
    };

    client.Triggers.registerTrigger(gripRegex, (_r, _l, m) => {
        const grip = m[2];
        let wound = '';
        let weaponType = '';
        let balanceRaw = '';
        let effectRaw = '';

        client.Triggers.registerOneTimeTrigger(dmgRegex, (_r2, _l2, m2) => {
            wound = m2[2];
            return SKIP_LINE;
        }, tag);

        client.Triggers.registerOneTimeTrigger(statsRegex, (_r3, _l3, m3) => {
            weaponType = m3[1];
            balanceRaw = m3[4].trim();
            effectRaw = m3[6].trim();

            const balEntry = BALANCE[balanceRaw.toLowerCase()];
            const effEntry = EFFECTIVENESS[
                Object.keys(EFFECTIVENESS).find(k => effectRaw.toLowerCase().startsWith(k)) || ''
            ];

            if (balEntry && effEntry) {
                const sum = balEntry.value + effEntry.value;
                const avg = sum / 2;
                const pad = 15;
                const lines = [
                    `${colorString("Typ broni", LABEL_COLOR)}: ${weaponType.padEnd(pad, " ")} ${colorString("Chwyt", LABEL_COLOR)}: ${grip}`,
                    `${colorString("Obrazenia", LABEL_COLOR)}: ${wound}`,
                    `${colorString("Wywazenie", LABEL_COLOR)}: ${balEntry.label.padEnd(pad, ' ')} ${colorString("Skutecznosc", LABEL_COLOR)}: ${effEntry.label}`,
                    '',
                    `${colorString("Suma", LABEL_COLOR)}: ${String(sum).padEnd(pad + 5)} ${colorString("Srednia", LABEL_COLOR)}: ${avg}`,
                ];
                client.print(lines.join('\n'));
            }
            return SKIP_LINE;
        }, tag);

        return SKIP_LINE;
    }, tag);
}
