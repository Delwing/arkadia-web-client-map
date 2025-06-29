import Client from "../Client";
import {stripAnsiCodes} from "../Triggers";
import {encloseColor, findClosestColor} from "../Colors";

const STORAGE_KEY = "containers";

const availableTypes = ["money", "gems", "food", "other"] as const;

const bagInBiernik: Record<string, string> = {
    plecak: "plecak",
    torba: "torbe",
    worek: "worek",
    sakiewka: "sakiewke",
    mieszek: "mieszek",
    sakwa: "sakwe",
    wor: "wor",
    szkatulka: "szkatulke",
    kaletka: "kaletke",
};

const bagInDopelniacz: Record<string, string> = {
    plecak: "plecaka",
    torba: "torby",
    worek: "worka",
    sakiewka: "sakiewki",
    mieszek: "mieszka",
    sakwa: "sakwy",
    wor: "wora",
    szkatulka: "szkatulki",
    kaletka: "kaletki",
};

const bagPronouns: Record<string, { biernik: string; dopelniacz: string }> = {
    plecak: { biernik: "swoj", dopelniacz: "swojego" },
    torba: { biernik: "swoja", dopelniacz: "swojej" },
    worek: { biernik: "swoj", dopelniacz: "swojego" },
    sakiewka: { biernik: "swoja", dopelniacz: "swojej" },
    mieszek: { biernik: "swoj", dopelniacz: "swojego" },
    sakwa: { biernik: "swoja", dopelniacz: "swojej" },
    wor: { biernik: "swoj", dopelniacz: "swojego" },
    szkatulka: { biernik: "swoja", dopelniacz: "swojej" },
    kaletka: { biernik: "swoja", dopelniacz: "swojej" },
};

type ContainerConfig = Record<(typeof availableTypes)[number], string>;

const containerConfig: ContainerConfig = {
    money: "plecak",
    gems: "plecak",
    food: "plecak",
    other: "plecak",
};

function getBagForms(bag: string) {
    return {
        biernik: bagInBiernik[bag],
        dopelniacz: bagInDopelniacz[bag],
        pronoun_b: bagPronouns[bag].biernik,
        pronoun_d: bagPronouns[bag].dopelniacz,
    };
}

function saveConfig(client: Client) {
    client.port?.postMessage({ type: "SET_STORAGE", key: STORAGE_KEY, value: containerConfig });
}

function setContainer(type: keyof ContainerConfig, bag: string, client: Client) {
    containerConfig[type] = bag;
    client.print(`Ustawiono ${bag} jako pojemnik na '${type}'.`);
    saveConfig(client);
}

function setAll(bag: string, client: Client) {
    availableTypes.forEach((t) => (containerConfig[t] = bag));
    client.print(`Ustawiono ${bag} jako pojemnik na wszystkie typy.`);
    saveConfig(client);
}

function containerAction(
    client: Client,
    type: keyof ContainerConfig,
    action: "put" | "take",
    item: string
) {
    const bag = containerConfig[type];
    if (!bag) {
        client.print(`Brak pojemnika dla typu '${type}'.`);
        return;
    }
    const forms = getBagForms(bag);
    const items = item
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length);
    Input.send(`otworz ${forms.pronoun_b} ${forms.biernik}`);
    items.forEach((it) =>
        Input.send(
            action === "put"
                ? `wloz ${it} do ${forms.pronoun_d} ${forms.dopelniacz}`
                : `wez ${it} ze ${forms.pronoun_d} ${forms.dopelniacz}`
        )
    );
    Input.send(`zamknij ${forms.pronoun_b} ${forms.biernik}`);
}

function showConfig(client: Client) {
    const pairs = availableTypes.map((t) => [t, containerConfig[t]]);

    const headerColor = findClosestColor("#7cfc00");
    const typeColor = findClosestColor("#cfb530");
    const bagColor = findClosestColor("#87ceeb");

    const headers = ["typ", "pojemnik"];
    const col1Width = Math.max(...pairs.map(([t]) => t.length), headers[0].length);
    const col2Width = Math.max(...pairs.map(([, b]) => b.length), headers[1].length);

    const visible = (str: string) => stripAnsiCodes(str).length;
    const pad = (str: string, len: number) => str + " ".repeat(Math.max(0, len - visible(str)));
    const center = (str: string, len: number) => {
        const l = visible(str);
        const left = Math.floor((len - l) / 2);
        return " ".repeat(left) + str + " ".repeat(len - l - left);
    };

    const width = col1Width + col2Width + 7;
    const horiz1 = "-".repeat(col1Width + 2);
    const horiz2 = "-".repeat(col2Width + 2);

    const lines: string[] = [];
    lines.push(`/${"-".repeat(width - 2)}\\`);
    lines.push(`|${center(encloseColor("POJEMNIKI", headerColor), width - 2)}|`);
    lines.push(`+${horiz1}+${horiz2}+`);
    lines.push(`| ${pad(headers[0], col1Width)} | ${pad(headers[1], col2Width)} |`);
    lines.push(`+${horiz1}+${horiz2}+`);
    pairs.forEach(([t, b]) => {
        const type = encloseColor(t, typeColor);
        const bag = encloseColor(b, bagColor);
        lines.push(`| ${pad(type, col1Width)} | ${pad(bag, col2Width)} |`);
    });
    lines.push(`\\${"-".repeat(width - 2)}/`);
    client.println(lines.join("\n"));
}

function showInterface(client: Client, bags: string[]) {
    const lines: string[] = [];
    bags.forEach((bag) => {
        let line = `Ustaw ${bag} jako:`;
        availableTypes.forEach((type) => {
            const text = `${type}`;
            line += " [ " + encloseColor(client.OutputHandler.makeClickable(text, text, () => setContainer(type, bag, client)), findClosestColor("#cfb530")) + " ]";
        });
        const allText = `wszystkie`;
        line += " [ " + encloseColor(client.OutputHandler.makeClickable(allText, allText, () => setAll(bag, client)), findClosestColor("#cfb530")) + " ]";
        lines.push(line);
    });
    client.println(lines.join("\n"));
}

function configure(client: Client) {
    const found: string[] = [];
    const tag = "bag-config";
    client.Triggers.registerTrigger(/.*/, (raw, line) => {
        const l = stripAnsiCodes(line).toLowerCase();
        if (l.startsWith("masz przy sobie")) {
            client.Triggers.removeByTag(tag);
            showInterface(client, found);
        } else {
            Object.entries(bagInBiernik).forEach(([name, biernik]) => {
                if (l.includes(biernik) && !found.includes(name)) {
                    found.push(name);
                }
            });
        }
        return raw;
    }, tag);
    client.sendCommand("i");
}

export default function initBagManager(
    client: Client,
    aliases?: { pattern: RegExp; callback: Function }[]
) {
    client.addEventListener("storage", (ev: CustomEvent) => {
        if (ev.detail.key === STORAGE_KEY && ev.detail.value) {
            Object.assign(containerConfig, ev.detail.value);
        }
    });
    client.port?.postMessage({ type: "GET_STORAGE", key: STORAGE_KEY });
    window.addEventListener("beforeunload", () => saveConfig(client));

    if (aliases) {
        aliases.push({ pattern: /\/pojemnik$/, callback: () => configure(client) });
        aliases.push({ pattern: /\/pojemniki$/, callback: () => showConfig(client) });
        aliases.push({ pattern: /\/wdp (.*)/, callback: (m: RegExpMatchArray) => containerAction(client, "other", "put", m[1]) });
        aliases.push({ pattern: /\/wzp (.*)/, callback: (m: RegExpMatchArray) => containerAction(client, "other", "take", m[1]) });
        aliases.push({ pattern: /\/wlp$/, callback: () => containerAction(client, "other", "put", "pocztowa paczke") });
        aliases.push({ pattern: /\/wep$/, callback: () => containerAction(client, "other", "take", "pocztowa paczke") });
        aliases.push({ pattern: /\/wem$/, callback: () => containerAction(client, "money", "take", "monety") });
        aliases.push({ pattern: /\/wlm$/, callback: () => containerAction(client, "money", "put", "monety") });
    }
}
