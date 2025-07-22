"use client"

import { useState } from "react"
import { X, Settings, Globe, Moon, Sun, Volume2, VolumeX, Navigation } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [language, setLanguage] = useState("id")
  const [theme, setTheme] = useState("light")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoLocation, setAutoLocation] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
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
        <div className="p-4 space-y-6">
          {/* Language Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} className="text-gray-600" />
              <h3 className="font-medium text-gray-900">Bahasa</h3>
            </div>
            <div className="space-y-2">
              {[
                { id: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
                { id: "ja", name: "日本語", flag: "🇯🇵" },
                { id: "en", name: "English", flag: "🇺🇸" },
              ].map((lang) => (
                <label key={lang.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.id}
                    checked={language === lang.id}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm text-gray-700">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {theme === "light" ? (
                <Sun size={18} className="text-gray-600" />
              ) : (
                <Moon size={18} className="text-gray-600" />
              )}
              <h3 className="font-medium text-gray-900">Tema</h3>
            </div>
            <div className="space-y-2">
              {[
                { id: "light", name: "Terang", icon: Sun },
                { id: "dark", name: "Gelap", icon: Moon },
              ].map((themeOption) => {
                const IconComponent = themeOption.icon
                return (
                  <label key={themeOption.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={themeOption.id}
                      checked={theme === themeOption.id}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <IconComponent size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">{themeOption.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 size={18} className="text-gray-600" />
                ) : (
                  <VolumeX size={18} className="text-gray-600" />
                )}
                <h3 className="font-medium text-gray-900">Suara Navigasi</h3>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    soundEnabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${
                      soundEnabled ? "translate-x-6" : "translate-x-1"
                    } mt-1`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto Location */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={18} className="text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Auto Lokasi</h3>
                  <p className="text-xs text-gray-600">Deteksi lokasi otomatis saat membuka aplikasi</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoLocation}
                  onChange={(e) => setAutoLocation(e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => setAutoLocation(!autoLocation)}
                  className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    autoLocation ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${
                      autoLocation ? "translate-x-6" : "translate-x-1"
                    } mt-1`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-900">JapanMaps</p>
              <p className="text-xs text-gray-600">Versi 1.0.0</p>
              <p className="text-xs text-gray-500">© 2024 JapanMaps Team</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Save settings
              localStorage.setItem(
                "japanmaps-settings",
                JSON.stringify({
                  language,
                  theme,
                  soundEnabled,
                  autoLocation,
                }),
              )
              alert("Pengaturan telah disimpan!")
              onClose()
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  )
}
