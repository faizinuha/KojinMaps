"use client";

import {
  addBookmark,
  isBookmarked,
  removeBookmarkByCoords,
} from "@/lib/bookmark-service";
import { getLocationDetails } from "@/lib/location-service";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface LocationData {
  lat: number;
  lon: number;
  name: string;
  type: string;
  tags?: { [key: string]: string };
  source?: string;
  address?: string;
  category?: string;
}

interface InfoPanelProps {
  location: LocationData | null;
  onClose: () => void;
  onShowRoute: (location: LocationData) => void;
  onShowCityView?: (location: LocationData) => void;
  className?: string;
}

interface LocationDetails {
  address: string;
  details: { [key: string]: string };
  extratags: { [key: string]: string };
  namedetails: { [key: string]: string };
}

export default function InfoPanel({
  location,
  onClose,
  onShowRoute,
  onShowCityView,
  className = "",
}: InfoPanelProps) {
  const [details, setDetails] = useState<LocationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      setError(null);
      setBookmarked(isBookmarked(location.lat, location.lon));
      setImageError(false);

      // Load detailed information
      getLocationDetails(location as LocationData)
        .then((data: LocationDetails) => setDetails(data))
        .catch((error) => {
          console.error("Error loading details:", error);
          setError("Gagal memuat detail lokasi");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location]);

  const handleToggleBookmark = () => {
    if (!location) return;

    if (bookmarked) {
      removeBookmarkByCoords(location.lat, location.lon);
      setBookmarked(false);
      toast.success("Bookmark dihapus");
    } else {
      const success = addBookmark({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        type: location.type,
        address: details?.address || location.address,
        tags: location.tags,
      });
      if (success) {
        setBookmarked(true);
        toast.success("Ditambahkan ke bookmark!");
      } else {
        toast.error("Gagal menambahkan bookmark");
      }
    }
  };

  const handleShare = async () => {
    if (!location) return;

    const shareData = {
      title: location.name,
      text: `Lihat lokasi ${location.name} di KojinMaps`,
      url: `${window.location.origin}?lat=${location.lat}&lon=${location.lon}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Berhasil dibagikan!");
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link disalin ke clipboard!");
    }
  };

  const handleCopyCoords = () => {
    if (!location) return;
    navigator.clipboard.writeText(
      `${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`
    );
    setCopied(true);
    toast.success("Koordinat disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInGoogleMaps = () => {
    if (!location) return;
    window.open(
      `https://maps.google.com/?q=${location.lat},${location.lon}`,
      "_blank"
    );
  };

  const handleShowRoute = () => {
    if (location) {
      onShowRoute(location);
    }
  };

  if (!location) return null;

  const getImageUrl = () => {
    if (location.tags?.image) return location.tags.image;
    if (location.tags?.wikimedia_commons) {
      const commons = location.tags.wikimedia_commons;
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${commons}?width=400`;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Image Header */}
      {imageUrl && !imageError ? (
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-500">
          <img
            src={imageUrl}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg"
          >
            <X size={16} className="text-gray-800" />
          </button>
        </div>
      ) : (
        <div className="relative h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/30" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg"
          >
            <X size={16} className="text-gray-800" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {location.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {location.category || location.type}
              </span>
              {location.tags?.rating && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                  <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">
                    {location.tags.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl transition-all ${
              bookmarked
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">
              Memuat informasi...
            </span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Address */}
            {(details?.address || location.address) && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin
                  size={18}
                  className="text-gray-400 flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 mb-1">Alamat</p>
                  <p className="font-medium text-sm text-gray-700">
                    {details?.address || location.address}
                  </p>
                </div>
              </div>
            )}

            {/* Coordinates with copy */}
            <button
              onClick={handleCopyCoords}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-2">
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
                <div className="text-left">
                  <p className="text-xs text-gray-600">Koordinat</p>
                  <p className="font-mono text-sm text-gray-700">
                    {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">
                {copied ? "Tersalin!" : "Salin"}
              </span>
            </button>

            {/* Phone */}
            {location.tags?.phone && (
              <a
                href={`tel:${location.tags.phone}`}
                className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <Phone size={18} className="text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 mb-1">Telepon</p>
                  <p className="font-medium text-sm text-green-700">
                    {location.tags.phone}
                  </p>
                </div>
              </a>
            )}

            {/* Website */}
            {location.tags?.website && (
              <a
                href={location.tags.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <Globe size={18} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 mb-1">Website</p>
                  <p className="font-medium text-sm text-blue-700 truncate">
                    {location.tags.website}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </a>
            )}

            {/* Opening Hours */}
            {location.tags?.opening_hours && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                <Clock
                  size={18}
                  className="text-purple-600 flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 mb-1">Jam Buka</p>
                  <p className="font-medium text-sm text-purple-700">
                    {location.tags.opening_hours}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Tags */}
            {location.tags && Object.keys(location.tags).length > 0 && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Informasi Tambahan
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(location.tags)
                    .filter(
                      ([key]) =>
                        ![
                          "name",
                          "opening_hours",
                          "phone",
                          "website",
                          "rating",
                          "image",
                          "wikimedia_commons",
                        ].includes(key)
                    )
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="px-2 py-1 bg-white rounded-lg text-xs border border-gray-200"
                      >
                        <span className="text-gray-500">
                          {key.replace(/_/g, " ")}:
                        </span>{" "}
                        <span className="text-gray-700 font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleShowRoute}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
          >
            <Navigation size={16} />
            <span className="text-xs font-medium">Rute</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Share2 size={16} />
            <span className="text-xs font-medium">Share</span>
          </button>
          <button
            onClick={handleOpenInGoogleMaps}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={16} />
            <span className="text-xs font-medium">Maps</span>
          </button>
          {onShowCityView && (
            <button
              onClick={() => {
                if (location && onShowCityView) {
                  onShowCityView(location);
                }
              }}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
            >
              <ImageIcon size={16} />
              <span className="text-xs font-medium">Lihat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
