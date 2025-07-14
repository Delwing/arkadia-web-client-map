import Client from "../Client";

export interface UserAlias {
    pattern: string;
    command: string;
}

const STORAGE_KEY = "aliases";

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function initUserAliases(client: Client, aliases?: { pattern: RegExp; callback: Function }[]) {
    const list = aliases || client.aliases;
    let mapped: { pattern: RegExp; callback: () => void }[] = [];

    const apply = (arr: UserAlias[] = []) => {
        mapped.forEach(a => {
            const idx = list.indexOf(a);
            if (idx !== -1) list.splice(idx, 1);
        });
        mapped = arr.map(item => ({
            pattern: new RegExp('^' + escapeRegex(item.pattern) + '$'),
            callback: () => client.sendCommand(item.command)
        }));
        mapped.forEach(a => list.push(a));
    };

    client.addEventListener('storage', (ev: CustomEvent) => {
        if (ev.detail.key === STORAGE_KEY) {
            const value = Array.isArray(ev.detail.value) ? ev.detail.value : [];
            apply(value);
        }
    });

    client.port?.postMessage({ type: 'GET_STORAGE', key: STORAGE_KEY });
}
