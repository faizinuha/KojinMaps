// Routing service for navigation

interface RouteInfo {
  distance: number // in meters
  duration: number // in minutes
  instructions: string[]
  coordinates: [number, number][]
}

// Calculate route between two points
export async function calculateRoute(
  start: [number, number],
  end: [number, number],
  mode: "driving" | "cycling" | "walking" = "driving",
): Promise<RouteInfo> {
  try {
    // Using OpenRouteService API (you can replace with your preferred routing service)
    // For demo purposes, we'll create a mock route
    const mockRoute = createMockRoute(start, end, mode)

    // In production, you would use a real routing API like:
    // - OpenRouteService
    // - Mapbox Directions API
    // - Google Directions API

    return mockRoute
  } catch (error) {
    console.error("Error calculating route:", error)
    throw new Error("Failed to calculate route")
  }
}

// Create mock route for demonstration
function createMockRoute(
  start: [number, number],
  end: [number, number],
  mode: "driving" | "cycling" | "walking",
): RouteInfo {
  // Calculate straight-line distance
  const distance = calculateDistance(start[0], start[1], end[0], end[1])

  // Estimate duration based on mode
  let speed: number // km/h
  switch (mode) {
    case "driving":
      speed = 40
      break
    case "cycling":
      speed = 15
      break
    case "walking":
      speed = 5
      break
  }

  const duration = (distance / 1000 / speed) * 60 // minutes

  // Generate mock instructions
  const instructions = generateMockInstructions(start, end, mode)

  // Generate mock coordinates (simplified route)
  const coordinates = generateMockCoordinates(start, end)

  return {
    distance: Math.round(distance),
    duration: Math.round(duration),
    instructions,
    coordinates,
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Generate mock turn-by-turn instructions
function generateMockInstructions(start: [number, number], end: [number, number], mode: string): string[] {
  const modeText =
    {
      driving: "berkendara",
      cycling: "bersepeda",
      walking: "berjalan kaki",
    }[mode] || "bergerak"

  const distance = calculateDistance(start[0], start[1], end[0], end[1])
  const distanceKm = (distance / 1000).toFixed(1)

  return [
    `Mulai ${modeText} dari lokasi Anda`,
    `Lanjutkan ${modeText} ke arah timur laut sejauh 500m`,
    `Belok kanan di persimpangan`,
    `Lanjutkan lurus sejauh ${distanceKm}km`,
    `Belok kiri menuju tujuan`,
    `Tiba di tujuan Anda`,
  ]
}

// Generate mock route coordinates
function generateMockCoordinates(start: [number, number], end: [number, number]): [number, number][] {
  const coordinates: [number, number][] = [start]

  // Add some intermediate points for a more realistic route
  const steps = 5
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps
    const lat = start[0] + (end[0] - start[0]) * ratio
    const lon = start[1] + (end[1] - start[1]) * ratio

    // Add some variation to make it look like a real route
    const variation = 0.001
    const varLat = lat + (Math.random() - 0.5) * variation
    const varLon = lon + (Math.random() - 0.5) * variation

    coordinates.push([varLat, varLon])
  }

  coordinates.push(end)
  return coordinates
}

// Get route instructions (for backward compatibility)
export async function getRouteInstructions(
  start: [number, number],
  end: [number, number],
  mode: "driving" | "cycling" | "walking" = "driving",
): Promise<string[]> {
  const route = await calculateRoute(start, end, mode)
  return route.instructions
}
