import Client from "../Client";

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

function createRegexpFilter(patterns: (string | RegExp)[]): (item: string) => boolean {
    const regs = patterns.map(p => typeof p === 'string' ? new RegExp(p, 'i') : p);
    return (item: string) => regs.some(r => r.test(item));
}

function parseItems(content: string): ContainerItem[] {
    let rest = content.trim();
    rest = rest.replace(/\s+i\s+([^,]+)\.$/, ', $1');
    rest = rest.replace(/\.$/, '');
    const parts = rest.split(/,\s*/).map(p => p.trim()).filter(p => p.length > 0);
    return parts.map(p => {
        const mm = p.match(/^(wiele|\d+)\s+(.*)/i);
        if (mm) {
            return {count: mm[1] === 'wiele' ? 'wie' : mm[1], name: mm[2]};
        }
        return {count: 1, name: p};
    });
}

function parseContainer(matches: RegExpMatchArray): ParsedContainer | null {
    if (matches && (matches.groups?.content || matches.groups?.container)) {
        const container = matches.groups?.container?.trim() ?? '';
        const content = matches.groups?.content ?? '';
        return {container, items: parseItems(content)};
    }
    return null
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

export type FormatOptions = {
    columns?: number;
    padding?: number;
};

export function formatTable(title: string, groups: Record<string, ContainerItem[]>, opts: FormatOptions = {}): string {
    const columns = opts.columns ?? 1;
    const padding = opts.padding ?? 1;
    const padSpace = ' '.repeat(padding);

    const entries = Object.entries(groups).filter(([, it]) => it.length > 0);

    const allLines = entries.flatMap(([name, items]) => {
        const itemTexts = items.map(it => `${String(it.count).padStart(3, ' ')} | ${it.name}`);
        return [name, ...itemTexts];
    });

    const colWidth = Math.max(title.length + padding * 2, ...allLines.map(l => l.length + padding * 2));
    const cell = (text: string) => pad(`${padSpace}${text}${padSpace}`, colWidth);
    const width = columns * colWidth + (columns - 1) * 3 + 2;
    const horiz = '-'.repeat(width - 2);
    const lines: string[] = [];
    lines.push(`/${horiz}\\`);
    lines.push(`|${center(title, width - 2)}|`);
    lines.push(`+${horiz}+`);

    for (let row = 0; row < entries.length; row += columns) {
        const pair = entries.slice(row, row + columns);

        // group names
        let gLine = '|';
        for (let c = 0; c < columns; c++) {
            const grp = pair[c];
            gLine += cell(grp ? grp[0] : '');
            gLine += c === columns - 1 ? '' : ' | ';
        }
        gLine += '|';
        lines.push(gLine);
        lines.push(`+${horiz}+`);

        const maxItems = Math.max(...pair.map(([,_items]) => _items.length));
        for (let i = 0; i < maxItems; i++) {
            let rowLine = '|';
            for (let c = 0; c < columns; c++) {
                const grp = pair[c];
                const item = grp && grp[1][i];
                const text = item ? `${String(item.count).padStart(3, ' ')} | ${item.name}` : '';
                rowLine += cell(text);
                rowLine += c === columns - 1 ? '' : ' | ';
            }
            rowLine += '|';
            lines.push(rowLine);
        }
        lines.push(`+${horiz}+`);
    }

    lines[lines.length - 1] = `\\${horiz}/`;
    return lines.join('\n');
}

export function prettyPrintContainer(
    line: string,
    defs: GroupDefinition[],
    columns = 1,
    title = 'POJEMNIK',
    patterns: RegExp[] = defaultContainerPatterns,
    padding = 1,
) {
    return formatTable(tableTitle, categorized, { columns, padding });
    if (!parsed) return '';
    const categorized = categorizeItems(parsed.items, defs);
    const tableTitle = title || parsed.container;
    return formatTable(tableTitle, categorized, columns);
}

const defaultContainerPatterns: RegExp[] = [
    /^Otwart(?:y|a|e) (?<container>.+? (?:plecak|torba|sakwa|sakiewka|szkatulka|wor|worek))(?: z .*?)? zawiera (?<content>.*)\.$/i,
    /^Otwarty .+? (?<container>kosz(?:|yk)) zawiera (?<content>.*)\.$/i,
];

const weapons = ["darda", "dardy", "multon", "kord", "puginal", "gladius", "topor", "berdysz", "siekier", "czekan",
    "oskard", "kilof", "tasak", "tabar", "nadziak", "macan", "miecz", "sihill", "drannach", "szabl", "szabel", "rapier",
    "scimitar", "katzbalger", "stilett", "pal", "sztylet", "halabard", "falchion", "mlot", "obusz", "wloczni", "pik[ei]",
    "noz", "maczug", "morgenstern", "kordelas", "mizerykordi", "buzdygan", "korbacz", "gal[ae]z(?!k) ", "bulaw", "drag",
    "kiscien", "nog[ai] stolow", "dag[ai]", "wloczni[aei]", "floret", "wekier", "walek", "kostur", "kos[aye]", "szponton",
    "partyzan", "glewi", "gizarm", "dzid", "naginat", "rohatyn", "korsek", "cep", "trojz[ea]b", "ronkon", "runk",
    "flamberg", "poltorak", "bulat", "nimsz", "szamszir", "lami", "schiavon", "lewak", "sierp", "lask[^o]", "wid[el]",
    "saif", "koncerz", "kij", "espadon", "claymor", "cinquend", "szpad", "karabel", "jatagan", "baselard", "katar",
    "bastard", "kafar", "kindzal", "harpun", "kotwic", "kadzielnic", "lancet", "ostrz", "berl", "chepesz",
    "spis( |$|y|e|a)", "talwar", "dluto", "pejcz", "kanczug", "parazonium", "lancuch", "kropacz", "piernacz", "estok",
    "bosak", "fink[aei]", "parazoni", "tulich", "navaj", "smocz.+ pazur"]
const shields = ["tarcz", "puklerz", "pawez", "luskow. pancern. skorup. zolwia"]
const torso = ["brygantyn", "napiersnik", "kirys", "kolczug", "karacen", "kaftan", "tunik", "zbroj", "bajdan[ay]",
    "anim[eay]", "kozus", "kurt", "kamizel", "becht", "pancerz", "zbro. plytow", "polpancerz", "nabrzusznik", "bajdan",
    "aketo"]
const head = ["helm", "burgonet", "misiurk", "kaptur", "morion", "basinet", "salad", "przylbic", "diadem", "szyszak",
    "narbut[ay]", "armet", "casquett", "czapk", "beret", "turban", "gigantyczn. wzmacnian. czaszk", "barbut", "kapalin",
    "koron[^k]", "klobuk"]
const legs = ["nagolennik", "spoden", "nogawic", "buty", "butow", "trzewik", "spodni", "spodnic", "naudziak", "sandal",
    "nakolannik", "nabiodr", "pantofel", "muszkieter"]
const hands = ["nareczak", "naramiennik", "rekawic", "karwasz"]
const wear = ["futro", "kubraczek", "koszul", "sukni", "sukien", "plaszcz", "peleryn", "tog", "szat",
    "bloniaste skrzydl", "chust", "pas( |$|y)", "gemm", "obroz", "szat", "kolnierz", "dublet", "kapelusz", "przepask",
    "wams", "oficer[ek]", "bigwant", "calun", "kapuz", "bluzk", "gorset", "kabat", "szal", "tiar", "tocz[ek]", "peruk",
    "kolpak", "opask", "wian[ek]"]
const jewelery = ["pierscien(?!iowa)", "naszyjnik", "bransolet", "spink", "talizman", "amulet", "kolczyk", "lancuszki",
    "koral", "wisior", "medalion", "lancusz", "brosz", "szarf", "koli[iae]", "sygnet", "obracze?k", "potrojn. sznur.+",
    "cwiek( |$|i|ow)(?!ana)", "serduszk", "grzebyk"]
const gems = ["obsydia(ny|now|n)", "labrado(ry|row|r)", "oliwi(ny|now|n)", "gaga(ty|tow|t)", "fluory(ty|tow|t)",
    "burszty(ny|now|n)", "ametys(ty|tow|t)", "kwar(ce|cow|c)", "rubi(ny|now|n)", "piry(ty|tow|t)", "serpenty(ny|now|n)",
    "per(ly|le|la|el)", "serpenty(ny|now|n)", "malachi(ty|tow|t)", "karneo(le|low|l)", "lazury(ty|tow|t)",
    "nefry(ty|tow|t)", "aleksandry(ty|tow|t)", "celesty(ny|now|n)", "monacy(ty|tow|t)", "azury(ty|tow|t)",
    "jaspi(sy|sow|s)", "onyk(sy|sow|s)", "turmali(ny|now|n)", "awentury(ny|now|n)", "turku(sy|sow|s)", "opa(li|le|l)",
    "kryszta(ly|low|l)", "hematy(ty|tow|t)", "rodoli(ty|tow|t)", "aga(ty|tow|t)", "jaskrawozolt.+ cytry(ny|now|n(?!e))",
    "apaty(ty|tow|t)", "kyani(ty|tow|t)", "akwamary(ny|now|n)", "ioli(ty|tow|t)", "diopsy(dy|dow|d)", "cyrko(ny|now|n)",
    "zoisy(ty|tow|t)", "grana(ty|tow|t)", "almandy(ny|now|n)", "ortokla(zy|zow|z)", "topa(zy|zow|z)", "tytani(ty|tow|t)",
    "diamen(ty|tow|t)", "szafi(ry|row|r)", "szmaragd", "chryzoberyl", "spinel", "chryzopraz", "rodochrozyt", "heliodor"]

const defs = [
    {name: "bronie", filter: createRegexpFilter(weapons)},
    {name: "korpus", filter: createRegexpFilter(torso)},
    {name: "tarcze", filter: createRegexpFilter(shields)},
    {name: "glowa", filter: createRegexpFilter(head)},
    {name: "rece", filter: createRegexpFilter(hands)},
    {name: "nogi", filter: createRegexpFilter(legs)},
    {name: "ubrania", filter: createRegexpFilter(wear)},
    {name: "bizuteria", filter: createRegexpFilter(jewelery)},
    {name: "kamienie", filter: createRegexpFilter(gems)},
]

export default function initContainers(client: Client) {
    defaultContainerPatterns.forEach(pattern => {
        client.Triggers.registerTrigger(pattern, (_, __, matches): undefined => {
            client.print(prettyPrintContainer(matches))
        });
    })
}

