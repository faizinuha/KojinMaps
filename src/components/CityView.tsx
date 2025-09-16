"use client"

import { useState, useEffect, useCallback } from "react"
import { Camera, Download, Map, MapPin, Globe, RefreshCw } from "lucide-react"
import Image from "next/image"

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

interface CityViewProps {
  location: LocationData | null
  className?: string
}

// Jenis tampilan yang tersedia
type ViewType = "satellite" | "map" | "streetview"

// Function to generate a reliable placeholder URL
const getReliablePlaceholderUrl = (location: LocationData, viewType: ViewType) => {
  return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(`${location.name} - ${viewType}`)}`
}

export default function CityView({ location, className = "" }: CityViewProps) {
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [viewType, setViewType] = useState<ViewType>("map")
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const loadImage = useCallback(async (location: LocationData, viewType: ViewType) => {
    setLoading(true)
    setError(null)
    setImageLoaded(false)

    try {
      // Langsung gunakan placeholder yang reliable
      const placeholderUrl = getReliablePlaceholderUrl(location, viewType)
      setImageUrl(placeholderUrl)
      setImageLoaded(true)
      setRetryCount(0)
    } catch (err) {
      console.warn("Error in loadImage:", err)
      // Fallback ke URL sederhana
      setImageUrl(`/placeholder.svg?height=400&width=600&query=${encodeURIComponent(location.name)}`)
      setError("Menggunakan gambar placeholder")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (location) {
      loadImage(location, viewType)
    }
  }, [location, viewType, loadImage])

  const handleRetry = useCallback(() => {
    if (location && retryCount < 3) {
      setRetryCount((prev) => prev + 1)
      loadImage(location, viewType)
    }
  }, [location, viewType, retryCount, loadImage])

  const handleImageError = useCallback(() => {
    if (location) {
      const fallbackUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(location.name)}`
      setImageUrl(fallbackUrl)
      setError("Menggunakan gambar placeholder")
      setImageLoaded(true)
      setLoading(false)
    }
  }, [location])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setLoading(false)
    setError(null)
  }, [])

  if (!location) {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <div className="p-4 text-center text-gray-500">Pilih lokasi untuk melihat gambaran kota</div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{location.name} - Gambaran Kota</h2>
        <p className="text-sm text-gray-600">
          Koordinat: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </p>
      </div>

      {/* View Type Selector */}
      <div className="bg-gray-100 p-2 flex justify-center space-x-2">
        <button
          onClick={() => setViewType("satellite")}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            viewType === "satellite" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Globe size={16} />
          Satelit
        </button>
        <button
          onClick={() => setViewType("map")}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            viewType === "map" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Map size={16} />
          Peta
        </button>
        <button
          onClick={() => setViewType("streetview")}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            viewType === "streetview" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          <MapPin size={16} />
          Street View
        </button>
      </div>

      {/* Image Content */}
      <div className="relative bg-gray-100" style={{ height: "300px" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <span className="text-gray-600">Memuat gambaran kota...</span>
          </div>
        ) : (
          <div className="relative h-full">
            <div className="absolute inset-0">
              <Image
                src={imageUrl || `/placeholder.svg?height=400&width=600&query=map`}
                alt={`Pemandangan ${viewType === "satellite" ? "satelit" : viewType === "map" ? "peta" : "street view"} ${location.name}`}
                fill
                className="object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized={true}
                priority={false}
              />
            </div>

            {/* Loading overlay */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error overlay */}
            {error && (
              <div className="absolute top-2 left-2 right-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  {retryCount < 3 && (
                    <button onClick={handleRetry} className="ml-2 p-1 hover:bg-yellow-200 rounded" title="Coba lagi">
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <p className="text-xs">
                <span className="font-medium">{location.name}</span> -
                {viewType === "satellite"
                  ? " Tampilan Satelit"
                  : viewType === "map"
                  ? " Tampilan Peta"
                    : " Street View"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-600">
            <Camera size={14} className="inline mr-1" />
            {imageUrl.includes("placeholder.svg") ? "Placeholder Image" : "Gambaran dari OpenStreetMap"}
          </div>
          <div className="flex gap-2">
            {retryCount < 3 && error && (
              <button
                className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs"
                onClick={handleRetry}
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>
            )}
            <button
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              onClick={() => window.open(imageUrl, "_blank")}
              disabled={loading}
            >
              <Download size={14} />
              Lihat Penuh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
