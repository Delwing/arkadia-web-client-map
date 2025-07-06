// This file provides a way to load NPC data asynchronously similar to map data loading.

function isIndexedDBSupported() {
  return 'indexedDB' in window;
}

async function storeNpcInIndexedDB(data: any) {
  return new Promise<void>((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open('ArkadiaNpcDB', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('npcData')) {
        db.createObjectStore('npcData', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['npcData'], 'readwrite');
      const store = transaction.objectStore('npcData');

      const storeRequest = store.put({ id: 'npc', data });
      storeRequest.onsuccess = () => resolve();
      storeRequest.onerror = () => reject(new Error('Failed to store data in IndexedDB'));
    };

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
}

async function getNpcFromIndexedDB() {
  return new Promise<any>((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      resolve(null);
      return;
    }

    const request = indexedDB.open('ArkadiaNpcDB', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('npcData')) {
        db.createObjectStore('npcData', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['npcData'], 'readonly');
      const store = transaction.objectStore('npcData');

      const getRequest = store.get('npc');
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result.data);
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => {
        reject(new Error('Failed to get data from IndexedDB'));
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
}

export async function loadNpcData() {
  try {
    const indexedData = await getNpcFromIndexedDB();
    if (indexedData) {
      localStorage.setItem('npc', JSON.stringify(indexedData));
      return indexedData;
    }
  } catch (e) {
    console.warn('Failed to load NPCs from IndexedDB, falling back to localStorage:', e);
  }

  const cached = localStorage.getItem('npc');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.error('Failed to parse cached npc data');
    }
  }

  try {
    const response = await fetch('./data/npc.json');
    const data = await response.json();
    try {
      await storeNpcInIndexedDB(data);
      console.log('Successfully stored NPC data in IndexedDB');
    } catch (e) {
      console.warn('Failed to store NPC data in IndexedDB, falling back to localStorage:', e);
      try {
        localStorage.setItem('npc', JSON.stringify(data));
      } catch (lsErr) {
        console.error('Failed to cache NPC data in localStorage:', lsErr);
      }
    }
    localStorage.setItem('npc', JSON.stringify(data));
    return data;
  } catch (e) {
    console.error('Failed to load npc data:', e);
    throw e;
  }
}
