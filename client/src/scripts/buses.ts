import Client from "../Client";

const DILIZANS_CMDS = ["wem", "wsiadz do dylizansu", "wlm"];
const DILIZANS_LABEL = DILIZANS_CMDS.join(";");

const POWOZ_CMDS = ["wem", "wsiadz do wozu", "wsiadz do powozu", "wlm"];
const POWOZ_LABEL = POWOZ_CMDS.join(";");

const BRYCZKA_CMDS = ["wem", "usiadz na bryczce", "wlm"];
const BRYCZKA_LABEL = BRYCZKA_CMDS.join(";");

function bindBus(client: Client, commands: string[], label: string, beep: boolean) {
    if (beep) {
        client.playSound("beep");
    }
    client.FunctionalBind.set(label, () => {
        commands.forEach(cmd => client.sendCommand(cmd));
    });
}

export default function initBuses(client: Client) {
    const boardDylizans = () => {
        bindBus(client, DILIZANS_CMDS, DILIZANS_LABEL, false);
        return undefined;
    };
    const exitPowozPatterns: Array<RegExp | string> = [
        /.*owoz cicho skrzypiac zatrzymuje sie\.$/,
        /.*kolysanie ustaje w koncu i woz zatrzymuje sie\.$/,
        /.*Powoli pojazd zaczyna tracic predkosc.*/,
        "Woz cicho skrzypiac zatrzymuje sie.",
        "Otwarty jadacy powoz powoli zatrzymuje sie.",
    ];

    const boardPowoz = (_raw: string, line: string) => {
        if (line.includes("powoli rusza w droge")) return undefined;
        if (exitPowozPatterns.some(p => typeof p === "string" ? line === p : p.test(line))) {
            return undefined;
        }
        bindBus(client, POWOZ_CMDS, POWOZ_LABEL, false);
        return undefined;
    };

    const exitPowoz = () => {
        bindBus(client, ["wyjscie"], "wyjscie", true);
        return undefined;
    };
    const boardBryczka = () => {
        bindBus(client, BRYCZKA_CMDS, BRYCZKA_LABEL, false);
        return undefined;
    };
    const exitBryczka = () => {
        bindBus(client, ["wstan"], "wstan", false);
        return undefined;
    };

    client.Triggers.registerTrigger(/.*dylizans powoli zatrzymuje sie.*/, boardDylizans, "buses");
    client.Triggers.registerTrigger(/.*i wsiada do.*dylizansu/, boardDylizans, "buses");
    client.Triggers.registerTrigger(/[A-Za-z]+ stojacy dylizans/, boardDylizans, "buses");

    const boardPowozPatterns: Array<RegExp | string> = [
        /.*(?:po)?woz.*powoli zatrzymuje sie\./,
        /^Kupiecki stojacy (po|)woz$/,
        "Drewniany stojacy woz",
        "Otwarty stojacy powoz",
        "Kupiecki stojacy woz z plandeka",
    ];
    boardPowozPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, boardPowoz, "buses")
    );

    exitPowozPatterns.forEach(p =>
        client.Triggers.registerTrigger(p, exitPowoz, "buses")
    );

    client.Triggers.registerTrigger(/.*i wsiada do.*powozu/, boardPowoz, "buses");

    client.Triggers.registerTrigger(/^.*siada w .*bryczce\.$/, boardBryczka, "buses");
    client.Triggers.registerTrigger(/^.*zsiada z .*bryczki\.$/, exitBryczka, "buses");
    client.Triggers.registerTrigger(/^.*siada na .*wozie\.$/, boardBryczka, "buses");
    client.Triggers.registerTrigger(/^.*zsiada z .*wozu\.$/, exitBryczka, "buses");
}
