"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import { getLocationsByType, getCachedLocations, setCachedLocations } from "@/lib/osm"
import { X, MapPin, Clock, Phone, Globe, Navigation, Info } from "lucide-react"

// Fix Leaflet default markers
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
}

interface LocationFilter {
  id: string
  name: string
  icon: string
  enabled: boolean
  color: string
  apiSource: string
}

interface LeafletMapProps {
  filters: LocationFilter[]
  activeLayer: string
  searchQuery: string
  onStatsUpdate: (stats: { total: number; area: string; zoom: number }) => void
  onConnectionChange: (isOnline: boolean) => void
  onLocationSelect: (location: LocationData) => void
  onShowInfo: (location: LocationData) => void
  onShowRoute: (location: LocationData) => void
  mapCenter: [number, number]
  mapZoom: number
  userLocation: [number, number] | null
}

// Custom icons for different location types
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">${emoji}</div>`,
    className: "custom-div-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  })
}

// User location icon
const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -10px;
        left: -10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.2);
        animation: pulse 2s infinite;
      "></div>
    </div>`,
    className: "user-location-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Map layer updater component
function MapLayerUpdater({ activeLayer }: { activeLayer: string }) {
  const map = useMap()

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    let tileLayer: L.TileLayer

    switch (activeLayer) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            maxZoom: 19,
          },
        )
        break
      default:
        tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
    }

    tileLayer.addTo(map)
  }, [activeLayer, map])

  return null
}

// Map center updater
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

function ZoomControls() {
  const map = useMap()
  
  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col" style={{ pointerEvents: 'auto' }}>
      <button
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors border border-gray-200"
        onClick={() => {
          map.setZoom(map.getZoom() + 1)
        }}
        aria-label="Zoom in"
      >
        <span className="text-gray-700 text-2xl font-bold">+</span>
      </button>
      <button
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
        onClick={() => {
          map.setZoom(map.getZoom() - 1)
        }}
        aria-label="Zoom out"
      >
        <span className="text-gray-700 text-2xl font-bold">−</span>
      </button>
    </div>
  )
}

// Map events handler
function MapEventsHandler({
  onStatsUpdate,
  onConnectionChange,
}: {
  onStatsUpdate: (stats: { total: number; area: string; zoom: number }) => void
  onConnectionChange: (isOnline: boolean) => void
}) {
  const map = useMapEvents({
    zoomend: () => {
      onStatsUpdate({
        total: 0, // Will be updated by location loading
        area: getAreaName(map.getCenter()),
        zoom: map.getZoom(),
      })
    },
    moveend: () => {
      const center = map.getCenter()
      onStatsUpdate({
        total: 0,
        area: getAreaName(center),
        zoom: map.getZoom(),
      })
    },
  })

  useEffect(() => {
    const handleOnline = () => onConnectionChange(true)
    const handleOffline = () => onConnectionChange(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [onConnectionChange])

  return null
}

// Get area name based on coordinates
function getAreaName(center: L.LatLng): string {
  const lat = center.lat
  const lng = center.lng

  // Simple area detection for Japan
  if (lat > 35.5 && lat < 35.9 && lng > 139.3 && lng < 139.9) {
    return "Tokyo"
  } else if (lat > 34.9 && lat < 35.1 && lng > 135.6 && lng < 135.9) {
    return "Kyoto"
  } else if (lat > 34.6 && lat < 34.8 && lng > 135.4 && lng < 135.6) {
    return "Osaka"
  } else if (lat > 43.0 && lat < 43.2 && lng > 141.2 && lng < 141.5) {
    return "Sapporo"
  } else if (lat > 26.1 && lat < 26.3 && lng > 127.6 && lng < 127.8) {
    return "Okinawa"
  } else {
    return "Japan"
  }
}

export default function LeafletMap({
  filters,
  activeLayer,
  searchQuery,
  onStatsUpdate,
  onConnectionChange,
  onLocationSelect,
  onShowInfo,
  onShowRoute,
  mapCenter,
  mapZoom,
  userLocation,
}: LeafletMapProps) {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef<{ [key: string]: boolean }>({})
  const [selectedMarker, setSelectedMarker] = useState<LocationData | null>(null)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Optimized location loading with caching and debouncing
  const loadLocations = useCallback(
    async (filterList: LocationFilter[]) => {
      if (filterList.length === 0) {
        setLocations([])
        onStatsUpdate({ total: 0, area: "Japan", zoom: mapZoom })
        return
      }

      setLoading(true)
      const allLocations: LocationData[] = []

      // Dynamic bounds based on map center and zoom
      const bounds: [number, number, number, number] = [
        mapCenter[0] - 0.1,
        mapCenter[1] - 0.1,
        mapCenter[0] + 0.1,
        mapCenter[1] + 0.1,
      ]

      try {
        // Load locations in parallel with rate limiting
        const promises = filterList.map(async (filter) => {
          if (loadingRef.current[filter.id]) return []

          loadingRef.current[filter.id] = true

          try {
            // Check cache first
            const cacheKey = `${filter.id}-${bounds.join(",")}`
            const cached = getCachedLocations(cacheKey)
            if (cached && cached.length > 0) {
              return cached
            }

            let data: LocationData[] = []

            // Load from appropriate API based on source
            if (filter.apiSource === "overpass") {
              data = await getLocationsByType(filter.id, bounds)
            }

            // Cache the results
            if (data.length > 0) {
              setCachedLocations(cacheKey, data)
            }

            return data
          } catch (error) {
            console.error(`Error loading ${filter.id}:`, error)
            return []
          } finally {
            loadingRef.current[filter.id] = false
          }
        })

        const results = await Promise.all(promises)
        results.forEach((locationList) => {
          allLocations.push(...locationList)
        })

        setLocations(allLocations)
        onStatsUpdate({
          total: allLocations.length,
          area: getAreaName(L.latLng(mapCenter[0], mapCenter[1])),
          zoom: mapZoom,
        })
      } catch (error) {
        console.error("Error loading locations:", error)
      } finally {
        setLoading(false)
      }
    },
    [onStatsUpdate, mapCenter, mapZoom],
  )

  // Load locations when filters or map position changes
  useEffect(() => {
    if (isClient) {
      loadLocations(filters)
    }
  }, [filters, isClient, loadLocations, mapCenter])

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        <MapLayerUpdater activeLayer={activeLayer} />
        <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
        <MapEventsHandler onStatsUpdate={onStatsUpdate} onConnectionChange={onConnectionChange} />
        <ZoomControls />

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-lg mb-2">📍 Lokasi Anda</h3>
                <p className="text-xs text-gray-500">
                  Lat: {userLocation[0].toFixed(6)}, Lon: {userLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Location markers */}
        {locations.map((location, index) => {
          const filter = filters.find((f) => f.id === location.type)
          if (!filter) return null

          return (
            <Marker
              key={`${location.type}-${index}`}
              position={[location.lat, location.lon]}
              icon={createCustomIcon(filter.icon, filter.color)}
              eventHandlers={{
                click: () => {
                  setSelectedMarker(location)
                }
              }}
            />
          )
        })}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data lokasi...</p>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <div className="bg-white rounded-lg shadow-lg p-2 text-xs text-gray-600">
          <p>📍 {locations.length} lokasi</p>
          {userLocation && <p>🧭 GPS aktif</p>}
        </div>
      </div>

      {/* Zoom controls sudah dipindahkan ke dalam MapContainer */}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes slide-up {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>

      {/* Overlay to close panel when clicking outside */}
      {selectedMarker && (
        <div
          className="absolute inset-0 bg-transparent z-10"
          onClick={() => setSelectedMarker(null)}
        />
      )}
      
      {/* Bottom Info Panel (Google Maps style) */}
      {selectedMarker && (
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg overflow-hidden z-20 transition-all duration-300 transform animate-slide-up">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg mb-1">{selectedMarker.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedMarker.type} • {filters.find(f => f.id === selectedMarker.type)?.apiSource || 'overpass'}
                </p>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              {/* Coordinates */}
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm">
                  Lat: {selectedMarker.lat.toFixed(6)}, Lon: {selectedMarker.lon.toFixed(6)}
                </span>
              </div>

              {/* Tags */}
              {selectedMarker.tags?.opening_hours && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm">{selectedMarker.tags.opening_hours}</span>
                </div>
              )}
              
              {selectedMarker.tags?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <a href={`tel:${selectedMarker.tags.phone}`} className="text-sm text-blue-600 hover:underline">
                    {selectedMarker.tags.phone}
                  </a>
                </div>
              )}
              
              {selectedMarker.tags?.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-500" />
                  <a
                    href={selectedMarker.tags.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  onShowRoute(selectedMarker);
                  setSelectedMarker(null);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Navigation size={16} />
                <span>Rute</span>
              </button>
              <button
                onClick={() => {
                  onShowInfo(selectedMarker);
                  setSelectedMarker(null);
                }}
                className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Info size={16} />
                <span>Info Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
