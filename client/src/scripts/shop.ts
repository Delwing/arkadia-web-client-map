import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";
import { stripAnsiCodes } from "../Triggers";

export interface ShopOptions {
    normalWidth: number;
    tag: string;
    splitReg: RegExp;
    headerReg: RegExp;
    itemReg: RegExp;
    makeSplit: (width: number) => string;
    makeHeader: (width: number, pad: (s: string, len: number) => string) => string;
    makeItem: (width: number, pad: (s: string, len: number) => string, match: RegExpMatchArray) => string;
}

export const MITHRIL_COLOR = findClosestColor('#afeeee');
export const GOLD_COLOR = findClosestColor('#FFD700');
export const SILVER_COLOR = findClosestColor('#C0C0C0');
export const COPPER_COLOR = findClosestColor('#8B4513');
export const CURRENCY_COLORS = [
    MITHRIL_COLOR,
    GOLD_COLOR,
    SILVER_COLOR,
    COPPER_COLOR,
] as const;

export function formatItem(
    width: number,
    pad: (s: string, len: number) => string,
    match: RegExpMatchArray,
    amountIndex?: number,
    colors: readonly number[] = CURRENCY_COLORS
): string {
    const name = match[1];
    const costs = match.slice(2, 6);
    const amount = typeof amountIndex === 'number' ? match[amountIndex] : undefined;

    const coloredCosts = costs.map((c, i) => colorString(c === "" ? "0" : c, colors[i])).join('/');

    const numbersContent = amount && amount !== '1'
        ? `${coloredCosts} Ilosc: ${amount}`
        : coloredCosts;

    const combined = `${name} ${numbersContent}`;
    const fitsSingleLine = stripAnsiCodes(combined).length <= width - 3;
    if (fitsSingleLine) {
        return `| ${pad(combined, width - 3)}|`;
    }

    const nameLine = `| ${pad(name, width - 3)}|`;
    const numbersLine = `| ${pad(numbersContent, width - 3)}|`;
    return nameLine + '\n' + numbersLine;
}

export default function initShop(client: Client, opts: ShopOptions) {
    let width = client.contentWidth;
    client.addEventListener('contentWidth', (ev: CustomEvent) => {
        width = ev.detail;
    });

    const pad = (str: string, len: number) => str + " ".repeat(Math.max(0, len - stripAnsiCodes(str).length));

    client.Triggers.registerTrigger(opts.splitReg, () => {
        if (width >= opts.normalWidth) return undefined;
        return opts.makeSplit(width);
    }, opts.tag);

    client.Triggers.registerTrigger(opts.headerReg, () => {
        if (width >= opts.normalWidth) return undefined;
        return opts.makeHeader(width, pad);
    }, opts.tag);

    client.Triggers.registerTrigger(opts.itemReg, (_raw, _line, m) => {
        if (width >= opts.normalWidth) return undefined;
        return opts.makeItem(width, pad, m);
    }, opts.tag);
}
