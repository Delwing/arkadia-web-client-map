import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";

const COLOR = findClosestColor('#6a5acd');
const PANIC_COLOR = findClosestColor('#ff8c00');

const ARROWS: Record<string, string> = {
    'wschod': '→',
    'zachod': '←',
    'polnoc': '↑',
    'poludnie': '↓',
    'polnocny-wschod': '↗',
    'polnocny-zachod': '↖',
    'poludniowy-wschod': '↘',
    'poludniowy-zachod': '↙',
    'gora': '↑',
    'dol': '↓',
};

export default function initEscape(client: Client) {
    const tag = 'escape';
    const parent = client.Triggers.registerTrigger(
        /(.*) uciekl.* ci\.$/,
        (_, line) => colorString(line, COLOR),
        tag,
        { stayOpenLines: 20 }
    );

    parent.registerChild(/(.*) podaza(?:ja)? na ([a-z-]+)\.$/, (_, line, m) => {
        const dir = m[2];
        const arrow = ARROWS[dir] ? ` ${ARROWS[dir]}` : '';
        return colorString(line + arrow, COLOR);
    });

    parent.registerChild(/(.*) w panice .* na ([a-z-]+)\.$/, (_, line, m) => {
        const dir = m[2];
        const arrow = ARROWS[dir] ? ` ${ARROWS[dir]}` : '';
        return colorString(line + arrow, PANIC_COLOR);
    });
}
