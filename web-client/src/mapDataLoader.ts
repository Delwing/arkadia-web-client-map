// This file provides a way to load map data asynchronously instead of bundling it
// with the client code, which significantly reduces the build size.

/**
 * Checks if the browser supports IndexedDB
 * @returns boolean indicating if IndexedDB is supported
 */
function isIndexedDBSupported() {
  return 'indexedDB' in window;
}

const TTL = 24 * 60 * 60 * 1000; // 24h

/**
 * Stores map data in IndexedDB
 * @param data The map data to store
 * @returns Promise that resolves when the data is stored
 */
async function storeInIndexedDB(data) {
  return new Promise<void>((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open('ArkadiaMapDB', 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('mapData')) {
        db.createObjectStore('mapData', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['mapData'], 'readwrite');
      const store = transaction.objectStore('mapData');

      const storeRequest = store.put({ id: 'mapExport', data, timestamp: Date.now() });

      storeRequest.onsuccess = () => {
        resolve();
      };

      storeRequest.onerror = () => {
        reject(new Error('Failed to store data in IndexedDB'));
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Retrieves map data from IndexedDB
 * @returns Promise that resolves with the map data or null if not found
 */
async function getFromIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      resolve(null);
      return;
    }

    const request = indexedDB.open('ArkadiaMapDB', 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('mapData')) {
        db.createObjectStore('mapData', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['mapData'], 'readonly');
      const store = transaction.objectStore('mapData');

      const getRequest = store.get('mapExport');

      getRequest.onsuccess = () => {
        if (getRequest.result && getRequest.result.timestamp && getRequest.result.timestamp + TTL > Date.now()) {
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

/**
 * Loads the map data asynchronously from a URL, IndexedDB, or local storage
 * @returns Promise that resolves with the map data
 */
export async function loadMapData(onProgress?: (progress: number, loaded?: number, total?: number) => void) {
  // Try to load from IndexedDB first
  try {
    const indexedDBData = await getFromIndexedDB();
    if (indexedDBData) {
      onProgress?.(100);
      return indexedDBData;
    }
  } catch (e) {
    console.warn('Failed to load from IndexedDB, falling back to localStorage:', e);
  }

  // Try to load from local storage as fallback
  const cachedData = localStorage.getItem('cachedMapData');
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (parsed.timestamp && parsed.timestamp + TTL > Date.now()) {
        onProgress?.(100);
        return parsed.data;
      }
    } catch (e) {
      console.error('Failed to parse cached map data:', e);
      // Continue to fetch from file if parsing fails
    }
  }

  // Fetch the map data from the file
  try {
    const response = await fetch('https://delwing.github.io/arkadia-mapa/data/mapExport.json');

    let data;

    const total = parseInt(response.headers.get('Content-Length') || '0', 10);
    if (response.body && total) {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          onProgress?.(Math.min(100, (received / total) * 100), received, total);
        }
      }
      const all = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
      }
      data = JSON.parse(new TextDecoder().decode(all));
    } else {
      data = await response.json();
      onProgress?.(100, total || undefined, total || undefined);
    }

    // Try to store in IndexedDB first
    try {
      await storeInIndexedDB(data);
      console.log('Successfully stored map data in IndexedDB');
    } catch (e) {
      console.warn('Failed to store in IndexedDB, falling back to localStorage:', e);

      // Fall back to localStorage if IndexedDB fails
      try {
        localStorage.setItem('cachedMapData', JSON.stringify({ data, timestamp: Date.now() }));
      } catch (localStorageError) {
        console.warn('Failed to cache map data in localStorage, attempting to clear cache and retry:', localStorageError);
        try {
          // Clear the existing cache to free up space
          localStorage.removeItem('cachedMapData');
          // Try again
          localStorage.setItem('cachedMapData', JSON.stringify({ data, timestamp: Date.now() }));
          console.log('Successfully cached map data in localStorage after clearing old cache');
        } catch (retryError) {
          // If it still fails, the data is likely too large for localStorage
          console.error('Failed to cache map data even after clearing cache. Data may be too large for localStorage:', retryError);
        }
      }
    }

    return data;
  } catch (e) {
    console.error('Failed to load map data:', e);
    throw e;
  }
}

/**
 * Loads the colors data
 * @returns Promise that resolves with the colors data
 */
export async function loadColors() {
  const cached = localStorage.getItem('cachedColors');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && parsed.timestamp + TTL > Date.now()) {
        return parsed.data;
      }
    } catch (e) {
      console.error('Failed to parse cached colors:', e);
    }
  }

  try {
    const response = await fetch('https://delwing.github.io/arkadia-mapa/data/colors.json');
    const data = await response.json();
    try {
      localStorage.setItem('cachedColors', JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Failed to cache colors data:', e);
    }
    return data;
  } catch (e) {
    console.error('Failed to load colors data:', e);
    throw e;
  }
}
