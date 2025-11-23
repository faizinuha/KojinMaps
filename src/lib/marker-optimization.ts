// Marker clustering and optimization utilities

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
}

interface ClusterConfig {
  maxMarkersPerType: number  // Maximum markers to show per location type
  minZoomForAll: number      // Minimum zoom level to show all markers
  clusterRadius: number      // Radius in pixels to cluster markers
}

const DEFAULT_CONFIG: ClusterConfig = {
  maxMarkersPerType: 50,     // Limit to 50 markers per type
  minZoomForAll: 15,         // Show all markers only at zoom 15+
  clusterRadius: 60,         // 60px cluster radius
}

/**
 * Limits the number of markers per location type to prevent performance issues
 * Prioritizes markers closer to the map center
 */
export function limitMarkersByProximity(
  locations: LocationData[],
  mapCenter: [number, number],
  maxPerType: number = DEFAULT_CONFIG.maxMarkersPerType
): LocationData[] {
  // Group by type
  const byType = new Map<string, LocationData[]>()
  
  locations.forEach(loc => {
    if (!byType.has(loc.type)) {
      byType.set(loc.type, [])
    }
    byType.get(loc.type)!.push(loc)
  })

  // Limit each type and sort by distance to center
  const limited: LocationData[] = []
  
  byType.forEach((locs, type) => {
    // Calculate distance to center for each location
    const withDistance = locs.map(loc => ({
      location: loc,
      distance: getDistance(mapCenter, [loc.lat, loc.lon])
    }))

    // Sort by distance and take the closest ones
    withDistance.sort((a, b) => a.distance - b.distance)
    
    const limitedLocs = withDistance
      .slice(0, maxPerType)
      .map(item => item.location)
    
    limited.push(...limitedLocs)
  })

  return limited
}

/**
 * Filters markers based on zoom level
 * At lower zoom levels, show fewer markers to improve performance
 */
export function filterByZoomLevel(
  locations: LocationData[],
  zoom: number
): LocationData[] {
  if (zoom >= DEFAULT_CONFIG.minZoomForAll) {
    return locations
  }

  // Progressive loading based on zoom
  let maxPerType: number
  
  if (zoom >= 14) {
    maxPerType = 50
  } else if (zoom >= 13) {
    maxPerType = 30
  } else if (zoom >= 12) {
    maxPerType = 20
  } else if (zoom >= 11) {
    maxPerType = 10
  } else {
    maxPerType = 5
  }

  // Group by type and limit
  const byType = new Map<string, LocationData[]>()
  
  locations.forEach(loc => {
    if (!byType.has(loc.type)) {
      byType.set(loc.type, [])
    }
    const typeArray = byType.get(loc.type)!
    if (typeArray.length < maxPerType) {
      typeArray.push(loc)
    }
  })

  const result: LocationData[] = []
  byType.forEach(locs => result.push(...locs))
  
  return result
}

/**
 * Simple clustering algorithm
 * Groups nearby markers into clusters
 */
export function clusterMarkers(
  locations: LocationData[],
  zoom: number,
  pixelRadius: number = DEFAULT_CONFIG.clusterRadius
): Array<LocationData | { cluster: true; count: number; lat: number; lon: number; locations: LocationData[] }> {
  // Don't cluster at high zoom levels
  if (zoom >= 16) {
    return locations
  }

  const clusters: Array<LocationData | { cluster: true; count: number; lat: number; lon: number; locations: LocationData[] }> = []
  
  const unclustered = [...locations]
  const processed = new Set<number>()

  for (let i = 0; i < unclustered.length; i++) {
    if (processed.has(i)) continue

    const current = unclustered[i]
    const nearby: LocationData[] = [current]
    processed.add(i)

    // Find nearby markers
    for (let j = i + 1; j < unclustered.length; j++) {
      if (processed.has(j)) continue

      const distance = getDistance(
        [current.lat, current.lon],
        [unclustered[j].lat, unclustered[j].lon]
      )

      // Cluster if within radius (approximate pixel distance)
      const pixelDistance = distance * 111000 / (156543.03392 * Math.cos(current.lat * Math.PI / 180) / Math.pow(2, zoom))
      
      if (pixelDistance < pixelRadius) {
        nearby.push(unclustered[j])
        processed.add(j)
      }
    }

    // Create cluster if multiple markers
    if (nearby.length > 1) {
      const avgLat = nearby.reduce((sum, loc) => sum + loc.lat, 0) / nearby.length
      const avgLon = nearby.reduce((sum, loc) => sum + loc.lon, 0) / nearby.length

      clusters.push({
        cluster: true,
        count: nearby.length,
        lat: avgLat,
        lon: avgLon,
        locations: nearby
      })
    } else {
      clusters.push(current)
    }
  }

  return clusters
}

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
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

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: null[]) => null>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: null[]) => null>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
