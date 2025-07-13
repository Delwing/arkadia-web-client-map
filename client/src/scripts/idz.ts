import Client from "../Client";
import {longToShort} from "../MapHelper";

export default function initIdz(client: Client, aliases?: { pattern: RegExp; callback: Function }[]) {
    if (!aliases) return;
    aliases.push({
        pattern: /\/idz$/, 
        callback: () => {
            const room: any = client.Map.currentRoom;
            if (!room) return;
            const allExits = Object.assign({}, room.exits ?? {}, room.specialExits ?? {});
            const exitDirs = Object.keys(allExits);
            if (exitDirs.length === 0) return;

            let dir = exitDirs[0];
            if (exitDirs.length === 2 && client.Map.locationHistory.length >= 2) {
                const prevId = client.Map.locationHistory[client.Map.locationHistory.length - 2];
                const cameFrom = exitDirs.find(d => allExits[d] === prevId);
                const alt = exitDirs.find(d => d !== cameFrom);
                if (alt) {
                    dir = alt;
                }
            }
            client.sendCommand(longToShort[dir] ?? dir);
        }
    });
}

