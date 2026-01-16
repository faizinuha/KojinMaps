// Enhanced data fetching with multiple API sources and IndexedDB caching
import { getCacheData, getOrSetCache, setCacheData } from './indexeddb-cache';


interface LocationData {
  lat: number;
  lon: number;
  name: string;
  type: string;
  tags?: { [key: string]: string };
  source?: string;
  address?: string;
}

// Cache management
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (increased from 10)
const locationCache = new Map<
  string,
  { data: LocationData[]; timestamp: number }
>();

// API Rate limiting
const API_RATE_LIMIT = 1500; // 1.5 seconds between Overpass API calls (optimized)
let lastOverpassCall = 0;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Japan bounds - expanded coverage
export const JAPAN_BOUNDS = {
  north: 45.5, // Hokkaido
  south: 24.0, // Okinawa
  east: 154.0,
  west: 122.0
};

export async function getCachedLocations(type: string): Promise<LocationData[] | null> {
  // Check memory cache first
  const cached = locationCache.get(type);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Check IndexedDB cache
  const dbCached = await getCacheData<LocationData[]>(type);
  if (dbCached) {
    // Update memory cache
    locationCache.set(type, { data: dbCached, timestamp: Date.now() });
    return dbCached;
  }
  
  return null;
}

export async function setCachedLocations(type: string, data: LocationData[]): Promise<void> {
  // Update memory cache
  locationCache.set(type, { data, timestamp: Date.now() });
  
  // Save to IndexedDB
  await setCacheData(type, data, CACHE_DURATION);
}

// Rate limiting
const requestQueue = new Map<string, Promise<LocationData[]>>();

async function makeRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (requestQueue.has(key)) {
    return requestQueue.get(key) as Promise<T>;
  }

  const promise = requestFn();
  requestQueue.set(key, promise as Promise<LocationData[]>);

  try {
    const result = await promise;
    return result;
  } finally {
    setTimeout(() => requestQueue.delete(key), 1000);
  }
}

// Overpass API queries with expanded coverage
export async function getLocationsByType(
  type: string,
  bounds: [number, number, number, number] = [35.6, 139.5, 35.8, 139.8]
): Promise<LocationData[]> {
  const cacheKey = `locations-${type}-${bounds.join(',')}`;
  
  // Use getOrSetCache pattern for cleaner code
  return getOrSetCache(cacheKey, async () => {
    const queries: { [key: string]: string } = {
      toilets: 'node["amenity"="toilets"]',
      restaurants: 'node["amenity"="restaurant"]',
      convenience: 'node["shop"="convenience"]',
      stations: 'node["railway"="station"]',
      temples: 'node["amenity"="place_of_worship"]["religion"="buddhist"]',
      shrines: 'node["amenity"="place_of_worship"]["religion"="shinto"]',
      parks: 'node["leisure"="park"]',
      banks: 'node["amenity"="bank"]',
      hospitals: 'node["amenity"="hospital"]',
      schools: 'node["amenity"="school"]',
      hotels: 'node["tourism"="hotel"]',
      cafes: 'node["amenity"="cafe"]',
      atms: 'node["amenity"="atm"]',
      pharmacies: 'node["amenity"="pharmacy"]',
      museums: 'node["tourism"="museum"]',
      viewpoints: 'node["tourism"="viewpoint"]',
    };

    const query = queries[type];
    if (!query) {
      console.warn(`Unknown location type: ${type}`);
      return [];
    }

    // Rate limiting for Overpass API
    const now = Date.now();
    const timeSinceLastCall = now - lastOverpassCall;
    if (timeSinceLastCall < API_RATE_LIMIT) {
      await delay(API_RATE_LIMIT - timeSinceLastCall);
    }
    lastOverpassCall = Date.now();

    const overpassQuery = `
      [out:json][timeout:30];
      ${query}(${bounds.join(',')});
      out body 150;
    `;

    return makeRequest(`overpass-${type}-${bounds.join(',')}`, async () => {
      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
          headers: {
            'Content-Type': 'text/plain',
            'User-Agent': 'KojinMaps/1.0 (Educational Project)',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const results: LocationData[] = data.elements.map(
          (el: {
            lat: number;
            lon: number;
            tags: { [key: string]: string };
          }) => {
            const name = el.tags?.['name:ja'] || el.tags?.['name'] || getDefaultName(type);
            const address = el.tags?.['addr:full'] || 
                          `${el.tags?.['addr:city'] || ''} ${el.tags?.['addr:street'] || ''}`.trim() ||
                          undefined;
            
            return {
              lat: el.lat,
              lon: el.lon,
              name,
              type,
              tags: el.tags,
              address,
              source: 'overpass',
            };
          }
        );

        return results;
      } catch (error) {
        console.error(`Error fetching ${type} from Overpass:`, error);

        // Try to return stale cache data if available
        const staleCache = await getCacheData<LocationData[]>(cacheKey);
        if (staleCache) {
          console.warn(`Using stale cache for ${type}`);
          return staleCache;
        }

        return [];
      }
    });
  }, CACHE_DURATION);
}

// Japan Travel API (mock implementation - replace with actual API)
export async function getJapanTravelPOI(
  type: string,
  bounds: [number, number, number, number]
): Promise<LocationData[]> {
  return makeRequest(`japan-travel-${type}`, async () => {
    try {
      // Mock data for demonstration - replace with actual Japan Travel API
      const mockData: LocationData[] = [
        {
          lat: 35.6586,
          lon: 139.7454,
          name: 'Tokyo Skytree Restaurant',
          type: 'restaurants',
          tags: {
            cuisine: 'japanese',
            opening_hours: '10:00-22:00',
          },
          source: 'japan-travel',
        },
        {
          lat: 35.6762,
          lon: 139.6503,
          name: 'Imperial Palace',
          type: 'tourist',
          tags: {
            tourism: 'attraction',
            opening_hours: '09:00-17:00',
          },
          source: 'japan-travel',
        },
      ];

      // Filter by type and bounds
      return mockData.filter(
        (item) =>
          item.type === type &&
          item.lat >= bounds[0] &&
          item.lat <= bounds[2] &&
          item.lon >= bounds[1] &&
          item.lon <= bounds[3]
      );
    } catch (error) {
      console.error(`Error fetching ${type} from Japan Travel API:`, error);
      return [];
    }
  });
}

// Geocoding search using Nominatim
export async function searchLocation(query: string): Promise<LocationData[]> {
  if (!query.trim()) return [];

  return makeRequest(`search-${query}`, async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=jp&limit=5&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      return data.map(
        (item: {
          lat: string;
          lon: string;
          display_name: string;
          place_id: string;
          osm_type: string;
          osm_id: string;
        }) => ({
          lat: Number.parseFloat(item.lat),
          lon: Number.parseFloat(item.lon),
          name: item.display_name,
          type: 'search',
          tags: {
            place_id: item.place_id,
            osm_type: item.osm_type,
            osm_id: item.osm_id,
          },
          source: 'nominatim',
        })
      );
    } catch (error) {
      console.error('Search error:', error);
      return []; // Return an empty array in case of an error
    }
  });
}

// Utility functions
function getDefaultName(type: string): string {
  const defaultNames: { [key: string]: string } = {
    toilets: 'トイレ',
    restaurants: 'レストラン',
    convenience: 'コンビニ',
    stations: '駅',
    temples: '寺院',
    shrines: '神社',
    parks: '公園',
    banks: '銀行',
    hospitals: '病院',
    schools: '学校',
    hotels: 'ホテル',
    cafes: 'カフェ',
    atms: 'ATM',
    pharmacies: '薬局',
    museums: '博物館',
    viewpoints: '展望台',
    tourist: '観光地',
  };

  return defaultNames[type] || 'Unknown';
}

// Offline support
export function getOfflineLocations(): LocationData[] {
  const offlineData = localStorage.getItem('offline-locations');
  return offlineData ? JSON.parse(offlineData) : [];
}

export function saveOfflineLocations(locations: LocationData[]): void {
  localStorage.setItem('offline-locations', JSON.stringify(locations));
}

// Export for Tokyo toilets (backward compatibility)
export async function getToiletsInTokyo(): Promise<LocationData[]> {
  return getLocationsByType('toilets');
}
