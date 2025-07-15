export const HERBS_URL = "https://raw.githubusercontent.com/tjurczyk/arkadia-data/refs/heads/master/herbs_data.json";

export interface HerbForms {
    mianownik: string;
    dopelniacz: string;
    biernik: string;
    mnoga_mianownik: string;
    mnoga_dopelniacz: string;
    mnoga_biernik: string;
}

export interface HerbUse {
    action: string;
    effect: string;
}

export interface HerbsData {
    herb_id_to_odmiana: Record<string, HerbForms>;
    version: number;
    herb_id_to_use: Record<string, HerbUse[]>;
}

function isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
}

async function storeInIndexedDB(data: HerbsData) {
    return new Promise<void>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open('ArkadiaHerbsDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('herbs')) {
                db.createObjectStore('herbs', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['herbs'], 'readwrite');
            const store = transaction.objectStore('herbs');

            const storeRequest = store.put({ id: 'herbs', data });
            storeRequest.onsuccess = () => resolve();
            storeRequest.onerror = () => reject(new Error('Failed to store data in IndexedDB'));
        };

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };
    });
}

async function getFromIndexedDB(): Promise<HerbsData | null> {
    return new Promise<HerbsData | null>((resolve, reject) => {
        if (!isIndexedDBSupported()) {
            resolve(null);
            return;
        }

        const request = indexedDB.open('ArkadiaHerbsDB', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('herbs')) {
                db.createObjectStore('herbs', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['herbs'], 'readonly');
            const store = transaction.objectStore('herbs');

            const getRequest = store.get('herbs');
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result.data as HerbsData);
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

export default async function loadHerbs(): Promise<HerbsData | null> {
    try {
        const indexed = await getFromIndexedDB();
        if (indexed) {
            localStorage.setItem('herbs_data', JSON.stringify(indexed));
            return indexed;
        }
    } catch (e) {
        console.warn('Failed to load herbs from IndexedDB, falling back to localStorage:', e);
    }

    const cached = localStorage.getItem('herbs_data');
    if (cached) {
        try {
            return JSON.parse(cached) as HerbsData;
        } catch {
            console.error('Failed to parse cached herbs');
        }
    }

    try {
        const response = await fetch(HERBS_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        try {
            await storeInIndexedDB(data);
            console.log('Successfully stored herbs in IndexedDB');
        } catch (e) {
            console.warn('Failed to store herbs in IndexedDB, falling back to localStorage:', e);
        }
        try {
            localStorage.setItem('herbs_data', JSON.stringify(data));
        } catch (lsErr) {
            console.error('Failed to cache herbs in localStorage:', lsErr);
        }
        return data as HerbsData;
    } catch (e) {
        console.error('Failed to load herbs:', e);
        return null;
    }
}
