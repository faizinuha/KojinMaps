"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Clock, Phone, Globe, Star, Navigation, Share2, Heart } from "lucide-react"
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

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  location: LocationData | null
  onShowRoute: (location: LocationData) => void
}

export default function InfoModal({ isOpen, onClose, location, onShowRoute }: InfoModalProps) {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (isOpen && location) {
      setLoading(true)
      setIsFav(isFavorite(location))

      // Load detailed information
      getLocationDetails(location)
        .then((data) => {
          setDetails(data)
        })
        .catch((error) => {
          console.error("Error loading details:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, location])

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
      onClose()
    }
  }

  if (!isOpen || !location) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{location.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {location.category || location.type} • {location.source}
              </p>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Memuat informasi...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Koordinat</p>
                  <p className="font-medium">
                    {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Address */}
              {details?.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium">{details.address}</p>
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {location.tags?.opening_hours && (
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Jam Buka</p>
                    <p className="font-medium">{location.tags.opening_hours}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {location.tags?.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <a href={`tel:${location.tags.phone}`} className="font-medium text-blue-600 hover:underline">
                      {location.tags.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {location.tags?.website && (
                <div className="flex items-start gap-3">
                  <Globe size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a
                      href={location.tags.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Kunjungi Website
                    </a>
                  </div>
                </div>
              )}

              {/* Additional Tags */}
              {location.tags && Object.keys(location.tags).length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Informasi Tambahan</p>
                  <div className="space-y-1">
                    {Object.entries(location.tags)
                      .filter(([key]) => !["name", "opening_hours", "phone", "website"].includes(key))
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Rating (mock) */}
              <div className="flex items-center gap-3">
                <Star size={20} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${star <= 4 ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShowRoute}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation size={16} />
              <span className="text-sm">Rute</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFav ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart size={16} className={isFav ? "fill-current" : ""} />
              <span className="text-sm">{isFav ? "Hapus" : "Favorit"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 size={16} />
              <span className="text-sm">Bagikan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
