import Client from "../Client";
import {color, findClosestColor} from "../Colors";

const SPRING_GREEN = findClosestColor("#00ff7f");
const DIM_GRAY = findClosestColor("#696969");
const RESET = "\x1B[0m";

const shortToLong: Record<string, string> = {
    n: "north",
    s: "south",
    e: "east",
    w: "west",
    ne: "northeast",
    nw: "northwest",
    se: "southeast",
    sw: "southwest",
    u: "up",
    d: "down",
};

const polishToShort: Record<string, string> = {
    "polnoc": "n",
    "poludnie": "s",
    "wschod": "e",
    "zachod": "w",
    "polnocny-wschod": "ne",
    "polnocny-zachod": "nw",
    "poludniowy-wschod": "se",
    "poludniowy-zachod": "sw",
    "dol": "d",
    "gora": "u",
    "gore": "u",
};

export default function initInlineCompassRose(client: Client) {
    let exits = new Set<string>();

    client.addEventListener('gmcp.room.exits', (event: CustomEvent) => {
        exits = new Set(parseExits(event.detail));
        showCompassRose();
    });

    function parseExits(detail: any): string[] {
        let list: string[] = [];
        if (!detail) return list;
        if (Array.isArray(detail)) {
            list = detail;
        } else if (Array.isArray(detail.exits)) {
            list = detail.exits;
        } else if (detail.exits && typeof detail.exits === 'object') {
            list = Object.keys(detail.exits);
        } else if (detail.room && detail.room.exits) {
            const e = detail.room.exits;
            list = Array.isArray(e) ? e : Object.keys(e);
        }
        return list.map(toShort).filter(Boolean);
    }

    function toShort(exit: string): string {
        if (polishToShort[exit]) return polishToShort[exit];
        if (shortToLong[exit]) return exit;
        const long = exit.toLowerCase();
        const short = Object.entries(shortToLong).find(([s, l]) => l === long);
        if (short) return short[0];
        return '';
    }

    function hasExit(short: string): boolean {
        return exits.has(short);
    }

    function printExit(short: string): string {
        const label = hasExit(short) ? short.toUpperCase() : " ".repeat(short.length);
        return color(SPRING_GREEN) + label + RESET;
    }

    function showCompassRose() {
        client.println([
            "",
            `       ${printExit("nw")}  ${printExit("n")}  ${printExit("ne")}       ${printExit("u")}`,
            `       ${hasExit("nw") ? "\\" : " "} ${hasExit("n") ? "|" : " "} ${hasExit("ne") ? "/" : " "}         ${hasExit("u") ? "|" : ""}`,
            `       ${printExit("w")}${hasExit("w") ? "---" : "   "}${color(DIM_GRAY)}X${RESET}${hasExit("e") ? "---" : "   "}${printExit("e")}       ${(hasExit("d") || hasExit("u")) ? "o" : ""}`,
            `       ${hasExit("sw") ? "/" : " "} ${hasExit("s") ? "|" : " "} ${hasExit("se") ? "\\" : " "}         ${hasExit("d") ? "|" : ""}`,
            `       ${printExit("sw")}  ${printExit("s")}  ${printExit("se")}       ${printExit("d")}`,
            "",
            ""
        ].join("\n"));
    }
}
