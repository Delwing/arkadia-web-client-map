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
    const cmds = [
        `otworz ${forms.pronoun_b} ${forms.biernik}`,
        action === "put"
            ? `wloz ${item} do ${forms.pronoun_d} ${forms.dopelniacz}`
            : `wez ${item} ze ${forms.pronoun_d} ${forms.dopelniacz}`,
        `zamknij ${forms.pronoun_b} ${forms.biernik}`,
    ];
    cmds.forEach((c) => Input.send(c));
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
        aliases.push({ pattern: /\/wdp (.*)/, callback: (m: RegExpMatchArray) => containerAction(client, "other", "put", m[1]) });
        aliases.push({ pattern: /\/wzp (.*)/, callback: (m: RegExpMatchArray) => containerAction(client, "other", "take", m[1]) });
        aliases.push({ pattern: /\/wem$/, callback: () => containerAction(client, "money", "take", "monety") });
        aliases.push({ pattern: /\/wlm$/, callback: () => containerAction(client, "money", "put", "monety") });
    }
}
