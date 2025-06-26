export type GroupDefinition = {
    name: string;
    filter: (item: string) => boolean;
};

export type ContainerItem = {
    name: string;
    count: string | number;
};

export type ParsedContainer = {
    container: string;
    items: ContainerItem[];
};

export function createRegexpFilter(patterns: (string | RegExp)[]): (item: string) => boolean {
    const regs = patterns.map(p => typeof p === 'string' ? new RegExp(p, 'i') : p);
    return (item: string) => regs.some(r => r.test(item));
}

export const defaultContainerPatterns: RegExp[] = [
    /^Otwart(?:y|a|e) (?<container>.+? (?:plecak|torba|sakwa|sakiewka|szkatulka|wor|worek))(?: z .*?)? zawiera (?<content>.*)\.$/i,
    /^Otwarty .+? (?<container>kosz(?:|yk)) zawiera (?<content>.*)\.$/i,
];

export function parseItems(content: string): ContainerItem[] {
    let rest = content.trim();
    rest = rest.replace(/\s+i\s+([^,]+)\.$/, ', $1');
    rest = rest.replace(/\.$/, '');
    const parts = rest.split(/,\s*/).map(p => p.trim()).filter(p => p.length > 0);
    return parts.map(p => {
        const mm = p.match(/^(wiele|\d+)\s+(.*)/i);
        if (mm) {
            return { count: mm[1] === 'wiele' ? 'wie' : mm[1], name: mm[2] };
        }
        return { count: 1, name: p };
    });
}

export function parseContainer(line: string, patterns: RegExp[] = defaultContainerPatterns): ParsedContainer | null {
    for (const re of patterns) {
        const m = line.match(re);
        if (m && (m.groups?.content || m.groups?.container)) {
            const container = m.groups?.container?.trim() ?? '';
            const content = m.groups?.content ?? '';
            return { container, items: parseItems(content) };
        }
    }
    return null;
}


export function categorizeItems(items: ContainerItem[], groups: GroupDefinition[]) {
    const result: Record<string, ContainerItem[]> = {};
    for (const g of groups) result[g.name] = [];
    result['inne'] = [];
    for (const item of items) {
        const g = groups.find(gr => gr.filter(item.name));
        if (g) result[g.name].push(item); else result['inne'].push(item);
    }
    return result;
}

function pad(str: string, len: number) {
    return str + ' '.repeat(Math.max(0, len - str.length));
}

function center(str: string, len: number) {
    const total = Math.max(len, str.length);
    const left = Math.floor((total - str.length) / 2);
    const right = total - str.length - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
}

export function formatTable(title: string, groups: Record<string, ContainerItem[]>, columns = 1): string {
    const allItems: ContainerItem[] = Object.values(groups).flat();
    const itemLines = allItems.map(it => `${String(it.count).padStart(3, ' ')} | ${it.name}`);
    let colWidth = Math.max(title.length, ...itemLines.map(l => l.length)) + 2;
    const width = columns * colWidth + (columns - 1) * 3 + 2;
    const horiz = '-'.repeat(width - 2);
    let out = `/${horiz}\\\n`;
    out += `|${center(title, width - 2)}|\n`;
    out += `+${horiz}+\n`;
    for (const [gName, items] of Object.entries(groups)) {
        if (items.length === 0) continue;
        out += `|${pad(' ' + gName, width - 2)}|\n`;
        out += `+${horiz}+\n`;
        for (let i = 0; i < items.length; i += columns) {
            let line = '|';
            for (let c = 0; c < columns; c++) {
                const it = items[i + c];
                if (it) {
                    const text = `${String(it.count).padStart(3, ' ')} | ${it.name}`;
                    line += pad(text, colWidth);
                } else {
                    line += ' '.repeat(colWidth);
                }
                line += c === columns - 1 ? '' : ' | ';
            }
            line += '|\n';
            out += line;
        }
        out += `+${horiz}+\n`;
    }
    out = out.slice(0, -1); // remove last \n
    out += `\\${horiz}/`;
    return out;
}

export function prettyPrintContainer(line: string, defs: GroupDefinition[], columns = 1, title = 'POJEMNIK', patterns: RegExp[] = defaultContainerPatterns) {
    const parsed = parseContainer(line, patterns);
    if (!parsed) return '';
    const categorized = categorizeItems(parsed.items, defs);
    const tableTitle = title || parsed.container;
    return formatTable(tableTitle, categorized, columns);
}
