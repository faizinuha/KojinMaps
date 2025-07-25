// Location details and favorites management

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

// Get detailed information about a location
export async function getLocationDetails(location: LocationData): Promise<any> {
  try {
    // Try to get more details from Nominatim reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          format: "json",
          lat: location.lat.toString(),
          lon: location.lon.toString(),
          addressdetails: "1",
          extratags: "1",
          namedetails: "1",
        }),
    )

    if (!response.ok) {
      throw new Error(`Failed to get details: ${response.status}`)
    }

    const data = await response.json()

    return {
      address: data.display_name,
      details: data.address,
      extratags: data.extratags,
      namedetails: data.namedetails,
    }
  } catch (error) {
    console.error("Error getting location details:", error)
    return {
      address: `${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`,
      details: {},
      extratags: {},
      namedetails: {},
    }
  }
}

// Favorites management
export const favorites = {
  getFavorites(): LocationData[] {
    if (typeof window === "undefined") return []
    const favs = localStorage.getItem("japanmaps-favorites")
    return favs ? JSON.parse(favs) : []
  },

  addToFavorites(location: LocationData): void {
    if (typeof window === "undefined") return
    const favorites = this.getFavorites()

    // Check if already exists
    const exists = favorites.some((fav) => fav.lat === location.lat && fav.lon === location.lon)

    if (!exists) {
      favorites.push(location)
      localStorage.setItem("japanmaps-favorites", JSON.stringify(favorites))
    }
  },

  removeFromFavorites(location: LocationData): void {
    if (typeof window === "undefined") return
    const favorites = this.getFavorites()
    const filtered = favorites.filter((fav) => !(fav.lat === location.lat && fav.lon === location.lon))
    localStorage.setItem("japanmaps-favorites", JSON.stringify(filtered))
  },

  isFavorite(location: LocationData): boolean {
    const favorites = this.getFavorites()
    return favorites.some((fav) => fav.lat === location.lat && fav.lon === location.lon)
  },
}

// Export individual functions for easier imports
export const addToFavorites = favorites.addToFavorites.bind(favorites)
export const removeFromFavorites = favorites.removeFromFavorites.bind(favorites)
export const isFavorite = favorites.isFavorite.bind(favorites)
export const getFavorites = favorites.getFavorites.bind(favorites)
