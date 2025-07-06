// This file provides a way to load map data asynchronously instead of bundling it
// with the client code, which significantly reduces the build size.

/**
 * Loads the map data asynchronously from a URL or local storage
 * @returns Promise that resolves with the map data
 */
export async function loadMapData() {
  // Try to load from local storage first for faster subsequent loads
  const cachedData = localStorage.getItem('cachedMapData');
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached map data:', e);
      // Continue to fetch from file if parsing fails
    }
  }
  
  // Fetch the map data from the file
  try {
    const response = await fetch('./data/mapExport.json');
    const data = await response.json();
    
    // Cache the data for future use
    try {
      localStorage.setItem('cachedMapData', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache map data (possibly due to size limits):', e);
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