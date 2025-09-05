"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, Phone, Globe, Star, Navigation, Share2, Heart, ImageIcon, X, Loader2 } from "lucide-react"
import { getLocationDetails, addToFavorites, removeFromFavorites, isFavorite } from "@/lib/location-service"

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

interface InfoPanelProps {
  location: LocationData | null
  onClose: () => void
  onShowRoute: (location: LocationData) => void
  onShowCityView?: (location: LocationData) => void
  className?: string
}

export default function InfoPanel({ location, onClose, onShowRoute, onShowCityView, className = "" }: InfoPanelProps) {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (location) {
      setLoading(true)
      setError(null)
      setIsFav(isFavorite(location))

      // Load detailed information
      getLocationDetails(location)
        .then((data) => {
          setDetails(data)
        })
        .catch((error) => {
          console.error("Error loading details:", error)
          setError("Gagal memuat detail lokasi")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [location])

  const handleToggleFavorite = () => {
    if (!location) return

    if (isFav) {
      removeFromFavorites(location)
      setIsFav(false)
    } else {
      addToFavorites(location)
      setIsFav(true)
    }
  }

  const handleShare = async () => {
    if (!location) return

    const shareData = {
      title: location.name,
      text: `Lihat lokasi ${location.name} di JapanMaps`,
      url: `${window.location.origin}?lat=${location.lat}&lon=${location.lon}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url)
      alert("Link telah disalin ke clipboard!")
    }
  }

  const handleShowRoute = () => {
    if (location) {
      onShowRoute(location)
    }
  }

  if (!location) return null

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header with Japanese style */}
      <div className="p-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{location.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {location.category || location.type} • {location.source}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-50 rounded-full transition-colors ml-2 flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} className="text-red-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin h-6 w-6 text-red-600" />
            <span className="ml-2 text-sm text-gray-600">Memuat informasi...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Basic Info */}
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-red-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600">Koordinat</p>
                <p className="font-medium text-sm">
                  {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Address */}
            {details?.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600">Alamat</p>
                  <p className="font-medium text-sm">{details.address}</p>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {location.tags?.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-green-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600">Jam Buka</p>
                  <p className="font-medium text-sm">{location.tags.opening_hours}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {location.tags?.phone && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-purple-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600">Telepon</p>
                  <a href={`tel:${location.tags.phone}`} className="font-medium text-sm text-red-600 hover:underline">
                    {location.tags.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {location.tags?.website && (
              <div className="flex items-start gap-3">
                <Globe size={18} className="text-red-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600">Website</p>
                  <a
                    href={location.tags.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm text-red-600 hover:underline"
                  >
                    Kunjungi Website
                  </a>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg">
              <Star size={18} className="text-yellow-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600">Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = Number.parseFloat(location.tags?.rating || "4.0")
                    return (
                      <Star
                        key={star}
                        size={14}
                        className={`${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                      />
                    )
                  })}
                  <span className="text-xs text-gray-600 ml-1">({location.tags?.rating || "4.0"})</span>
                </div>
              </div>
            </div>

            {/* Additional Tags */}
            {location.tags && Object.keys(location.tags).length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Informasi Tambahan</p>
                <div className="space-y-1">
                  {Object.entries(location.tags)
                    .filter(([key]) => !["name", "opening_hours", "phone", "website", "rating"].includes(key))
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="font-medium truncate ml-2">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-red-100 bg-gradient-to-r from-white to-red-50">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={handleShowRoute}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Navigation size={14} />
            <span className="text-xs">Rute</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isFav ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart size={14} className={isFav ? "fill-current" : ""} />
            <span className="text-xs">{isFav ? "Hapus" : "Favorit"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 size={14} />
            <span className="text-xs">Bagikan</span>
          </button>
          {onShowCityView && (
            <button
              onClick={() => {
                if (location && onShowCityView) {
                  onShowCityView(location)
                }
              }}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ImageIcon size={14} />
              <span className="text-xs">Lihat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}