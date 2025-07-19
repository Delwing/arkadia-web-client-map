export const MAGICS_URL = "https://raw.githubusercontent.com/tjurczyk/arkadia-data/refs/heads/master/magics_data.json";

function isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
}

async function storeInIndexedDB(data: string[]) {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open('ArkadiaMagicsDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('magics')) {
                db.createObjectStore('magics', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['magics'], 'readwrite');
            const store = transaction.objectStore('magics');

            const storeRequest = store.put({ id: 'magics', data });
            storeRequest.onsuccess = () => resolve();
            storeRequest.onerror = () => reject(new Error('Failed to store data in IndexedDB'));
        };

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };
    });
}

async function getFromIndexedDB() {
    return new Promise<string[] | null>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve(null);
            return;
        }

        const request = indexedDB.open('ArkadiaMagicsDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('magics')) {
                db.createObjectStore('magics', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['magics'], 'readonly');
            const store = transaction.objectStore('magics');

            const getRequest = store.get('magics');
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result.data as string[]);
                } else {
                    resolve(null);
                }
            };
            getRequest.onerror = () => reject(new Error('Failed to get data from IndexedDB'));
        };

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };
    });
}

export default async function loadMagics(): Promise<string[]> {
    try {
        const indexed = await getFromIndexedDB();
        if (indexed) {
            return indexed;
        }
    } catch (e) {
        console.warn('Failed to load magics from IndexedDB:', e);
    }

    try {
        const response = await fetch(MAGICS_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const magicsObj = data?.magics;
        if (!magicsObj || typeof magicsObj !== 'object') {
            throw new Error('Invalid data format');
        }
        const magics: string[] = [];
        for (const value of Object.values(magicsObj)) {
            if (value && Array.isArray((value as any).regexps)) {
                magics.push(...(value as any).regexps);
            }
        }
        try {
            await storeInIndexedDB(magics);
            console.log('Successfully stored magics in IndexedDB');
        } catch (e) {
            console.warn('Failed to store magics in IndexedDB:', e);
        }
        return magics;
    } catch (e) {
        console.error('Failed to load magics:', e);
        return [];
    }
}
