// Bookmark Service - Cookie-based storage for user favorites
// No login required, persists across sessions

interface BookmarkLocation {
  id: string
  lat: number
  lon: number
  name: string
  type: string
  address?: string
  tags?: { [key: string]: string }
  bookmarkedAt: number
}

const BOOKMARK_COOKIE_NAME = 'kojinmaps_bookmarks'
const MAX_BOOKMARKS = 50
const COOKIE_EXPIRY_DAYS = 365

/**
 * Get all bookmarks from cookies
 */
export function getBookmarks(): BookmarkLocation[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${BOOKMARK_COOKIE_NAME}=`))
      ?.split('=')[1]
    
    if (!cookieValue) return []
    
    const decoded = decodeURIComponent(cookieValue)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error reading bookmarks:', error)
    return []
  }
}

/**
 * Save bookmarks to cookies
 */
function saveBookmarks(bookmarks: BookmarkLocation[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const encoded = encodeURIComponent(JSON.stringify(bookmarks))
    const expires = new Date()
    expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS)
    
    document.cookie = `${BOOKMARK_COOKIE_NAME}=${encoded}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  } catch (error) {
    console.error('Error saving bookmarks:', error)
  }
}

/**
 * Add a location to bookmarks
 */
export function addBookmark(location: Omit<BookmarkLocation, 'id' | 'bookmarkedAt'>): boolean {
  const bookmarks = getBookmarks()
  
  // Check if already bookmarked
  const exists = bookmarks.some(b => 
    b.lat === location.lat && b.lon === location.lon
  )
  
  if (exists) {
    return false
  }
  
  // Check max limit
  if (bookmarks.length >= MAX_BOOKMARKS) {
    console.warn(`Maximum ${MAX_BOOKMARKS} bookmarks reached`)
    return false
  }
  
  const newBookmark: BookmarkLocation = {
    ...location,
    id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookmarkedAt: Date.now()
  }
  
  bookmarks.unshift(newBookmark) // Add to beginning
  saveBookmarks(bookmarks)
  return true
}

/**
 * Remove a bookmark by ID
 */
export function removeBookmark(id: string): boolean {
  const bookmarks = getBookmarks()
  const filtered = bookmarks.filter(b => b.id !== id)
  
  if (filtered.length === bookmarks.length) {
    return false // Not found
  }
  
  saveBookmarks(filtered)
  return true
}

/**
 * Remove bookmark by coordinates
 */
export function removeBookmarkByCoords(lat: number, lon: number): boolean {
  const bookmarks = getBookmarks()
  const filtered = bookmarks.filter(b => 
    !(b.lat === lat && b.lon === lon)
  )
  
  if (filtered.length === bookmarks.length) {
    return false
  }
  
  saveBookmarks(filtered)
  return true
}

/**
 * Check if a location is bookmarked
 */
export function isBookmarked(lat: number, lon: number): boolean {
  const bookmarks = getBookmarks()
  return bookmarks.some(b => b.lat === lat && b.lon === lon)
}

/**
 * Clear all bookmarks
 */
export function clearAllBookmarks(): void {
  saveBookmarks([])
}

/**
 * Get bookmarks count
 */
export function getBookmarksCount(): number {
  return getBookmarks().length
}

/**
 * Export bookmarks as JSON
 */
export function exportBookmarks(): string {
  const bookmarks = getBookmarks()
  return JSON.stringify(bookmarks, null, 2)
}

/**
 * Import bookmarks from JSON
 */
export function importBookmarks(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as BookmarkLocation[]
    
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format')
    }
    
    // Validate structure
    const valid = imported.every(b => 
      typeof b.lat === 'number' && 
      typeof b.lon === 'number' && 
      typeof b.name === 'string'
    )
    
    if (!valid) {
      throw new Error('Invalid bookmark structure')
    }
    
    saveBookmarks(imported.slice(0, MAX_BOOKMARKS))
    return true
  } catch (error) {
    console.error('Error importing bookmarks:', error)
    return false
  }
}

/**
 * Get bookmarks sorted by distance from a point
 */
export function getBookmarksByProximity(
  centerLat: number, 
  centerLon: number
): BookmarkLocation[] {
  const bookmarks = getBookmarks()
  
  return bookmarks
    .map(b => ({
      ...b,
      distance: getDistance([centerLat, centerLon], [b.lat, b.lon])
    }))
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2
  
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}
