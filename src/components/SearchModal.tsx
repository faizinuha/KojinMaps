"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, MapPin, Clock, Star } from "lucide-react"
import { searchLocationJapan, getPopularPlaces, searchHistory } from "@/lib/search-service"

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

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: LocationData) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export default function SearchModal({
  isOpen,
  onClose,
  onLocationSelect,
  searchQuery,
  onSearchQueryChange,
}: SearchModalProps) {
  const [results, setResults] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(false)
  const [popularPlaces, setPopularPlaces] = useState<LocationData[]>([])
  const [history, setHistory] = useState<LocationData[]>([])
  const [activeTab, setActiveTab] = useState<"search" | "popular" | "history">("search")

  // Load popular places and history on mount
  useEffect(() => {
    if (isOpen) {
      setPopularPlaces(getPopularPlaces())
      setHistory(searchHistory.getHistory())
    }
  }, [isOpen])

  // Search function with debouncing
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults = await searchLocationJapan(query)
      setResults(searchResults)
      setActiveTab("search")
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  const handleLocationClick = (location: LocationData) => {
    searchHistory.addToHistory(location)
    onLocationSelect(location)
    onClose()
  }

  const clearHistory = () => {
    searchHistory.clearHistory()
    setHistory([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari tempat di seluruh Jepang..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "search" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Hasil Pencarian ({results.length})
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "popular" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Populer
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "history" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Mencari...</span>
            </div>
          )}

          {/* Search Results */}
          {activeTab === "search" && !loading && (
            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationClick(location)}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{location.name}</h3>
                        {location.address && <p className="text-sm text-gray-600 truncate">{location.address}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {location.category || location.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada hasil untuk {searchQuery}</p>
                  <p className="text-sm mt-1">Coba kata kunci lain atau periksa ejaan</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Mulai mengetik untuk mencari lokasi</p>
                  <p className="text-sm mt-1">Contoh: Tokyo Station, Shibuya, Kyoto</p>
                </div>
              )}
            </div>
          )}

          {/* Popular Places */}
          {activeTab === "popular" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Tempat Populer di Jepang</span>
              </div>
              {popularPlaces.map((location, index) => (
                <div
                  key={index}
                  onClick={() => handleLocationClick(location)}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Star size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1 inline-block">
                        {location.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Riwayat Pencarian</span>
                </div>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700">
                    Hapus Semua
                  </button>
                )}
              </div>
              {history.length > 0 ? (
                history.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationClick(location)}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-gray-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Belum ada riwayat pencarian</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
