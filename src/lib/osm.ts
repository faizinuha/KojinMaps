// Enhanced data fetching with multiple API sources and caching

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
}

// Cache management
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const locationCache = new Map<string, { data: LocationData[]; timestamp: number }>()

export function getCachedLocations(type: string): LocationData[] | null {
  const cached = locationCache.get(type)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

export function setCachedLocations(type: string, data: LocationData[]): void {
  locationCache.set(type, { data, timestamp: Date.now() })
}

// Rate limiting
const requestQueue = new Map<string, Promise<LocationData[]>>()

async function makeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (requestQueue.has(key)) {
    return requestQueue.get(key) as Promise<T>
  }

  const promise = requestFn()
  requestQueue.set(key, promise as Promise<LocationData[]>)

  try {
    const result = await promise
    return result
  } finally {
    setTimeout(() => requestQueue.delete(key), 1000)
  }
}

// Overpass API queries
export async function getLocationsByType(
  type: string,
  bounds: [number, number, number, number] = [35.6, 139.5, 35.8, 139.8],
): Promise<LocationData[]> {
  const queries: { [key: string]: string } = {
    toilets: 'node["amenity"="toilets"]',
    restaurants: 'node["amenity"="restaurant"]',
    convenience: 'node["shop"="convenience"]',
    stations: 'node["railway"="station"]',
    temples: 'node["amenity"="place_of_worship"]["religion"="buddhist"]',
    parks: 'node["leisure"="park"]',
    banks: 'node["amenity"="bank"]',
  }

  const query = queries[type]
  if (!query) {
    console.warn(`Unknown location type: ${type}`)
    return []
  }

  const overpassQuery = `
    [out:json][timeout:25];
    ${query}(${bounds.join(",")});
    out body;
  `

  return makeRequest(`overpass-${type}`, async () => {
    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
        headers: {
          "Content-Type": "text/plain",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return data.elements.map((el: any) => ({
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.["name:ja"] || el.tags?.["name"] || getDefaultName(type),
        type,
        tags: el.tags,
        source: "overpass",
      }))
    } catch (error) {
      console.error(`Error fetching ${type} from Overpass:`, error)
      return []
    }
  })
}

// Japan Travel API (mock implementation - replace with actual API)
export async function getJapanTravelPOI(
  type: string,
  bounds: [number, number, number, number],
): Promise<LocationData[]> {
  return makeRequest(`japan-travel-${type}`, async () => {
    try {
      // Mock data for demonstration - replace with actual Japan Travel API
      const mockData: LocationData[] = [
        {
          lat: 35.6586,
          lon: 139.7454,
          name: "Tokyo Skytree Restaurant",
          type: "restaurants",
          tags: {
            cuisine: "japanese",
            opening_hours: "10:00-22:00",
          },
          source: "japan-travel",
        },
        {
          lat: 35.6762,
          lon: 139.6503,
          name: "Imperial Palace",
          type: "tourist",
          tags: {
            tourism: "attraction",
            opening_hours: "09:00-17:00",
          },
          source: "japan-travel",
        },
      ]

      // Filter by type and bounds
      return mockData.filter(
        (item) =>
          item.type === type &&
          item.lat >= bounds[0] &&
          item.lat <= bounds[2] &&
          item.lon >= bounds[1] &&
          item.lon <= bounds[3],
      )
    } catch (error) {
      console.error(`Error fetching ${type} from Japan Travel API:`, error)
      return []
    }
  })
}

// Geocoding search using Nominatim
export async function searchLocation(query: string): Promise<LocationData[]> {
  if (!query.trim()) return []

  return makeRequest(`search-${query}`, async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=jp&limit=5&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()

      return data.map((item: any) => ({
        lat: Number.parseFloat(item.lat),
        lon: Number.parseFloat(item.lon),
        name: item.display_name,
        type: "search",
        tags: {
          place_id: item.place_id,
          osm_type: item.osm_type,
          osm_id: item.osm_id,
        },
        source: "nominatim",
      }))
    } catch (error) {
      console.error("Search error:", error)
      return []
    }
  })
}

// Utility functions
function getDefaultName(type: string): string {
  const defaultNames: { [key: string]: string } = {
    toilets: "トイレ",
    restaurants: "レストラン",
    convenience: "コンビニ",
    stations: "駅",
    temples: "寺院",
    parks: "公園",
    banks: "銀行",
    tourist: "観光地",
  }

  return defaultNames[type] || "Unknown"
}

// Offline support
export function getOfflineLocations(): LocationData[] {
  const offlineData = localStorage.getItem("offline-locations")
  return offlineData ? JSON.parse(offlineData) : []
}

export function saveOfflineLocations(locations: LocationData[]): void {
  localStorage.setItem("offline-locations", JSON.stringify(locations))
}

// Export for Tokyo toilets (backward compatibility)
export async function getToiletsInTokyo(): Promise<LocationData[]> {
  return getLocationsByType("toilets")
}
