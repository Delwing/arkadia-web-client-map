export const MAGIC_KEYS_URL = "https://raw.githubusercontent.com/tjurczyk/arkadia-data/refs/heads/master/magic_keys.json";

function isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
}

async function storeInIndexedDB(data: string[]) {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open('ArkadiaMagicKeysDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('magicKeys')) {
                db.createObjectStore('magicKeys', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['magicKeys'], 'readwrite');
            const store = transaction.objectStore('magicKeys');

            const storeRequest = store.put({ id: 'keys', data });
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

        const request = indexedDB.open('ArkadiaMagicKeysDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('magicKeys')) {
                db.createObjectStore('magicKeys', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['magicKeys'], 'readonly');
            const store = transaction.objectStore('magicKeys');

            const getRequest = store.get('keys');
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

export default async function loadMagicKeys(): Promise<string[]> {
    try {
        const indexed = await getFromIndexedDB();
        if (indexed) {
            return indexed;
        }
    } catch (e) {
        console.warn('Failed to load magic keys from IndexedDB:', e);
    }

    try {
        const response = await fetch(MAGIC_KEYS_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data?.magic_keys)) {
            throw new Error('Invalid data format');
        }
        const keys: string[] = data.magic_keys;
        try {
            await storeInIndexedDB(keys);
            console.log('Successfully stored magic keys in IndexedDB');
        } catch (e) {
            console.warn('Failed to store magic keys in IndexedDB:', e);
        }
        return keys;
    } catch (e) {
        console.error('Failed to load magic keys:', e);
        return [];
    }
}
