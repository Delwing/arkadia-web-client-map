// Loader for sandbox map and color data using shared cache logic.
import { loadCachedJSON } from "@client/src/utils/dataCache.ts";

export function loadMapData(onProgress?: (progress: number, loaded?: number, total?: number) => void) {
    return loadCachedJSON({
        url: './data/mapExport.json',
        localStorageKey: 'cachedMapData',
        indexedDB: { dbName: 'ArkadiaMapDB', storeName: 'mapData', key: 'mapExport' },
        onProgress,
    });
}

export function loadColors() {
    return loadCachedJSON({
        url: './data/colors.json',
        localStorageKey: 'cachedColors',
    });
}
