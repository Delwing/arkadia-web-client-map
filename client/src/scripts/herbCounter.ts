import Client from "../Client";
import { parseItems } from "./prettyContainers";
import loadHerbs, { HerbsData } from "./herbsLoader";


const polishNumbers: Record<string, number> = {
    'jeden': 1, 'jedna': 1, 'jedno': 1,
    'jednego': 1,
    'dwa': 2, 'dwie': 2,
    'dwoch': 2,
    'trzy': 3,
    'trzech': 3,
    'cztery': 4,
    'czterech': 4,
    'piec': 5,
    'pieciu': 5,
    'szesc': 6,
    'szesciu': 6,
    'siedem': 7,
    'siedmiu': 7,
    'osiem': 8,
    'osmiu': 8,
    'dziewiec': 9,
    'dziewieciu': 9,
    'dziesiec': 10,
    'dziesieciu': 10,
    'jedenascie': 11,
    'jedenastu': 11,
    'dwanascie': 12,
    'dwunastu': 12,
    'trzynascie': 13,
    'trzynastu': 13,
    'czternascie': 14,
    'czternastu': 14,
    'pietnascie': 15,
    'pietnastu': 15,
    'szesnascie': 16,
    'szesnastu': 16,
    'siedemnascie': 17,
    'siedemnastu': 17,
    'osiemnascie': 18,
    'osiemnastu': 18,
    'dziewietnascie': 19,
    'dziewietnastu': 19,
    'dwadziescia': 20,
    'dwudziestu': 20,
    'dwadziescia jeden': 21, 'dwadziescia jedna': 21,
    'dwadziescia dwa': 22, 'dwadziescia dwie': 22,
    'dwudziestu dwoch': 22,
    'dwadziescia trzy': 23,
    'dwudziestu trzech': 23,
    'dwadziescia cztery': 24,
    'dwudziestu czterech': 24,
    'dwadziescia piec': 25,
    'dwudziestu pieciu': 25,
    'dwadziescia szesc': 26,
    'dwudziestu szesciu': 26,
    'dwadziescia siedem': 27,
    'dwudziestu siedmiu': 27,
    'dwadziescia osiem': 28,
    'dwudziestu osmiu': 28,
    'dwadziescia dziewiec': 29,
    'dwudziestu dziewieciu': 29,
    'trzydziesci': 30
};

function parseNumber(str: string): number {
    str = str.trim().toLowerCase();
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    str = str.replace(/\s+/g, ' ');
    return polishNumbers[str] || 0;
}

export default async function initHerbCounter(client: Client, aliases?: { pattern: RegExp; callback: Function }[]) {
    let herbs: HerbsData | null = null;
    const herbMap: Record<string, string> = {};

    async function ensureData() {
        if (!herbs) {
            herbs = await loadHerbs();
            if (herbs) {
                Object.entries(herbs.herb_id_to_odmiana).forEach(([id, forms]) => {
                    Object.values(forms).forEach(f => {
                        herbMap[f.toLowerCase()] = id;
                    });
                });
            }
        }
    }

    const countRegex = /^Doliczyl(?:es|as) sie (?<num>[0-9a-z ]+) sztuk\.$/;
    const contentRegex = /^Rozwiazujesz na chwile rzemyk, sprawdzajac zawartosc swojego.*woreczka.* W srodku dostrzegasz (?<content>.*)\.$/;
    const emptyRegex = /^Rozwiazujesz na chwile rzemyk, sprawdzajac zawartosc swojego.*woreczka.* W jego srodku nic jednak nie ma\.$/;

    let awaiting = false;
    let left = 0;
    const totals: Record<string, number> = {};
    let lastSummary: string[] = [];

    function finish() {
        const entries = Object.entries(totals);
        if (entries.length === 0) {
            lastSummary = ['Brak ziol.'];
            client.println(lastSummary.join('\n'));
        } else {
            const lines: string[] = [];
            lines.push('------+--------------------+-----------------------------------------------');
            lines.push('  ile |        nazwa       |              dzialanie                        ');
            lines.push('------+--------------------+-----------------------------------------------');
            entries.sort((a, b) => a[0].localeCompare(b[0])).forEach(([id, c]) => {
                const uses = herbs?.herb_id_to_use[id]?.map(u => `${u.action}: ${u.effect}`).join(' | ') || '--';
                const row = `${String(c).padStart(5, ' ')} | ${id.padEnd(18, ' ')} | ${uses}`;
                lines.push(row);
            });
            lines.push('--------------------------------------------------------------------------');
            lastSummary = lines;
            client.println(lastSummary.join('\n'));
        }
        awaiting = false;
        left = 0;
        Object.keys(totals).forEach(k => delete totals[k]);
    }

    client.Triggers.registerTrigger(countRegex, (_r, _l, m) => {
        if (!awaiting) return undefined;
        left = parseNumber(m.groups?.num || m[1]);
        for (let i = 1; i <= left; i++) {
            client.sendCommand(`zajrzyj do ${i}. swojego woreczka`);
        }
        return undefined;
    });

    client.Triggers.registerTrigger(contentRegex, (_r, _l, m) => {
        if (!awaiting) return undefined;
        const items = parseItems(m.groups?.content || '');
        items.forEach(it => {
            const key = herbMap[it.name.toLowerCase()] || it.name.toLowerCase();
            const count = typeof it.count === 'number' ? it.count : parseNumber(String(it.count));
            totals[key] = (totals[key] || 0) + count;
        });
        left -= 1;
        if (left <= 0) finish();
        return undefined;
    });

    client.Triggers.registerTrigger(emptyRegex, () => {
        if (!awaiting) return undefined;
        left -= 1;
        if (left <= 0) finish();
        return undefined;
    });

    async function start() {
        await ensureData();
        awaiting = true;
        lastSummary = [];
        client.sendCommand('policz swoje woreczki');
    }

    if (aliases) {
        aliases.push({ pattern: /\/ziola_buduj$/, callback: start });
        aliases.push({ pattern: /\/ziola_pokaz$/, callback: () => {
            if (lastSummary.length > 0) {
                client.println(lastSummary.join('\n'));
            } else {
                client.println('Brak podsumowania.');
            }
        } });
    }
}
