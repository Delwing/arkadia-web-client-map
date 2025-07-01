import Client from "../Client";

let onShip = false;

const BOARD_CMDS = [
    "wem",
    "kup bilet",
    "wsiadz na statek",
    "wlm",
];
const BOARD_LABEL = BOARD_CMDS.join(";");

function bindShip(client: Client, commands: string[], label: string, beep: boolean) {
    if (beep) {
        client.playSound("beep");
    }
    client.FunctionalBind.set(label, () => {
        if (commands.length === 1 && commands[0] === "zejdz ze statku") {
            client.sendEvent("refreshPositionWhenAble");
            onShip = false;
        } else {
            onShip = true;
        }
        commands.forEach(cmd => Input.send(cmd));
    });
}

export default function initShips(client: Client) {
    onShip = false;
    const board = (beep: boolean) => (
        _raw: string,
        _line: string,
        _matches: RegExpMatchArray,
        _type: string
    ) => {
        if (!onShip) {
            bindShip(client, BOARD_CMDS, BOARD_LABEL, beep);
        }
        return undefined;
    };
    const disembark = () => {
        bindShip(client, ["zejdz ze statku"], "zejdz ze statku", true);
        return undefined;
    };

    client.Triggers.registerTrigger(/.*przybija wielki trojmasztowy galeon\.$/, board(true), "ships");

    [
        /.*(rypa|ratwa|rom|arka) przybija do brzegu\.$/,
        /^Tratwa(\.|,| i)/,
        /^Rzeczna tratwa(\.|,| i)/,
    ].forEach(p => client.Triggers.registerTrigger(p, board(true), "ships"));

    client.Triggers.registerTrigger(/^(?!Ktos|Jakis|Jakas).*(Doplynelismy.*(Mozna|w calej swej)|Marynarze sprawnie cumuja)/, disembark, "ships");

    [
        /^[a-zA-Z]+ [a-z]+ prom[^a-z]$/,
        /^Prom(\.|,| i)/,
        /^Barka(\.|,| i)/,
    ].forEach(p => client.Triggers.registerTrigger(p, board(true), "ships"));

    const statki = [
        /^([A-Za-z]+) (statek|knara)(\.|,| i)/,
        /^([A-Za-z]+) ([a-z]+) statek(\.|,| i)/,
        /Tajemniczy okret/,
        /Wielki trojmasztowy galeon(\.|,| i)/,
        /Stara niewielka szkuta/,
        /Smukly drakkar/,
        /Szeroka knara/,
        /Mala feluka/,
        /Stara szkuta/,
        /Stara niewielka szkuta/,
        /Stary buzar/,
        /Smukly bryg/,
        /Smukly majestatyczny bryg/,
        /Nieduzy barkas/,
        /Nieduza rzeczna barka/,
        /Wielka galera/,
        /Niewielki dwumasztowy statek/,
        /Dluga niezgrabna barka/,
        /Plaskodenny skeid/,
    ];
    statki.forEach(p => client.Triggers.registerTrigger(p, board(false), "ships"));
}
