import Client from "../Client";
import { colorString, findClosestColor } from "../Colors";

const COLOR = findClosestColor('#6a5acd');

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
        (raw) => colorString(raw, COLOR),
        tag,
        { stayOpenLines: 1 }
    );

    parent.registerChild(/(.*) podaza(?:ja)? na ([a-z-]+)\.$/, (raw, _line, m) => {
        const dir = m[2];
        const arrow = ARROWS[dir] ? ` ${ARROWS[dir]}` : '';
        return colorString(raw + arrow, COLOR);
    });

    parent.registerChild(/(.*) w panice .* na ([a-z-]+)\.$/, (raw, _line, m) => {
        const dir = m[2];
        const arrow = ARROWS[dir] ? ` ${ARROWS[dir]}` : '';
        return colorString(raw + arrow, COLOR);
    });
}
