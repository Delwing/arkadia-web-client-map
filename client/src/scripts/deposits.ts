import Client from "../Client";
import { stripAnsiCodes } from "../Triggers";

interface DepositInfo {
    name: string;
    items: string[] | null;
}

const STORAGE_KEY = "deposits";

const deposits: Record<number, DepositInfo> = {};

function isBankRoom(room: any): boolean {
    return !!room?.userData?.bind && room.userData.bind.includes("depozyt");
}

export default function initDeposits(client: Client, aliases?: { pattern: RegExp; callback: Function }[]) {
    client.addEventListener("storage", (event: CustomEvent) => {
        if (event.detail.key === STORAGE_KEY && event.detail.value) {
            Object.assign(deposits, event.detail.value);
        }
    });

    client.port?.postMessage({ type: "GET_STORAGE", key: STORAGE_KEY });

    const persist = () => {
        client.port?.postMessage({ type: "SET_STORAGE", key: STORAGE_KEY, value: deposits });
    };

    function update(items: string[] | null) {
        const room = client.Map.currentRoom as any;
        if (!isBankRoom(room)) {
            return;
        }
        deposits[room.id] = {
            name: room.name || `Bank ${room.id}`,
            items,
        };
        persist();
    }

    const matchContents = (_raw: string, line: string) => {
        return stripAnsiCodes(line).match(/^Twoj depozyt zawiera (.+)\.$/);
    };
    const matchEmpty = (_raw: string, line: string) => {
        return stripAnsiCodes(line).match(/^Twoj depozyt jest pusty\./);
    };
    const matchNone = (_raw: string, line: string) => {
        return stripAnsiCodes(line).match(/^Nie posiadasz wykupionego depozytu\./);
    };

    client.Triggers.registerTrigger(matchContents, (_r, _l, m) => {
        const text = m[1].replace(/\.$/, "");
        const items = text.split(/,\s*/).map(i => i.trim()).filter(Boolean);
        update(items);
        return undefined;
    });
    client.Triggers.registerTrigger(matchEmpty, () => { update([]); return undefined; });
    client.Triggers.registerTrigger(matchNone, () => { update(null); return undefined; });

    function printDeposits() {
        const lines: string[] = [];
        Object.values(deposits).forEach(({ name, items }) => {
            let line: string;
            if (items === null) {
                line = `${name}: brak depozytu`;
            } else if (items.length === 0) {
                line = `${name}: (pusty)`;
            } else {
                line = `${name}: ${items.join(", ")}`;
            }
            lines.push(line);
        });
        if (lines.length === 0) {
            client.println("Brak zapisanych depozytow.");
        } else {
            client.println(lines.join("\n"));
        }
    }

    if (aliases) {
        aliases.push({ pattern: /\/depozyt$/, callback: () => Input.send("przejrzyj depozyt") });
        aliases.push({ pattern: /\/depozyty$/, callback: printDeposits });
    }

    window.addEventListener("beforeunload", persist);
}

export { deposits };
