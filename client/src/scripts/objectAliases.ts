import Client from "../Client";

export default function initObjectAliases(
    client: Client,
    aliases?: { pattern: RegExp; callback: Function }[]
) {
    function findByShortcut(short: string) {
        const lower = short.toLowerCase();
        return client
            .ObjectManager
            .getObjectsOnLocation()
            .find(o => o.shortcut?.toLowerCase() === lower);
    }

    function exec(short: string, command: string) {
        const obj = findByShortcut(short);
        if (obj) {
            Input.send(`${command} ${obj.num}`);
        }
    }

    if (aliases) {
        aliases.push({
            pattern: /\/z ([A-Za-z0-9@]+)$/,
            callback: (m: RegExpMatchArray) => exec(m[1], "zabij")
        });
        aliases.push({
            pattern: /\/za ([A-Za-z0-9@]+)$/,
            callback: (m: RegExpMatchArray) => exec(m[1], "zaslon")
        });
    }
}
