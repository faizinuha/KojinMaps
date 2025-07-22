"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Search, Menu, X, MapPin, Navigation, Layers, Settings, Wifi, WifiOff } from "lucide-react"
import SearchModal from "./SearchModal"
import InfoModal from "./InfoModal"
import LayersModal from "./LayersModal"
import SettingsModal from "./SettingsModal"
import NavigationModal from "./NavigationModal"
import Image from "next/image";
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading peta Jepang...</p>
      </div>
    </div>
  ),
})

interface LocationFilter {
  id: string
  name: string
  icon: string
  enabled: boolean
  color: string
  apiSource: string
}

interface LocationData {
  lat: number
  lon: number
  name: string
  type: string
  tags?: { [key: string]: string }
  source?: string
}

export default function JapanMap() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLayer, setActiveLayer] = useState("standard")
  const [isOnline, setIsOnline] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.6762, 139.6503])
  const [mapZoom, setMapZoom] = useState(13)

  // Modal states
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showLayersModal, setShowLayersModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNavigationModal, setShowNavigationModal] = useState(false)

  const [locationStats, setLocationStats] = useState({
    total: 0,
    area: "Tokyo",
    zoom: 13,
  })

  // Optimized filters with API sources
  const [filters, setFilters] = useState<LocationFilter[]>([
    {
      id: "toilets",
      name: "Toilet",
      icon: "🚻",
      enabled: true,
      color: "#3b82f6",
      apiSource: "overpass",
    },
    {
      id: "restaurants",
      name: "Restoran",
      icon: "🍜",
      enabled: false,
      color: "#ef4444",
      apiSource: "overpass",
    },
    {
      id: "convenience",
      name: "Konbini",
      icon: "🏪",
      enabled: false,
      color: "#10b981",
      apiSource: "overpass",
    },
    {
      id: "stations",
      name: "Stasiun",
      icon: "🚇",
      enabled: false,
      color: "#8b5cf6",
      apiSource: "overpass",
    },
    {
      id: "temples",
      name: "Kuil",
      icon: "⛩️",
      enabled: false,
      color: "#f59e0b",
      apiSource: "overpass",
    },
    {
      id: "parks",
      name: "Taman",
      icon: "🌳",
      enabled: false,
      color: "#22c55e",
      apiSource: "overpass",
    },
    {
      id: "banks",
      name: "Bank/ATM",
      icon: "🏦",
      enabled: false,
      color: "#06b6d4",
      apiSource: "overpass",
    },
    {
      id: "hospitals",
      name: "Rumah Sakit",
      icon: "🏥",
      enabled: false,
      color: "#ec4899",
      apiSource: "overpass",
    },
  ])

  // Memoized active filters for performance
  const activeFilters = useMemo(() => filters.filter((f) => f.enabled), [filters])

  const toggleFilter = useCallback((filterId: string) => {
    setFilters((prev) =>
      prev.map((filter) => (filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter)),
    )
  }, [])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        setShowSearchModal(true)
      }
    },
    [searchQuery],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleLocationSelect = useCallback((location: LocationData) => {
    setMapCenter([location.lat, location.lon])
    setMapZoom(16)
    setSelectedLocation(location)
    setShowSearchModal(false)
  }, [])

  const handleShowInfo = useCallback((location: LocationData) => {
    setSelectedLocation(location)
    setShowInfoModal(true)
  }, [])

  const handleShowRoute = useCallback((location: LocationData) => {
    setSelectedLocation(location)
    setShowNavigationModal(true)
  }, [])

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(coords)
          setMapCenter(coords)
          setMapZoom(15)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif dan izin lokasi diberikan.")
        },
      )
    } else {
      alert("Geolocation tidak didukung oleh browser Anda.")
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-50 shadow-sm">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-3">
         <Image
  src="/assets/logo/logo.png"
  alt="JapanMaps Logo"
  width={32}
  height={32}
/>
          <h1 className="text-xl font-semibold text-gray-900">JapanMaps</h1>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari tempat di seluruh Jepang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
            {isOnline ? <Wifi size={14} className="text-green-600" /> : <WifiOff size={14} className="text-red-600" />}
            <span className="text-xs text-gray-600">{isOnline ? "Online" : "Offline"}</span>
          </div>

          <button
            onClick={getCurrentLocation}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Lokasi Saya"
          >
            <Navigation size={18} />
          </button>
          <button
            onClick={() => setShowLayersModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Layer Peta"
          >
            <Layers size={18} />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Pengaturan"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Optimized Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-80" : "w-0"
          } overflow-hidden flex-shrink-0`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-6">
            
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Locatesion Filters
                </h3>
                <div className="space-y-3">
                  {filters.map((filter) => (
                    <label key={filter.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{filter.icon}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{filter.name}</span>
                          <div className="text-xs text-gray-500">via {filter.apiSource}</div>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filter.enabled}
                          onChange={() => toggleFilter(filter.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                            filter.enabled ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${
                              filter.enabled ? "translate-x-6" : "translate-x-1"
                            } mt-1`}
                          />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Aktif</h3>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${filter.color}20`,
                        color: filter.color,
                      }}
                    >
                      {filter.icon} {filter.name}
                    </span>
                  ))}
                  {activeFilters.length === 0 && <p className="text-sm text-gray-500 italic">Tidak ada filter aktif</p>}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistik</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lokasi ditemukan:</span>
                    <span className="font-semibold text-gray-900">{locationStats.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-semibold text-gray-900">{locationStats.area}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Zoom level:</span>
                    <span className="font-semibold text-gray-900">{locationStats.zoom}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Map Content */}
        <main className="flex-1 relative">
          <LeafletMap
            filters={activeFilters}
            activeLayer={activeLayer}
            searchQuery={searchQuery}
            onStatsUpdate={setLocationStats}
            onConnectionChange={setIsOnline}
            onLocationSelect={handleLocationSelect}
            onShowInfo={handleShowInfo}
            onShowRoute={handleShowRoute}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation}
          />
        </main>
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onLocationSelect={handleLocationSelect}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        location={selectedLocation}
        onShowRoute={handleShowRoute}
      />

      <LayersModal
        isOpen={showLayersModal}
        onClose={() => setShowLayersModal(false)}
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
      />

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      <NavigationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        destination={selectedLocation}
        userLocation={userLocation}
        onLocationUpdate={setUserLocation}
      />
    </div>
  )
}
