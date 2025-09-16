"use client"

import { useState, useEffect } from "react"
import { X, Navigation, MapPin, Car, Bike, User, Loader2, AlertCircle } from "lucide-react"
import { calculateRoute } from "@/lib/routing-service"

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
}

interface NavigationPanelProps {
  onClose: () => void
  destination: LocationData | null
  userLocation: [number, number] | null
  onLocationUpdate: (location: [number, number]) => void
  className?: string
}

interface RouteInfo {
  distance: number
  duration: number
  instructions: string[]
  coordinates: [number, number][]
}

export default function NavigationPanel({
  onClose,
  destination,
  userLocation,
  onLocationUpdate,
  className = "",
}: NavigationPanelProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [transportMode, setTransportMode] = useState<"driving" | "cycling" | "walking">("driving")
  const [error, setError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          onLocationUpdate(coords)
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif dan izin lokasi diberikan.")
          setGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    } else {
      setError("Geolocation tidak didukung oleh browser Anda.")
    }
  }

  const loadRoute = async () => {
    if (!userLocation || !destination) return

    setLoading(true)
    setError(null)

    try {
      const route = await calculateRoute(userLocation, [destination.lat, destination.lon], transportMode)
      setRouteInfo(route)
    } catch (error) {
      console.error("Error calculating route:", error)
      setError("Gagal menghitung rute. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userLocation && destination) {
      loadRoute()
    }
  }, [userLocation, destination, transportMode, loadRoute])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} menit`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours} jam ${remainingMinutes} menit`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  if (!destination) return null

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">Navigasi</h2>
            <p className="text-sm text-gray-600 truncate">ke {destination.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Transport Mode Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Mode Transportasi</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTransportMode("driving")}
             className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                transportMode === "driving"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
             }`}
            >
              <Car size={20} />
              <span className="text-xs">Mobil</span>
            </button>
            <button
              onClick={() => setTransportMode("cycling")}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                transportMode === "cycling"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Bike size={20} />
              <span className="text-xs">Sepeda</span>
            </button>
            <button
              onClick={() => setTransportMode("walking")}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                transportMode === "walking"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <User size={20} />
              <span className="text-xs">Jalan</span>
            </button>
          </div>
        </div>

        {/* Location Status */}
        {!userLocation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 mb-2">Lokasi Anda diperlukan untuk navigasi</p>
                <button
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Navigation size={14} />
                  )}
                  {gettingLocation ? "Mencari..." : "Dapatkan Lokasi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="ml-2 text-gray-600">Menghitung rute...</span>
          </div>
        )}

        {/* Route Information */}
        {routeInfo && !loading && (
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700">Jarak Total</span>
                <span className="font-semibold text-blue-900">{formatDistance(routeInfo.distance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Estimasi Waktu</span>
                <span className="font-semibold text-blue-900">{formatDuration(routeInfo.duration)}</span>
              </div>
            </div>

            {/* Route Instructions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Petunjuk Arah</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {routeInfo.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Destination Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">{destination.name}</h4>
              <p className="text-sm text-gray-600">
                {destination.lat.toFixed(6)}, {destination.lon.toFixed(6)}
              </p>
              {destination.address && (
                <p className="text-xs text-gray-500 mt-1">{destination.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {routeInfo && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                // Open in Google Maps
                const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lon}&travelmode=${transportMode}`
                window.open(url, "_blank")
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Buka di Google Maps
            </button>
            <button
              onClick={() => {
                // Start navigation (mock)
                alert("Navigasi dimulai! (Fitur ini akan terintegrasi dengan GPS)")
                onClose()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Mulai Navigasi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}