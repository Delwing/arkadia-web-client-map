import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";
import { stripAnsiCodes } from "../Triggers";

const MITHRIL_COLOR = findClosestColor('#afeeee');
const GOLD_COLOR = findClosestColor('#FFD700');
const SILVER_COLOR = findClosestColor('#C0C0C0');
const COPPER_COLOR = findClosestColor('#8B4513');

export default function initArmorShop(client: Client) {
    let width = client.contentWidth;
    client.addEventListener('contentWidth', (ev: CustomEvent) => {
        width = ev.detail;
    });

    const NORMAL_WIDTH = 75;
    const splitReg = /^-{75}$/;
    const headerReg = /^\|\s*Nazwa towaru\s*\|\s*Mithryl\s*\|\s*Zloto\s*\|\s*Srebro\s*\|\s*Miedz\s*\|$/;
    const itemReg = /^\|\s*(.+?)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|$/;

    const pad = (str: string, len: number) => str + " ".repeat(Math.max(0, len - stripAnsiCodes(str).length));

    client.Triggers.registerTrigger(splitReg, () => {
        if (width >= NORMAL_WIDTH) return undefined;
        return "-".repeat(Math.max(0, width));
    }, 'armor-shop');

    client.Triggers.registerTrigger(headerReg, () => {
        if (width >= NORMAL_WIDTH) return undefined;
        const nameLine = `| ${pad('Nazwa towaru', width - 3)}|`;
        const numbers = '| Mithryl Zloto Srebro Miedz |';
        const padded = numbers + ' '.repeat(Math.max(0, width - numbers.length));
        return nameLine + '\n' + padded;
    }, 'armor-shop');

    client.Triggers.registerTrigger(itemReg, (_raw, _line, m) => {
        if (width >= NORMAL_WIDTH) return undefined;
        const name = m[1];
        const mith = m[2];
        const zloto = m[3];
        const srebro = m[4];
        const miedz = m[5];
        const nameLine = `| ${pad(name, width - 3)}|`;
        const cost = [
            colorString(mith, MITHRIL_COLOR),
            colorString(zloto, GOLD_COLOR),
            colorString(srebro, SILVER_COLOR),
            colorString(miedz, COPPER_COLOR)
        ].join('/')
        const numbersLine = `| ${pad(cost, width - 3)}|`;
        return nameLine + '\n' + numbersLine;
    }, 'armor-shop');
}
