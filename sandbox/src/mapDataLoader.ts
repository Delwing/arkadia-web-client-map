// This file provides a way to load map data asynchronously instead of bundling it
// with the client code, which significantly reduces the build size.

/**
 * Checks if the browser supports IndexedDB
 * @returns boolean indicating if IndexedDB is supported
 */
function isIndexedDBSupported() {
  return 'indexedDB' in window;
}

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

      const storeRequest = store.put({ id: 'mapExport', data });

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

/**
 * Loads the map data asynchronously from a URL, IndexedDB, or local storage
 * @returns Promise that resolves with the map data
 */
export async function loadMapData(onProgress?: (progress: number) => void) {
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
      onProgress?.(100);
      return parsed;
    } catch (e) {
      console.error('Failed to parse cached map data:', e);
      // Continue to fetch from file if parsing fails
    }
  }

  // Fetch the map data from the file
  try {
    const response = await fetch('./data/mapExport.json');

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
          onProgress?.(Math.min(100, (received / total) * 100));
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
      onProgress?.(100);
    }

    // Try to store in IndexedDB first
    try {
      await storeInIndexedDB(data);
      console.log('Successfully stored map data in IndexedDB');
    } catch (e) {
      console.warn('Failed to store in IndexedDB, falling back to localStorage:', e);

      // Fall back to localStorage if IndexedDB fails
      try {
        localStorage.setItem('cachedMapData', JSON.stringify(data));
      } catch (localStorageError) {
        console.warn('Failed to cache map data in localStorage, attempting to clear cache and retry:', localStorageError);
        try {
          // Clear the existing cache to free up space
          localStorage.removeItem('cachedMapData');
          // Try again
          localStorage.setItem('cachedMapData', JSON.stringify(data));
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
  try {
    const response = await fetch('./data/colors.json');
    return await response.json();
  } catch (e) {
    console.error('Failed to load colors data:', e);
    throw e;
  }
}
