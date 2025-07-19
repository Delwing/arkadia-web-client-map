import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";

const COLORS: Record<string, number> = {
    green: findClosestColor("#00ff00"),
    yellow: findClosestColor("#ffff00"),
    red: findClosestColor("#ff0000"),
};

const WEAR_USED_DESC: Record<string, string> = {
    "calkiem nowe.": "[5/5]",
    "calkiem nowa.": "[5/5]",
    "w miare nowe.": "[4/5]",
    "w miare nowa.": "[4/5]",
    "troche znoszone.": "[3/5]",
    "troche znoszona.": "[3/5]",
    "prawie calkiem znoszone.": "[2/5]",
    "prawie calkiem znoszona.": "[2/5]",
    "gotowe rozpasc sie w kazdej chwili.": "[1/5]",
    "gotowa rozpasc sie w kazdej chwili.": "[1/5]",
};

const WEAR_USED_COLOR: Record<string, string> = {
    "calkiem nowe.": "green",
    "calkiem nowa.": "green",
    "w miare nowe.": "green",
    "w miare nowa.": "green",
    "troche znoszone.": "yellow",
    "troche znoszona.": "yellow",
    "prawie calkiem znoszone.": "red",
    "prawie calkiem znoszona.": "red",
    "gotowe rozpasc sie w kazdej chwili.": "red",
    "gotowa rozpasc sie w kazdej chwili.": "red",
};

export function processWearUsed(rawLine: string, desc: string): string {
    const key = desc.toLowerCase();
    const replacement = WEAR_USED_DESC[key];
    if (!replacement) return rawLine;
    const colorName = WEAR_USED_COLOR[key] ?? "red";
    const colorCode = COLORS[colorName] ?? COLORS.red;
    const coloredDesc = colorString(desc, colorCode);
    const coloredValue = colorString(replacement, colorCode);
    return rawLine.replace(desc, `${coloredDesc} ${coloredValue}`);
}

export default function initWearUsed(client: Client) {
    const pattern = /^Ubranie to.* wyglada na (.*)$/;
    client.Triggers.registerTrigger(pattern, (raw, _line, m) => {
        const desc = m[1];
        return processWearUsed(raw, desc);
    }, "wear-used");
}
