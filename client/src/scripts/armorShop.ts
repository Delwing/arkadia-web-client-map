import Client from "../Client";
import initShop, { ShopOptions, formatItem } from "./shop";

export default function initArmorShop(client: Client) {
    const options: ShopOptions = {
        normalWidth: 75,
        tag: 'armor-shop',
        splitReg: /^-{75}$/,
        headerReg: /^\|\s*Nazwa towaru\s*\|\s*Mithryl\s*\|\s*Zloto\s*\|\s*Srebro\s*\|\s*Miedz\s*\|$/,
        itemReg: /^\|\s*(.+?)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|\s*(\d*)\s*\|$/,
        makeSplit: (width) => "-".repeat(Math.max(0, width)),
        makeHeader: (width, pad) => {
            const nameLine = `| ${pad('Nazwa towaru', width - 3)}|`;
            const numbers = `| ${pad('Mithryl Zloto Srebro Miedz', width - 3)} |`;
            const padded = numbers + ' '.repeat(Math.max(0, width - numbers.length));
            return nameLine + '\n' + padded;
        },
        makeItem: (width, pad, m) => formatItem(width, pad, m)
    };

    initShop(client, options);
}
