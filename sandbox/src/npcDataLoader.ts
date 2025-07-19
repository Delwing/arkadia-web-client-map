// Sandbox NPC data loader using shared cache logic.
import { loadCachedJSON } from "@client/src/utils/dataCache.ts";

export function loadNpcData() {
    return loadCachedJSON({
        url: './data/npc.json',
        localStorageKey: 'npc',
        indexedDB: { dbName: 'ArkadiaNpcDB', storeName: 'npcData', key: 'npc' },
    });
}
