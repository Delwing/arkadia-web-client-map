import Client from "../Client";
import {colorString, findClosestColor} from "../Colors";
import {stripAnsiCodes} from "../Triggers";

const GROUP_NAME_COLOR = findClosestColor('#557C99');
const MITHRIL_COLOR = findClosestColor('#afeeee');
const GOLD_COLOR = findClosestColor('#FFD700');
const SILVER_COLOR = findClosestColor('#C0C0C0');
const COPPER_COLOR = findClosestColor('#8B4513');

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

export function createRegexpFilter(patterns: string[], isEndOfLine: boolean = false): (item: string) => boolean {
    const regs = "(" + patterns.map(pattern => "(^|\\s)" + pattern + (isEndOfLine ? "\\S*$" : "")).join("|") + ")"
    const regex = new RegExp(regs);
    return (item: string) => regex.test(item);
}

// Polish number words mapping to numeric values
const polishNumbers: Record<string, number> = {
    'jeden': 1, 'jedna': 1, 'jedno': 1,
    'dwa': 2, 'dwie': 2,
    'trzy': 3,
    'cztery': 4,
    'piec': 5,
    'szesc': 6,
    'siedem': 7,
    'osiem': 8,
    'dziewiec': 9,
    'dziesiec': 10,
    'jedenascie': 11,
    'dwanascie': 12,
    'trzynascie': 13,
    'czternascie': 14,
    'pietnascie': 15,
    'szesnascie': 16,
    'siedemnascie': 17,
    'osiemnascie': 18,
    'dziewietnascie': 19,
    'dwadziescia': 20,
    'dwadziescia jeden': 21, 'dwadziescia jedna': 21,
    'dwadziescia dwa': 22, 'dwadziescia dwie': 22,
    'dwadziescia trzy': 23,
    'dwadziescia cztery': 24,
    'dwadziescia piec': 25,
    'dwadziescia szesc': 26,
    'dwadziescia siedem': 27,
    'dwadziescia osiem': 28,
    'dwadziescia dziewiec': 29,
    'trzydziesci': 30,
    'trzydziesci jeden': 31, 'trzydziesci jedna': 31,
    'trzydziesci dwa': 32, 'trzydziesci dwie': 32,
    'trzydziesci trzy': 33,
    'trzydziesci cztery': 34,
    'trzydziesci piec': 35,
    'trzydziesci szesc': 36,
    'trzydziesci siedem': 37,
    'trzydziesci osiem': 38,
    'trzydziesci dziewiec': 39,
    'czterdziesci': 40,
    'czterdziesci jeden': 41, 'czterdziesci jedna': 41,
    'czterdziesci dwa': 42, 'czterdziesci dwie': 42,
    'czterdziesci trzy': 43,
    'czterdziesci cztery': 44,
    'czterdziesci piec': 45,
    'czterdziesci szesc': 46,
    'czterdziesci siedem': 47,
    'czterdziesci osiem': 48,
    'czterdziesci dziewiec': 49,
    'piecdziesiat': 50
};

// Create regex pattern for all Polish numbers
const polishNumberPattern = Object.keys(polishNumbers)
    .sort((a, b) => b.length - a.length) // Sort by length descending to match longer phrases first
    .map(num => num.replace(/\s+/g, '\\s+')) // Allow flexible whitespace
    .join('|');

export function parseItems(content: string): ContainerItem[] {
    let rest = content.trim();
    rest = rest.replace(/\s+i\s+([^,]+)(\.)?$/, ', $1');
    rest = rest.replace(/\.$/, '');
    const parts = rest.split(/,\s*/).map(p => p.trim()).filter(p => p.length > 0);
    return parts.map(p => {
        // Try to match Polish numbers first (including compound numbers)
        const polishMatch = p.match(new RegExp(`^(wiele|${polishNumberPattern}|\\d+)\\s+(.*)`, 'i'));
        if (polishMatch) {
            const countStr = polishMatch[1].toLowerCase();
            let count: string | number;

            if (countStr === 'wiele') {
                count = 'wie';
            } else if (/^\d+$/.test(countStr)) {
                count = parseInt(countStr, 10);
            } else {
                // Convert Polish number to numeric value
                const normalizedCount = countStr.replace(/\s+/g, ' ');
                count = polishNumbers[normalizedCount] || countStr;
            }

            return {count, name: polishMatch[2]};
        }
        return {count: 1, name: p};
    });
}

export function parseContainer(line: string | RegExpMatchArray): ParsedContainer | null {
    const matches: RegExpMatchArray | null =
        typeof line === 'string'
            ? defaultContainerPatterns.map(p => line.match(p)).find(Boolean) || null
            : line;
    if (matches && (matches.groups?.content || matches.groups?.container)) {
        const container = matches.groups?.container?.trim() ?? '';
        const content = matches.groups?.content ?? '';
        return {container, items: parseItems(content)};
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
    return str + ' '.repeat(Math.max(0, len - stripAnsiCodes(str).length));
}

function center(str: string, len: number) {
    const total = Math.max(len, str.length);
    const left = Math.floor((total - str.length) / 2);
    const right = total - str.length - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
}

export type TransformDefinition = {
    check: (item: string, count: string | number, group: string) => boolean;
    transform: (value: string) => string;
};

export type FormatOptions = {
    columns?: number;
    padding?: number;
    transforms?: TransformDefinition[];
};

export function formatTable(title: string, groups: Record<string, ContainerItem[]>, opts: FormatOptions = {}): string {
    const columns = opts.columns ?? 1;
    const padding = opts.padding ?? 1;
    const activeTransforms = opts.transforms ?? defaultTransforms;
    const padSpace = ' '.repeat(padding);

    const entries = Object.entries(groups).filter(([, it]) => it.length > 0);

    const allLines = entries.flatMap(([name, items]) => {
        const itemTexts = items.map(it => {
            let text = `${String(it.count).padStart(3, ' ')} | ${it.name}`;
            for (const tr of activeTransforms) {
                if (tr.check(it.name, it.count, name)) {
                    text = tr.transform(text);
                    break;
                }
            }
            return text;
        });
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
            gLine += cell(colorString(grp ? grp[0] : '', GROUP_NAME_COLOR));
            gLine += c === columns - 1 ? '' : ' | ';
        }
        gLine += '|';
        lines.push(gLine);
        lines.push(`+${horiz}+`);

        const maxItems = Math.max(...pair.map(([, _items]) => _items.length));
        for (let i = 0; i < maxItems; i++) {
            let rowLine = '|';
            for (let c = 0; c < columns; c++) {
                const grp = pair[c];
                const item = grp && grp[1][i];
                let text = item ? `${String(item.count).padStart(3, ' ')} | ${item.name}` : '';
                if (item && grp) {
                    for (const tr of activeTransforms) {
                        if (tr.check(item.name, item.count, grp[0])) {
                            text = tr.transform(text);
                            break;
                        }
                    }
                }
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
    matches: RegExpMatchArray,
    columns = 1,
    title = 'POJEMNIK',
    padding = 1,
) {
    const parsed = parseContainer(matches);
    if (!parsed) return '';
    const categorized = categorizeItems(parsed.items, defs);
    const tableTitle = title || parsed.container;
    return formatTable(tableTitle, categorized, {columns, padding});
}


const defaultContainerPatterns: RegExp[] = [
    /^Otwart(?:y|a|e) (?<container>.+? (?:plecak|torba|sakwa|sakiewka|szkatulka|wor|worek))(?: z .*?)? zawiera (?<content>.*)\.$/i,
    /^Otwarty .+? (?<container>kosz(?:|yk)) zawiera (?<content>.*)\.$/i,
    /^Otwierasz na chwile (?<container>.+? (?:plecak|torba|sakwa|sakiewka|szkatulka|wor|worek)), sprawdzajac zawartosc\. W srodku dostrzegasz (?<content>.*)\.$/i,
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

const defaultTransforms: TransformDefinition[] = [
    { check: (item: string) => item.match("mithryl\\w+ monet") != null, transform: (item) => colorString(item, MITHRIL_COLOR)},
    { check: (item: string) => item.match("zlot\\w+ monet") != null, transform: (item) => colorString(item, GOLD_COLOR)},
    { check: (item: string) => item.match("srebrn\\w+") != null, transform: (item) => colorString(item, SILVER_COLOR)},
    { check: (item: string) => item.match("miedzian\\w+ monet") != null, transform: (item) => colorString(item, COPPER_COLOR)}
]


export default function initContainers(client: Client) {
    const tag = 'prettyContainers';
    let enabled = false;
    let columns = 2;

    const register = () => {
        client.Triggers.removeByTag(tag);
        defaultContainerPatterns.forEach(pattern => {
            client.Triggers.registerTrigger(pattern, (_, __, matches): undefined => {
                client.print(prettyPrintContainer(matches, columns, 'POJEMNIK', 5));
            }, tag);
        });
    };

    client.addEventListener('settings', (ev: CustomEvent) => {
        columns = ev.detail.containerColumns ?? columns;
        const shouldEnable = !!ev.detail.prettyContainers;
        if (shouldEnable && !enabled) {
            enabled = true;
            register();
        } else if (!shouldEnable && enabled) {
            client.Triggers.removeByTag(tag);
            enabled = false;
        }
    });
}
