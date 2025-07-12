const DB_NAME = 'ArkadiaAuthDB';
const STORE_NAME = 'auth';

function isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
}

export async function savePassword(password: string) {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const putReq = store.put({ id: 'password', value: password });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(new Error('Failed to store password'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}

export async function getPassword() {
    return new Promise<string | null>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve(null);
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get('password');
            getReq.onsuccess = () => {
                if (getReq.result) {
                    resolve(getReq.result.value as string);
                } else {
                    resolve(null);
                }
            };
            getReq.onerror = () => reject(new Error('Failed to get password'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}

export async function clearPassword() {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve();
            return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const delReq = store.delete('password');
            delReq.onsuccess = () => resolve();
            delReq.onerror = () => reject(new Error('Failed to delete password'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}

export async function saveCharacter(character: string) {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const putReq = store.put({ id: 'character', value: character });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(new Error('Failed to store character'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}

export async function getCharacter() {
    return new Promise<string | null>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve(null);
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get('character');
            getReq.onsuccess = () => {
                if (getReq.result) {
                    resolve(getReq.result.value as string);
                } else {
                    resolve(null);
                }
            };
            getReq.onerror = () => reject(new Error('Failed to get character'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}

export async function clearCharacter() {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve();
            return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const delReq = store.delete('character');
            delReq.onsuccess = () => resolve();
            delReq.onerror = () => reject(new Error('Failed to delete character'));
        };
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
}
