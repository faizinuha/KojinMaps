// Enhanced search service for all of Japan

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
  address?: string
  category?: string
}

// Search locations across all of Japan
export async function searchLocationJapan(query: string): Promise<LocationData[]> {
  if (!query.trim()) return []

  try {
    // Use Nominatim for comprehensive Japan search
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          format: "json",
          q: query,
          countrycodes: "jp", // Limit to Japan
          limit: "20",
          addressdetails: "1",
          extratags: "1",
          namedetails: "1",
        }),
    )

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()

    return data.map((item: any) => ({
      lat: Number.parseFloat(item.lat),
      lon: Number.parseFloat(item.lon),
      name: item.namedetails?.["name:ja"] || item.namedetails?.name || item.display_name.split(",")[0],
      type: item.type || "place",
      address: item.display_name,
      category: getCategoryFromOSMType(item.type, item.class),
      tags: {
        place_id: item.place_id,
        osm_type: item.osm_type,
        osm_id: item.osm_id,
        importance: item.importance,
        ...item.extratags,
      },
      source: "nominatim",
    }))
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

// Get popular places in Japan
export function getPopularPlaces(): LocationData[] {
  return [
    {
      lat: 35.6762,
      lon: 139.6503,
      name: "Tokyo Imperial Palace",
      type: "tourist_attraction",
      address: "1-1 Chiyoda, Chiyoda City, Tokyo",
      category: "Istana",
      source: "popular",
    },
    {
      lat: 35.6586,
      lon: 139.7454,
      name: "Tokyo Skytree",
      type: "tourist_attraction",
      address: "1 Chome-1-2 Oshiage, Sumida City, Tokyo",
      category: "Menara",
      source: "popular",
    },
    {
      lat: 35.6594,
      lon: 139.7005,
      name: "Shibuya Crossing",
      type: "tourist_attraction",
      address: "Shibuya City, Tokyo",
      category: "Landmark",
      source: "popular",
    },
    {
      lat: 35.7148,
      lon: 139.7967,
      name: "Senso-ji Temple",
      type: "place_of_worship",
      address: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
      category: "Kuil",
      source: "popular",
    },
    {
      lat: 34.9949,
      lon: 135.7849,
      name: "Fushimi Inari Shrine",
      type: "place_of_worship",
      address: "68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto",
      category: "Kuil",
      source: "popular",
    },
    {
      lat: 34.9804,
      lon: 135.7751,
      name: "Kiyomizu-dera",
      type: "place_of_worship",
      address: "1-294 Kiyomizu, Higashiyama Ward, Kyoto",
      category: "Kuil",
      source: "popular",
    },
    {
      lat: 34.6937,
      lon: 135.5023,
      name: "Osaka Castle",
      type: "tourist_attraction",
      address: "1-1 Osakajo, Chuo Ward, Osaka",
      category: "Kastil",
      source: "popular",
    },
    {
      lat: 34.3955,
      lon: 132.4596,
      name: "Hiroshima Peace Memorial",
      type: "memorial",
      address: "1-2 Nakajimacho, Naka Ward, Hiroshima",
      category: "Memorial",
      source: "popular",
    },
  ]
}

// Search history management
export const searchHistory = {
  getHistory(): LocationData[] {
    if (typeof window === "undefined") return []
    const history = localStorage.getItem("japanmaps-search-history")
    return history ? JSON.parse(history) : []
  },

  addToHistory(location: LocationData): void {
    if (typeof window === "undefined") return
    const history = this.getHistory()

    // Remove if already exists
    const filtered = history.filter((item) => !(item.lat === location.lat && item.lon === location.lon))

    // Add to beginning
    filtered.unshift(location)

    // Keep only last 10 items
    const limited = filtered.slice(0, 10)

    localStorage.setItem("japanmaps-search-history", JSON.stringify(limited))
  },

  clearHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("japanmaps-search-history")
  },
}

// Helper function to categorize OSM types
function getCategoryFromOSMType(type: string, osmClass: string): string {
  const categoryMap: { [key: string]: string } = {
    // Places
    city: "Kota",
    town: "Kota",
    village: "Desa",
    hamlet: "Dusun",

    // Transport
    railway: "Stasiun",
    station: "Stasiun",
    airport: "Bandara",

    // Tourism
    tourist_attraction: "Wisata",
    museum: "Museum",
    castle: "Kastil",
    temple: "Kuil",
    shrine: "Kuil",

    // Amenities
    restaurant: "Restoran",
    cafe: "Kafe",
    hotel: "Hotel",
    hospital: "Rumah Sakit",
    school: "Sekolah",
    university: "Universitas",

    // Shopping
    shop: "Toko",
    mall: "Mall",
    market: "Pasar",

    // Nature
    park: "Taman",
    garden: "Taman",
    mountain: "Gunung",
    lake: "Danau",
    river: "Sungai",
    beach: "Pantai",
  }

  return categoryMap[type] || categoryMap[osmClass] || "Tempat"
}
