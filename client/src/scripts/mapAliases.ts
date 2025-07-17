import Client from "../Client";

export default function initMapAliases(client: Client, aliases: { pattern: RegExp; callback: Function }[]) {
    aliases.push(
        {
            pattern: /\/cofnij$/,
            callback: () => {
                client.Map.moveBack();
            }
        },
        {
            pattern: /\/move (.*)$/,
            callback: (matches: RegExpMatchArray) => {
                client.Map.move(matches[1]);
            }
        },
        {
            pattern: /\/ustaw (.*)$/,
            callback: (matches: RegExpMatchArray) => {
                client.Map.setMapRoomById(parseInt(matches[1]));
            }
        },
        {
            pattern: /\/prowadz (.*)$/,
            callback: (matches: RegExpMatchArray) => {
                client.sendEvent('leadTo', matches[1]);
            }
        },
        {
            pattern: /\/prowadz-$/,
            callback: () => {
                client.sendEvent('leadTo');
            }
        },
        {
            pattern: /\/zlok$/,
            callback: () => {
                client.Map.refresh();
            }
        }
    );
}
