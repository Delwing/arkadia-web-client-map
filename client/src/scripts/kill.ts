import Client from "../Client";
import { encloseColor, findClosestColor } from "../Colors";

type KillEntry = {
    my_session: number;
    my_total: number;
    team_session: number;
};

type KillCounts = Record<string, KillEntry>;

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
    const originalWords = full.trim().split(/\s+/);
    const words = originalWords.map((w) => w.toLowerCase());
    if (
        words.length === 1 &&
        /^[A-Z\u0104\u0106\u0118\u0141\u0143\u00D3\u015A\u0179\u017B]/.test(
            originalWords[0]
        )
    ) {
        return originalWords[0];
    }
    const lastTwo = words.slice(-2).join(" ");
    if (twoWordNames.includes(lastTwo)) {
        return lastTwo;
    }
    return words[words.length - 1];
}

function formatTable(counts: KillCounts): string {
    const WIDTH = 47;
    const LEFT_PADDING = 2;
    const RIGHT_PADDING = 5;
    const CONTENT_WIDTH = WIDTH - LEFT_PADDING - RIGHT_PADDING;
    const pad = (content = "") =>
        `|${" ".repeat(LEFT_PADDING)}${content.padEnd(CONTENT_WIDTH)}${" ".repeat(
            RIGHT_PADDING
        )}|`;
    const header = (title: string) => {
        const dashes = WIDTH - title.length - 2;
        const left = Math.floor(dashes / 2);
        const right = dashes - left;
        return `+${"-".repeat(left)} ${title} ${"-".repeat(right)}+`;
    };

    const entries = Object.entries(counts)
        .filter(([_, v]) => v.my_total > 0 || v.team_session > 0)
        .sort(([a], [b]) => a.localeCompare(b));

    const totalMy = Object.values(counts).reduce((s, v) => s + v.my_total, 0);
    const totalCombined = totalMy + Object.values(counts).reduce((s, v) => s + v.team_session, 0);

    const mobLine = (name: string, myTotal: number, combined: number) => {
        const numbers = `${myTotal} / ${combined}`;
        let text = `${name} `;
        text += ".".repeat(CONTENT_WIDTH - text.length - numbers.length - 1);
        text += ` ${numbers}`;
        return pad(text);
    };

    const summaryLine = (label: string, value: number) => {
        let text = `${label} `;
        const num = String(value);
        text += ".".repeat(CONTENT_WIDTH - text.length - num.length);
        text += num;
        return pad(text);
    };

    const lines: string[] = [];
    lines.push(header("Licznik zabitych"));
    lines.push(pad());
    lines.push(pad("JA"));
    entries.forEach(([name, { my_total, team_session }]) => {
        lines.push(mobLine(name, my_total, my_total + team_session));
    });
    lines.push(pad());
    lines.push(summaryLine("LACZNIE:", totalMy));
    lines.push(pad());
    lines.push(pad());
    lines.push(summaryLine("DRUZYNA LACZNIE:", totalCombined));
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
            const totals: Record<string, number> = data[STORAGE_KEY] ?? {};
            kills = Object.fromEntries(
                Object.entries(totals).map(([name, total]) => [
                    name,
                    { my_session: 0, my_total: total as number, team_session: 0 },
                ])
            );
        });
    }

    const persistTotals = () => {
        const totals: Record<string, number> = {};
        Object.entries(kills).forEach(([name, entry]) => {
            totals[name] = entry.my_total;
        });
        chrome.storage?.local.set({ [STORAGE_KEY]: totals });
    };

    window.addEventListener("beforeunload", persistTotals);

    const myKillRegex = /^[ >]*(Zabil(?:es|as) (?<name>[A-Za-z ()!,]+))\.$/;
    const teamKillRegex = /^[ >]*(?<player>[a-zA-Z (),!]+) zabil(?:a)? (?<name>[a-zA-Z (),!]+)\.$/;

    client.Triggers.registerTrigger(
        myKillRegex,
        (rawLine, _line, matches): string => {
            const mob = parseName(matches.groups?.name ?? "");
            if (!kills[mob]) {
                kills[mob] = { my_session: 0, my_total: 0, team_session: 0 };
            }
            kills[mob].my_session += 1;
            kills[mob].my_total += 1;
            persistTotals();

            const combined = kills[mob].my_session + kills[mob].team_session;
            const counts = ` (${kills[mob].my_session} / ${combined})`;
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

    client.Triggers.registerTrigger(
        teamKillRegex,
        (_raw, _line, matches): string | undefined => {
            const mob = parseName(matches.groups?.name ?? "");
            if (!kills[mob]) {
                kills[mob] = { my_session: 0, my_total: 0, team_session: 0 };
            }
            kills[mob].team_session += 1;
            return undefined;
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

