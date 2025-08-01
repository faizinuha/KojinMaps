"use client"

import { useState, useEffect } from "react"
import { 
  X, Settings, Globe, Moon, Sun, Volume2, VolumeX, Navigation, 
  Wifi, Database, Download, Trash2, RefreshCw, Shield, 
  Bell, BellOff, Smartphone, Monitor, Palette, MapPin,
  Clock, Languages, HelpCircle, Info
} from "lucide-react"

interface SettingsPanelProps {
  onClose: () => void
  className?: string
}

interface AppSettings {
  language: string
  theme: string
  soundEnabled: boolean
  autoLocation: boolean
  notifications: boolean
  offlineMode: boolean
  dataUsage: string
  mapQuality: string
  autoSync: boolean
  locationAccuracy: string
  units: string
  timeFormat: string
}

export default function SettingsPanel({ onClose, className = "" }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>({
    language: "id",
    theme: "light",
    soundEnabled: true,
    autoLocation: false,
    notifications: true,
    offlineMode: false,
    dataUsage: "normal",
    mapQuality: "high",
    autoSync: true,
    locationAccuracy: "high",
    units: "metric",
    timeFormat: "24h"
  })

  const [cacheSize, setCacheSize] = useState("0 MB")
  const [offlineAreas, setOfflineAreas] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("japanmaps-settings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }

    // Calculate cache size
    calculateCacheSize()

    // Load offline areas
    const areas = localStorage.getItem("japanmaps-offline-areas")
    if (areas) {
      setOfflineAreas(JSON.parse(areas))
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const calculateCacheSize = () => {
    // Calculate approximate cache size
    let totalSize = 0
    for (let key in localStorage) {
      if (key.startsWith('japanmaps-')) {
        totalSize += localStorage[key].length
      }
    }
    setCacheSize(`${(totalSize / 1024 / 1024).toFixed(1)} MB`)
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("japanmaps-settings", JSON.stringify(newSettings))
  }

  const clearCache = () => {
    if (confirm("Hapus semua data cache? Ini akan menghapus data offline dan riwayat.")) {
      for (let key in localStorage) {
        if (key.startsWith('japanmaps-cache-') || key.startsWith('japanmaps-offline-')) {
          localStorage.removeItem(key)
        }
      }
      calculateCacheSize()
      alert("Cache berhasil dihapus!")
    }
  }

  const clearAllData = () => {
    if (confirm("Hapus SEMUA data aplikasi? Ini akan menghapus pengaturan, favorit, riwayat, dan data offline.")) {
      for (let key in localStorage) {
        if (key.startsWith('japanmaps-')) {
          localStorage.removeItem(key)
        }
      }
      // Reset to default settings
      setSettings({
        language: "id",
        theme: "light",
        soundEnabled: true,
        autoLocation: false,
        notifications: true,
        offlineMode: false,
        dataUsage: "normal",
        mapQuality: "high",
        autoSync: true,
        locationAccuracy: "high",
        units: "metric",
        timeFormat: "24h"
      })
      calculateCacheSize()
      alert("Semua data berhasil dihapus!")
    }
  }

  const downloadOfflineArea = () => {
    alert("Fitur download area offline akan segera tersedia!")
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify({
      settings,
      favorites: localStorage.getItem("japanmaps-favorites"),
      history: localStorage.getItem("japanmaps-search-history")
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'japanmaps-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${
            checked ? "translate-x-6" : "translate-x-1"
          } mt-1`}
        />
      </div>
    </div>
  )

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pengaturan</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-6">
        {/* Connection Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isOnline ? <Wifi size={16} className="text-green-600" /> : <Wifi size={16} className="text-red-600" />}
            <span className="font-medium text-sm">Status Koneksi</span>
          </div>
          <p className="text-sm text-gray-600">
            {isOnline ? "Online - Semua fitur tersedia" : "Offline - Mode terbatas aktif"}
          </p>
        </div>

        {/* Language Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Languages size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Bahasa & Lokalisasi</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Bahasa Interface</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="id">🇮🇩 Bahasa Indonesia</option>
                <option value="ja">🇯🇵 日本語</option>
                <option value="en">🇺🇸 English</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Satuan Pengukuran</label>
              <select
                value={settings.units}
                onChange={(e) => updateSetting("units", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="metric">Metrik (km, m)</option>
                <option value="imperial">Imperial (mil, ft)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Format Waktu</label>
              <select
                value={settings.timeFormat}
                onChange={(e) => updateSetting("timeFormat", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="24h">24 Jam (14:30)</option>
                <option value="12h">12 Jam (2:30 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Tampilan</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tema</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", name: "Terang", icon: Sun },
                  { id: "dark", name: "Gelap", icon: Moon },
                ].map((theme) => {
                  const IconComponent = theme.icon
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting("theme", theme.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        settings.theme === theme.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent size={16} />
                      <span className="text-sm">{theme.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Kualitas Peta</label>
              <select
                value={settings.mapQuality}
                onChange={(e) => updateSetting("mapQuality", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="low">Rendah (hemat data)</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi (detail maksimal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Lokasi & Navigasi</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Auto Lokasi</p>
                <p className="text-xs text-gray-600">Deteksi lokasi otomatis saat membuka aplikasi</p>
              </div>
              <ToggleSwitch
                checked={settings.autoLocation}
                onChange={(checked) => updateSetting("autoLocation", checked)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Akurasi Lokasi</label>
              <select
                value={settings.locationAccuracy}
                onChange={(e) => updateSetting("locationAccuracy", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="low">Rendah (hemat baterai)</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi (GPS presisi)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Suara Navigasi</p>
                <p className="text-xs text-gray-600">Panduan suara saat navigasi</p>
              </div>
              <ToggleSwitch
                checked={settings.soundEnabled}
                onChange={(checked) => updateSetting("soundEnabled", checked)}
              />
            </div>
          </div>
        </div>

        {/* Data & Storage */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Data & Penyimpanan</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Penggunaan Data</label>
              <select
                value={settings.dataUsage}
                onChange={(e) => updateSetting("dataUsage", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="low">Hemat Data</option>
                <option value="normal">Normal</option>
                <option value="unlimited">Tidak Terbatas</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Mode Offline</p>
                <p className="text-xs text-gray-600">Gunakan data tersimpan saat offline</p>
              </div>
              <ToggleSwitch
                checked={settings.offlineMode}
                onChange={(checked) => updateSetting("offlineMode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Sinkronisasi Otomatis</p>
                <p className="text-xs text-gray-600">Sinkronkan data saat online</p>
              </div>
              <ToggleSwitch
                checked={settings.autoSync}
                onChange={(checked) => updateSetting("autoSync", checked)}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cache Tersimpan</span>
                <span className="text-sm text-gray-600">{cacheSize}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCache}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                >
                  <RefreshCw size={12} />
                  Bersihkan Cache
                </button>
                <button
                  onClick={downloadOfflineArea}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  <Download size={12} />
                  Download Area
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Notifikasi</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Notifikasi Push</p>
                <p className="text-xs text-gray-600">Terima notifikasi dari aplikasi</p>
              </div>
              <ToggleSwitch
                checked={settings.notifications}
                onChange={(checked) => updateSetting("notifications", checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Privasi & Keamanan</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
              Kebijakan Privasi
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
              Syarat & Ketentuan
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
              Kelola Data Pribadi
            </button>
          </div>
        </div>

        {/* Backup & Export */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Download size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Backup & Export</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={exportSettings}
              className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download size={14} />
              Export Pengaturan & Data
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
              <RefreshCw size={14} />
              Import Data
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 size={18} className="text-red-600" />
            <h3 className="font-medium text-red-900">Zona Berbahaya</h3>
          </div>
          <button
            onClick={clearAllData}
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <Trash2 size={14} />
            Hapus Semua Data
          </button>
          <p className="text-xs text-red-600 mt-1 text-center">
            Tindakan ini tidak dapat dibatalkan
          </p>
        </div>

        {/* App Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Informasi Aplikasi</span>
            </div>
            <p className="text-sm font-medium text-gray-900">JapanMaps</p>
            <p className="text-xs text-gray-600">Versi 1.0.0 (Build 2024.01)</p>
            <p className="text-xs text-gray-500">© 2024 JapanMaps Team</p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-blue-600">
              <button className="hover:underline">Bantuan</button>
              <button className="hover:underline">Feedback</button>
              <button className="hover:underline">Rating</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}