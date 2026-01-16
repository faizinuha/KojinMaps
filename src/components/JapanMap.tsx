"use client";

import {
  Bookmark,
  MapPin,
  Menu,
  Navigation,
  Search,
  Settings,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import BookmarksPanel from "./BookmarksPanel";
import CityView from "./CityView";
import InfoPanel from "./InfoPanel";
import LayersPanel from "./LayersPanel";
import MobileOnboarding from "./MobileOnboarding";
import NavigationPanel from "./NavigationPanel";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";
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
});

interface LocationFilter {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  color: string;
  apiSource: string;
}

interface LocationData {
  lat: number;
  lon: number;
  name: string;
  type: string;
  tags?: { [key: string]: string };
  source?: string;
  address?: string;
}

export default function JapanMap() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState("standard");
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    35.6762, 139.6503,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  // Modal states - mengurangi yang tidak diperlukan
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);

  // State untuk menampilkan info panel
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showCityView, setShowCityView] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const [locationStats, setLocationStats] = useState({
    total: 0,
    area: "Tokyo",
    zoom: 13,
  });

  // Optimized filters with API sources - EXPANDED
  const [filters, setFilters] = useState<LocationFilter[]>([
    {
      id: "toilets",
      name: "Toilet",
      icon: "🚻",
      enabled: false,
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
      id: "cafes",
      name: "Kafe",
      icon: "☕",
      enabled: false,
      color: "#92400e",
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
      id: "shrines",
      name: "Kuil Shinto",
      icon: "⛩️",
      enabled: false,
      color: "#dc2626",
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
      name: "Bank",
      icon: "🏦",
      enabled: false,
      color: "#06b6d4",
      apiSource: "overpass",
    },
    {
      id: "atms",
      name: "ATM",
      icon: "💳",
      enabled: false,
      color: "#0891b2",
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
    {
      id: "pharmacies",
      name: "Apotek",
      icon: "💊",
      enabled: false,
      color: "#be123c",
      apiSource: "overpass",
    },
    {
      id: "hotels",
      name: "Hotel",
      icon: "🏨",
      enabled: false,
      color: "#7c3aed",
      apiSource: "overpass",
    },
    {
      id: "museums",
      name: "Museum",
      icon: "🏛️",
      enabled: false,
      color: "#4338ca",
      apiSource: "overpass",
    },
    {
      id: "viewpoints",
      name: "Pemandangan",
      icon: "🌄",
      enabled: false,
      color: "#ea580c",
      apiSource: "overpass",
    },
  ]);

  // Memoized active filters for performance
  const activeFilters = useMemo(
    () => filters.filter((f) => f.enabled),
    [filters]
  );

  // Check if map center is within Japan bounds roughly
  const isJapanArea = (lat: number, lon: number) => {
    return lat >= 24 && lat <= 46 && lon >= 122 && lon <= 154;
  };

  const toggleFilter = useCallback(
    (filterId: string) => {
      setFilters((prev) => {
        const nextFilters = prev.map((filter) =>
          filter.id === filterId
            ? { ...filter, enabled: !filter.enabled }
            : filter
        );

        // Auto navigate to Japan (Tokyo) if activating a filter and not currently in Japan
        const targetFilter = nextFilters.find((f) => f.id === filterId);
        if (targetFilter?.enabled) {
          if (!isJapanArea(mapCenter[0], mapCenter[1])) {
            setMapCenter([35.6762, 139.6503]); // Tokyo
            setMapZoom(13);
          }
        }

        return nextFilters;
      });
    },
    [mapCenter]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowSearchPanel(true);
      }
    },
    [searchQuery]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleLocationSelect = useCallback((location: LocationData) => {
    setMapCenter([location.lat, location.lon]);
    setMapZoom(16);
    setSelectedLocation(location);
    setShowSearchPanel(false);
    setShowInfoPanel(true);
    setShowCityView(false);
  }, []);

  const handleShowInfo = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    setShowInfoPanel(true);
    setShowCityView(false);
  }, []);

  const handleShowCityView = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    setShowInfoPanel(false);
    setShowCityView(true);
  }, []);

  const handleShowRoute = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    setShowNavigationPanel(true);
  }, []);

  const handleCloseInfoPanel = useCallback(() => {
    setShowInfoPanel(false);
    setSelectedLocation(null);
    setShowCityView(false);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(15);
      },
      (error) => {
        const errorMessage = "Tidak dapat mengakses lokasi Anda.";
        console.warn("Geolocation error:", error.code, error.message);
        alert(errorMessage);
      },
      options
    );
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Mobile Onboarding */}
      <MobileOnboarding onComplete={() => setOnboardingComplete(true)} />

      {/* Panels (Overlays/Modals) */}
      <BookmarksPanel
        isOpen={showBookmarksPanel}
        onClose={() => setShowBookmarksPanel(false)}
        onLocationSelect={(lat, lon, name) => {
          setMapCenter([lat, lon]);
          setMapZoom(16);
          setSelectedLocation({ lat, lon, name, type: "bookmark" });
          setShowInfoPanel(true);
        }}
        currentPosition={userLocation || undefined}
      />

      {/* Settings Sidebar (Right) */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showSettingsPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {showSettingsPanel && (
          <SettingsPanel
            onClose={() => setShowSettingsPanel(false)}
            className="h-full"
          />
        )}
      </div>

      {/* Overlay for Settings */}
      {showSettingsPanel && (
        <div
          className="fixed inset-0 bg-black/20 z-[55]"
          onClick={() => setShowSettingsPanel(false)}
        />
      )}

      {/* Search Panel Overlay (jika search bar di header diklik) */}
      {showSearchPanel && (
        <div className="absolute top-16 left-4 z-50 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Hasil Pencarian</h3>
            <button onClick={() => setShowSearchPanel(false)}>
              <X size={16} />
            </button>
          </div>
          <SearchPanel
            onClose={() => setShowSearchPanel(false)}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            className=""
          />
        </div>
      )}

      <div className="h-screen flex flex-col bg-white overflow-hidden relative">
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
            {/* Logo */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-red-50 flex items-center justify-center border border-red-100">
              <span className="text-xl">🗾</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              KojinMaps
            </h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari tempat (misal: Tokyo Tower)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchPanel(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                isOnline
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="text-xs font-medium hidden sm:inline">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <button
              onClick={getCurrentLocation}
              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors duration-200"
              title="Lokasi Saya"
            >
              <Navigation size={20} />
            </button>
            <button
              onClick={() => setShowBookmarksPanel(true)}
              className="p-2 hover:bg-pink-50 text-pink-600 rounded-lg transition-colors duration-200"
              title="Bookmark"
            >
              <Bookmark size={20} />
            </button>
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors duration-200"
              title="Pengaturan"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Sidebar (Filters & Info) */}
          <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "w-80" : "w-0"
            } overflow-hidden flex-shrink-0 flex flex-col`}
          >
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Info Panel replaced SearchPanel here */}
                {showInfoPanel && selectedLocation ? (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Detail Lokasi
                      </h3>
                      <button
                        onClick={handleCloseInfoPanel}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <InfoPanel
                      location={selectedLocation}
                      onClose={handleCloseInfoPanel}
                      onShowRoute={handleShowRoute}
                      onShowCityView={handleShowCityView}
                      className="shadow-sm border-gray-200"
                    />
                  </div>
                ) : showCityView && selectedLocation ? (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">City View</h3>
                      <button
                        onClick={handleCloseInfoPanel}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <CityView location={selectedLocation} />
                  </div>
                ) : showNavigationPanel ? (
                  <div className="mb-6">
                    <NavigationPanel
                      onClose={() => setShowNavigationPanel(false)}
                      destination={selectedLocation}
                      userLocation={userLocation}
                      onLocationUpdate={setUserLocation}
                    />
                  </div>
                ) : null}

                {/* Location Filters */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <MapPin size={14} />
                    Filter Lokasi
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filters.map((filter) => (
                      <label
                        key={filter.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          filter.enabled
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{filter.icon}</span>
                          <div>
                            <span
                              className={`text-sm font-medium ${
                                filter.enabled
                                  ? "text-blue-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {filter.name}
                            </span>
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
                            className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                              filter.enabled ? "bg-blue-600" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${
                                filter.enabled
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              } mt-1`}
                            />
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Statistik Peta
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Lokasi</span>
                      <span className="font-mono font-medium text-gray-900">
                        {locationStats.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Area</span>
                      <span className="font-medium text-gray-900">
                        {locationStats.area}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Zoom</span>
                      <span className="font-mono font-medium text-gray-900">
                        {locationStats.zoom}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Map Content */}
          <main className="flex-1 relative h-full w-full">
            <LeafletMap
              filters={activeFilters}
              activeLayer={activeLayer}
              searchQuery={searchQuery}
              onStatsUpdate={setLocationStats}
              onConnectionChange={setIsOnline}
              onLocationSelect={handleLocationSelect}
              onShowInfo={handleShowInfo}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              userLocation={userLocation}
            />

            {/* Layers Control Floating Button (moved from header/sidebar) */}
            {showLayersPanel && (
              <div className="absolute bottom-24 right-4 z-[40]">
                <LayersPanel
                  onClose={() => setShowLayersPanel(false)}
                  activeLayer={activeLayer}
                  onLayerChange={setActiveLayer}
                  className="shadow-xl border-gray-200 w-64"
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
