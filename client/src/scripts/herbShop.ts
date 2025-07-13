import Client from "../Client";
import { stripAnsiCodes } from "../Triggers";

export default function initHerbShop(client: Client) {
    let width = client.contentWidth;
    client.addEventListener('contentWidth', (ev: CustomEvent) => {
        width = ev.detail;
    });

    const NORMAL_WIDTH = 88;
    const splitReg = /^\+-{58}\+-{4}\+-{4}\+-{4}\+-{4}\+-{7}\+$/;
    const headerReg = /^\|\s*Nazwa towaru\s*\|\s*mt\s*\|\s*zl\s*\|\s*sr\s*\|\s*md\s*\|\s*Ilosc\s*\|$/;
    const itemReg = /^\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|$/;

    const pad = (str: string, len: number) => str + " ".repeat(Math.max(0, len - stripAnsiCodes(str).length));

    client.Triggers.registerTrigger(splitReg, () => {
        if (width >= NORMAL_WIDTH) return undefined;
        return `+${"-".repeat(Math.max(0, width - 2))}+`;
    }, 'herb-shop');

    client.Triggers.registerTrigger(headerReg, () => {
        if (width >= NORMAL_WIDTH) return undefined;
        const nameLine = `| ${pad('Nazwa towaru', width - 3)}|`;
        const numbers = '| mt | zl | sr | md | Ilosc |';
        const padded = numbers + ' '.repeat(Math.max(0, width - numbers.length));
        return nameLine + '\n' + padded;
    }, 'herb-shop');

    client.Triggers.registerTrigger(itemReg, (_raw, _line, m) => {
        if (width >= NORMAL_WIDTH) return undefined;
        const name = m[1];
        const mt = m[2];
        const zl = m[3];
        const sr = m[4];
        const md = m[5];
        const amount = m[6];
        const nameLine = `| ${pad(name, width - 3)}|`;
        const numbersBase = `| ${mt.padStart(2, ' ')} | ${zl.padStart(2, ' ')} | ${sr.padStart(2, ' ')} | ${md.padStart(2, ' ')} | ${amount.padStart(5, ' ')} |`;
        const numbersLine = numbersBase + ' '.repeat(Math.max(0, width - numbersBase.length));
        return nameLine + '\n' + numbersLine;
    }, 'herb-shop');
}
