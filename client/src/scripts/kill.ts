import Client from "../Client";
import { encloseColor, findClosestColor } from "../Colors";

type KillCounts = Record<string, { session: number; total: number }>;

const STORAGE_KEY = "kill_counter";

const twoWordNames = [
    "czarnego orka",
    "dzikiego orka",
    "elfiego egzekutora",
    "kamiennego trolla",
    "konia bojowego",
    "krasnoluda chaosu",
    "lodowego trolla",
    "pajaka sieciarza",
    "pomiot chaosu",
    "rumaka bojowego",
    "rycerza chaosu",
    "smoczego ogra",
    "smoka chaosu",
    "straznika wiezy",
    "szkielet goblina",
    "szkielet krasnoluda",
    "szkielet orka",
    "tancerza wojny",
    "trolla gorskiego",
    "trolla jaskiniowego",
    "zjawe kobiety",
    "zjawe straznika",
    "zywiolaka ognia",
    "zywiolaka powietrza",
    "zywiolaka wody",
    "zywiolaka ziemi",
];

function parseName(full: string): string {
    const words = full.trim().toLowerCase().split(/\s+/);
    const lastTwo = words.slice(-2).join(" ");
    if (twoWordNames.includes(lastTwo)) {
        return lastTwo;
    }
    return words[words.length - 1];
}

function formatTable(counts: KillCounts): string {
    const WIDTH = 47;
    const pad = (content = "") => `| ${content.padEnd(WIDTH - 1)}|`;
    const header = (title: string) => {
        const dashes = WIDTH - title.length - 2;
        const left = Math.floor(dashes / 2);
        const right = dashes - left;
        return `+${"-".repeat(left)} ${title} ${"-".repeat(right)}+`;
    };

    const entries = Object.entries(counts)
        .filter(([_, v]) => v.session > 0 || v.total > 0)
        .sort(([a], [b]) => a.localeCompare(b));

    const total = Object.values(counts).reduce((s, v) => s + v.total, 0);

    const mobLine = (name: string, session: number, totalKills: number) => {
        const numbers = `${session} / ${totalKills}`;
        let text = `${name} `;
        text += ".".repeat(WIDTH - 1 - text.length - numbers.length - 1);
        text += ` ${numbers}`;
        return pad(text);
    };

    const summaryLine = (label: string, value: number) => {
        let text = `${label} `;
        const num = String(value);
        text += ".".repeat(WIDTH - 1 - text.length - num.length);
        text += num;
        return pad(text);
    };

    const lines: string[] = [];
    lines.push(header("Licznik zabitych"));
    lines.push(pad());
    lines.push(pad("JA"));
    entries.forEach(([name, { session, total }]) => {
        lines.push(mobLine(name, session, total));
    });
    lines.push(pad());
    lines.push(summaryLine("LACZNIE:", total));
    lines.push(pad());
    lines.push(pad());
    lines.push(summaryLine("DRUZYNA LACZNIE:", total));
    lines.push(pad());
    lines.push(`+${"-".repeat(WIDTH)}+`);
    return lines.join("\n");
}

export default function init(
    client: Client,
    aliases?: { pattern: RegExp; callback: Function }[]
) {
    let kills: KillCounts = {};
    if (chrome.storage) {
        chrome.storage.local.get(STORAGE_KEY).then((data) => {
            kills = data[STORAGE_KEY] ?? {};
        });
    }

    window.addEventListener("beforeunload", () => {
        chrome.storage?.local.set({ [STORAGE_KEY]: kills });
    });

    const killRegex =
        /^[ >]*(Zabil(?:es|as) (?<name>[A-Za-z\u0105\u0107\u0119\u0142\u0144\u00f3\u015b\u017c\u017a\u017b\u0104\u0106\u0118\u0141\u0143\u00d3\u015a\u0179\u017b ]+))\.$/;

    client.Triggers.registerTrigger(
        killRegex,
        (rawLine, _line, matches): string => {
            const mob = parseName(matches.groups?.name ?? "");
            if (!kills[mob]) {
                kills[mob] = { session: 0, total: 0 };
            }
            kills[mob].session += 1;
            kills[mob].total += 1;
            chrome.storage?.local.set({ [STORAGE_KEY]: kills });

            const counts = ` (${kills[mob].session} / ${kills[mob].total})`;
            const modified = rawLine.replace(/\.$/, `${counts}.`);
            return (
                "  \n" +
                client.prefix(
                    modified,
                    encloseColor("[  ZABILES  ] ", findClosestColor("#ff6347"))
                ) +
                "\n  "
            );
        }
    );

    if (aliases) {
        aliases.push({
            pattern: /\/zabici$/,
            callback: () => {
                client.print("\n" + formatTable(kills) + "\n");
            },
        });
    }
}

